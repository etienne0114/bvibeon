const axios = require('axios');
const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const translatorIntegrationService = require('./translator/translatorIntegrationService');

/**
 * Dictionary Service
 * Provides word definitions, translations, and vocabulary management
 * Powered by multiple dictionary APIs with robust fallbacks
 */
class DictionaryService {
  constructor() {
    this.prisma = prisma;
    this.apis = {
      freeDictionary: 'https://api.dictionaryapi.dev/api/v2/entries',
      datamuse: 'https://api.datamuse.com/words',
      datamuseSuggest: 'https://api.datamuse.com/sug',
      randomWord: 'https://random-word-api.herokuapp.com/word',
      wiktionary: 'https://en.wiktionary.org/w/api.php',
    };
    
    this._recentWords = new Set();
    this._recentWordsMax = 50;
    this._definitionCache = new Map(); 
    this._definitionTtlMs = 1000 * 60 * 60 * 24; // 24 hours

    this._lastApiCall = 0;
    this._minApiInterval = 100; // 100ms
    
    this.strictMode = false;
    this._commonWords = null;
    this._commonWordsFetchedAt = 0;
    this._commonWordsTtlMs = 1000 * 60 * 60 * 24 * 7; // 7 days
  }

  async _rateLimitApiCall() {
    const now = Date.now();
    const timeSinceLastCall = now - this._lastApiCall;
    if (timeSinceLastCall < this._minApiInterval) {
      await new Promise(resolve => setTimeout(resolve, this._minApiInterval - timeSinceLastCall));
    }
    this._lastApiCall = Date.now();
  }

  async _getFromDatabaseCache(word, language) {
    try {
      const lookup = await this.prisma.dictionaryLookup.findFirst({
        where: { word: word.toLowerCase(), language },
      });

      if (lookup) {
        return {
          word: lookup.word,
          phonetic: lookup.pronunciation || '',
          audio: '',
          meanings: lookup.definition ? [{
            partOfSpeech: lookup.partOfSpeech || 'noun',
            definitions: [{
              definition: lookup.definition,
              example: lookup.examples ? (JSON.parse(lookup.examples)[0] || '') : '',
              synonyms: lookup.synonyms ? JSON.parse(lookup.synonyms) : [],
              antonyms: lookup.antonyms ? JSON.parse(lookup.antonyms) : [],
            }],
            synonyms: lookup.synonyms ? JSON.parse(lookup.synonyms) : [],
            antonyms: lookup.antonyms ? JSON.parse(lookup.antonyms) : [],
          }] : [],
          pronunciation: lookup.pronunciation || '',
          definition: lookup.definition,
          examples: lookup.examples ? JSON.parse(lookup.examples) : [],
          synonyms: lookup.synonyms ? JSON.parse(lookup.synonyms) : [],
          antonyms: lookup.antonyms ? JSON.parse(lookup.antonyms) : [],
          id: lookup.id,
          source: lookup.source,
        };
      }
      return null;
    } catch (error) {
      logger.debug(`Database cache lookup failed for "${word}": ${error.message}`);
      return null;
    }
  }

  async _storeInDatabaseCache(wordData) {
    try {
      const existing = await this.prisma.dictionaryLookup.findFirst({
        where: { word: wordData.word.toLowerCase(), language: wordData.language || 'en' },
      });

      if (existing) {
        return await this.prisma.dictionaryLookup.update({
          where: { id: existing.id },
          data: { accessedCount: { increment: 1 } },
        });
      }

      return await this.prisma.dictionaryLookup.create({
        data: {
          word: wordData.word.toLowerCase(),
          language: wordData.language || 'en',
          definition: wordData.definition || '',
          pronunciation: wordData.pronunciation || '',
          partOfSpeech: wordData.partOfSpeech || 'noun',
          examples: wordData.examples ? JSON.stringify(wordData.examples) : '[]',
          synonyms: wordData.synonyms ? JSON.stringify(wordData.synonyms) : '[]',
          antonyms: wordData.antonyms ? JSON.stringify(wordData.antonyms) : '[]',
          source: wordData.source || 'api',
        },
      });
    } catch (error) {
      logger.warn(`Database cache storage failed for "${wordData.word}": ${error.message}`);
      return null;
    }
  }

  async getWordDefinition(word, language = 'en', retryCount = 0) {
    const w = String(word || '').toLowerCase().trim();
    if (!w) return null;
    
    // 1. Database Cache
    const dbCached = await this._getFromDatabaseCache(w, language);
    if (dbCached) return dbCached;
    
    // 2. Memory Cache
    const cacheKey = `${language}:${w}`;
    const cached = this._definitionCache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < this._definitionTtlMs) return cached.data;

    try {
      await this._rateLimitApiCall();
      
      const langCode = (language || 'en').toLowerCase();
      
      // For non-English, try to translate or find direct mapping
      if (langCode !== 'en') {
        const nonEng = await this._getNonEnglishDefinition(w, langCode);
        if (nonEng) return nonEng;
      }

      const url = `${this.apis.freeDictionary}/${langCode === 'rw' ? 'en' : langCode}/${encodeURIComponent(w)}`;
      const response = await axios.get(url, { timeout: 4000 });
      
      if (response.data?.[0]) {
        const parsed = this.parseDictionaryResponse(response.data[0]);
        if (parsed) {
          this._definitionCache.set(cacheKey, { data: parsed, ts: Date.now() });
          await this._storeInDatabaseCache({ 
            ...parsed, 
            language: langCode, 
            source: 'free_dictionary',
            definition: parsed.meanings?.[0]?.definitions?.[0]?.definition || '',
            examples: this.extractExamples(parsed),
            synonyms: this.extractSynonyms(parsed),
            antonyms: this.extractAntonyms(parsed),
          });
          return parsed;
        }
      }
    } catch (error) {
      logger.warn(`Primary dictionary API failed for "${word}": ${error.message}`);
      
      if (!this.strictMode && (language === 'en' || language === 'rw')) {
        const fallback = await this._getDefinitionFromFallbacks(w);
        if (fallback) return fallback;
      }

      if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.response?.status === 429)) {
        await new Promise(r => setTimeout(r, 1000));
        return this.getWordDefinition(word, language, retryCount + 1);
      }
    }
    return null;
  }

  async _getNonEnglishDefinition(word, language) {
    try {
      // 1. Check if word exists in DB for this language
      const dbCached = await this._getFromDatabaseCache(word, language);
      if (dbCached) return dbCached;

      // 2. Use Translator to get English equivalent
      const transResult = await translatorIntegrationService.translateText({
        text: word,
        sourceLanguage: language,
        targetLanguage: 'en'
      });

      if (transResult?.success && transResult.data?.translatedText) {
        const englishWord = transResult.data.translatedText.toLowerCase();
        const def = await this.getWordDefinition(englishWord, 'en');
        if (def) {
          const nonEngDef = {
            ...def,
            word: word,
            originalEnglish: englishWord,
            language
          };
          await this._storeInDatabaseCache({
            ...nonEngDef,
            source: 'translated',
            definition: def.meanings?.[0]?.definitions?.[0]?.definition || ''
          });
          return nonEngDef;
        }
      }
    } catch (e) {
      logger.error(`Non-English definition fetch failed for "${word}" (${language}): ${e.message}`);
    }
    return null;
  }

  async _getDefinitionFromFallbacks(word) {
    const fallbacks = [
      { name: 'datamuse', fn: () => this._getDefinitionFromDatamuse(word) },
      { name: 'wiktionary', fn: () => this._getDefinitionFromWiktionary(word) },
    ];

    for (const fb of fallbacks) {
      try {
        const def = await fb.fn();
        // Quality gate applies to every source, not just the random-word
        // generator loop — this is what let one-letter fragments and
        // fuzzy-match noise into the cache in the first place.
        if (def && def.meanings?.length > 0 && this.validateWordQuality(word, def)) {
          await this._storeInDatabaseCache({
            ...def,
            language: 'en',
            source: fb.name,
            definition: def.meanings[0].definitions[0].definition,
            examples: this.extractExamples(def),
            synonyms: this.extractSynonyms(def)
          });
          return def;
        }
      } catch (e) {
        logger.debug(`${fb.name} fallback failed for "${word}": ${e.message}`);
      }
    }
    return null;
  }

  parseDictionaryResponse(data) {
    if (!data) return null;
    return {
      word: data.word,
      phonetic: data.phonetic || (data.phonetics?.find(p => p.text)?.text || ''),
      audio: data.phonetics?.find(p => p.audio)?.audio || '',
      meanings: data.meanings?.map(meaning => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions?.slice(0, 3).map(def => ({
          definition: def.definition,
          example: def.example || '',
          synonyms: def.synonyms?.slice(0, 5) || [],
          antonyms: def.antonyms?.slice(0, 3) || [],
        })) || [],
        synonyms: meaning.synonyms || [],
        antonyms: meaning.antonyms || [],
      })) || [],
    };
  }

  extractExamples(def) {
    const examples = [];
    def.meanings?.forEach(m => m.definitions?.forEach(d => d.example && examples.push(d.example)));
    return [...new Set(examples)].slice(0, 5);
  }

  extractSynonyms(def) {
    const synonyms = [];
    def.meanings?.forEach(m => {
      if (m.synonyms) synonyms.push(...m.synonyms);
      m.definitions?.forEach(d => d.synonyms && synonyms.push(...d.synonyms));
    });
    return [...new Set(synonyms)].slice(0, 10);
  }

  extractAntonyms(def) {
    const antonyms = [];
    def.meanings?.forEach(m => {
      if (m.antonyms) antonyms.push(...m.antonyms);
      m.definitions?.forEach(d => d.antonyms && antonyms.push(...d.antonyms));
    });
    return [...new Set(antonyms)].slice(0, 5);
  }

  async _getDefinitionFromDatamuse(word) {
    const res = await axios.get(this.apis.datamuse, { params: { sp: word, max: 1, md: 'dp' }, timeout: 2500 });
    const item = res.data?.[0];
    if (!item?.defs?.[0]) return null;
    
    const parts = item.defs[0].split('\t');
    const pos = parts[0] === 'n' ? 'noun' : parts[0] === 'v' ? 'verb' : 'adjective';
    const definition = parts[1] || '';

    return {
      word,
      meanings: [{
        partOfSpeech: pos,
        definitions: [{ definition, example: '', synonyms: [], antonyms: [] }],
        synonyms: [], antonyms: [],
      }],
    };
  }

  async _getDefinitionFromWiktionary(word) {
    const params = { action: 'query', format: 'json', titles: word, prop: 'extracts', exintro: true, explaintext: true, origin: '*' };
    const res = await axios.get(this.apis.wiktionary, { params, timeout: 2500 });
    const pages = res.data?.query?.pages;
    const pageId = Object.keys(pages || {})[0];
    const extract = pageId && pages[pageId]?.extract ? pages[pageId].extract : null;
    if (!extract) return null;

    return {
      word,
      meanings: [{
        partOfSpeech: 'noun',
        definitions: [{ definition: extract.split('\n')[0], example: '', synonyms: [], antonyms: [] }],
        synonyms: [], antonyms: [],
      }],
    };
  }

  async getRandomVocabularyBatch(limit = 10, targetLanguage = 'en', userId = null) {
    const batch = [];
    const seen = new Set();

    // Without this, a word the user already graded (mastery raised, next
    // review pushed days into the future) had no way to be excluded here —
    // this function only reads the global dictionaryLookup cache, which
    // knows nothing about per-user progress. The DB-cache branch below
    // reshuffles a small, mostly-fixed pool ordered by accessedCount, so it
    // kept resurfacing the same handful of already-seen words as "new" ones
    // and, because that alone was enough to fill `limit`, the live-fetch
    // path below (which actually introduces unseen words) never even ran.
    // That's what "stuck on 8 words that never change" looks like.
    let excludedWords = new Set();
    if (userId) {
      try {
        const tracked = await this.prisma.vocabularyProgress.findMany({
          where: { userId, vocabularyItem: { language: targetLanguage } },
          select: { vocabularyItem: { select: { word: true } } },
        });
        excludedWords = new Set(tracked.map((t) => t.vocabularyItem.word.toLowerCase()));
      } catch (e) {
        logger.debug(`Could not load tracked words for exclusion: ${e.message}`);
      }
    }

    // Try to get from database first for variety
    try {
      const cached = await this.prisma.dictionaryLookup.findMany({
        where: { language: targetLanguage, definition: { not: '' } },
        orderBy: { accessedCount: 'asc' },
        take: limit * 4, // wider pool so excluding already-tracked words still leaves enough choice
      });

      const eligible = cached.filter((c) => !excludedWords.has(c.word.toLowerCase()));
      const shuffled = eligible.sort(() => 0.5 - Math.random()).slice(0, limit);
      for (const c of shuffled) {
        batch.push(this._formatFromLookup(c));
        seen.add(c.word.toLowerCase());
      }
    } catch (e) {
      logger.debug(`DB batch fetch failed: ${e.message}`);
    }

    if (batch.length >= limit) return batch;

    // Fetch real new words if needed — this is what actually grows the pool
    // of distinct words over time instead of only ever reshuffling the seed
    // set, and it's now reachable whenever the cache can't fill the batch
    // after exclusions.
    let attempts = 0;
    while (batch.length < limit && attempts < 30) {
      attempts++;
      try {
        const word = await this._getValidEnglishWord();
        if (!word || seen.has(word) || excludedWords.has(word)) continue;

        const def = await this.getWordDefinition(word, 'en');
        if (!def || !this.validateWordQuality(word, def)) continue;

        let finalWord = word;
        if (targetLanguage !== 'en') {
          const trans = await translatorIntegrationService.translateText({ text: word, targetLanguage, sourceLanguage: 'en' });
          if (trans?.success) finalWord = trans.data.translatedText;
          else continue;
        }

        const item = {
          id: `live-${word}-${Date.now()}`,
          word: finalWord,
          definition: def.meanings?.[0]?.definitions?.[0]?.definition || '',
          partOfSpeech: def.meanings?.[0]?.partOfSpeech || 'noun',
          phonetic: def.phonetic || '',
          audio: def.audio || '',
          examples: this.extractExamples(def),
          synonyms: this.extractSynonyms(def),
          antonyms: this.extractAntonyms(def),
          language: targetLanguage,
          isNew: true
        };
        batch.push(item);
        seen.add(word);
      } catch (e) {
        logger.debug(`Live word fetch failed: ${e.message}`);
      }
    }

    return batch;
  }

  _formatFromLookup(record) {
    return {
      id: record.id,
      vocabularyItemId: record.id,
      word: record.word,
      definition: record.definition || '',
      partOfSpeech: record.partOfSpeech || 'noun',
      phonetic: record.pronunciation || '',
      audio: '',
      examples: record.examples ? JSON.parse(record.examples) : [],
      synonyms: record.synonyms ? JSON.parse(record.synonyms) : [],
      antonyms: record.antonyms ? JSON.parse(record.antonyms) : [],
      language: record.language,
      isNew: true
    };
  }

  async _getValidEnglishWord() {
    await this._ensureCommonWordsLoaded();
    if (!this._commonWords) return null;

    for (let i = 0; i < 10; i++) {
      const w = this._commonWords[Math.floor(Math.random() * this._commonWords.length)];
      if (!this._recentWords.has(w)) {
        this._recentWords.add(w);
        if (this._recentWords.size > this._recentWordsMax) {
          const it = this._recentWords.values();
          this._recentWords.delete(it.next().value);
        }
        return w;
      }
    }
    return null;
  }

  async _ensureCommonWordsLoaded() {
    if (this._commonWords && (Date.now() - this._commonWordsFetchedAt) < this._commonWordsTtlMs) return;
    try {
      const url = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/20k.txt';
      const res = await axios.get(url, { timeout: 5000 });
      this._commonWords = res.data.split('\n').map(s => s.trim().toLowerCase()).filter(s => s && /^[a-z]{4,12}$/.test(s));
      this._commonWordsFetchedAt = Date.now();
    } catch (e) {
      logger.warn(`Failed to load common words: ${e.message}`);
      this._commonWords = ['innovation', 'practice', 'language', 'education', 'technology', 'success', 'future', 'learning'];
    }
  }

  validateWordQuality(word, def) {
    if (!word || word.length < 3 || word.length > 15) return false;
    if (/[^a-z]/.test(word.toLowerCase())) return false;
    const definition = def.meanings?.[0]?.definitions?.[0]?.definition || '';
    if (definition.length < 10) return false;
    if (/plural of|past tense of/i.test(definition)) return false;
    return true;
  }

  async searchVocabulary(query, language = 'en', limit = 12) {
    if (!query || !query.trim()) return [];
    
    const normalized = query.trim().toLowerCase();
    
    // First try direct API lookup for exact match if it's a single word
    if (!normalized.includes(' ')) {
      const direct = await this.getWordDefinition(normalized, language);
      if (direct) {
        return [direct];
      }
    }

    // Then search database
    const records = await this.prisma.dictionaryLookup.findMany({
      where: { 
        language,
        OR: [
          { word: { contains: normalized, mode: 'insensitive' } },
          { definition: { contains: normalized, mode: 'insensitive' } },
        ]
      },
      orderBy: { accessedCount: 'desc' },
      take: limit,
    });

    return records.map(this._formatFromLookup);
  }

  async getVocabularyRecommendations({ userId, targetLanguage = 'en', limit = 8 }) {
    const batch = await this.getRandomVocabularyBatch(limit, targetLanguage, userId);
    return { recommendations: batch, total: batch.length };
  }

  async getDailyVocabulary({ userId, targetLanguage = 'en', limit = 3 }) {
    const batch = await this.getRandomVocabularyBatch(limit, targetLanguage, userId);
    return { vocabulary: batch.slice(0, limit), generatedAt: new Date().toISOString() };
  }

  async getRecentVocabulary(userId, limit = 6) {
    const entries = await this.prisma.vocabularyProgress.findMany({
      where: { userId },
      include: { vocabularyItem: true },
      orderBy: { lastEncountered: 'desc' },
      take: limit,
    });

    const results = [];
    for (const entry of entries) {
      const lookup = await this._getFromDatabaseCache(entry.vocabularyItem.word, entry.vocabularyItem.language);
      results.push({
        vocabularyItemId: entry.vocabularyItemId,
        word: entry.vocabularyItem.word,
        definition: lookup?.definition || entry.vocabularyItem.definition || '',
        partOfSpeech: lookup?.partOfSpeech || entry.vocabularyItem.partOfSpeech || 'noun',
        phonetic: lookup?.phonetic || '',
        streak: entry.streak,
        masteryLevel: entry.masteryLevel,
        lastEncountered: entry.lastEncountered,
        isNew: false
      });
    }
    return results;
  }

  /**
   * Translates a complete dictionary entry into the target language
   */
  async translateEntry(entry, targetLanguage) {
    if (!entry || !targetLanguage) return entry;
    
    try {
      // 1. Collect all translatable strings
      const stringsToTranslate = [];
      const mapping = [];

      // Helper to add if not empty
      const add = (text, path) => {
        if (text && typeof text === 'string' && text.trim()) {
          stringsToTranslate.push(text.trim());
          mapping.push(path);
        }
      };

      add(entry.word, 'word');
      entry.meanings?.forEach((meaning, mIdx) => {
        meaning.definitions?.forEach((def, dIdx) => {
          add(def.definition, `meanings[${mIdx}].definitions[${dIdx}].definition`);
          add(def.example, `meanings[${mIdx}].definitions[${dIdx}].example`);
          def.synonyms?.forEach((syn, sIdx) => add(syn, `meanings[${mIdx}].definitions[${dIdx}].synonyms[${sIdx}]`));
          def.antonyms?.forEach((ant, aIdx) => add(ant, `meanings[${mIdx}].definitions[${dIdx}].antonyms[${aIdx}]`));
        });
        meaning.synonyms?.forEach((syn, sIdx) => add(syn, `meanings[${mIdx}].synonyms[${sIdx}]`));
        meaning.antonyms?.forEach((ant, aIdx) => add(ant, `meanings[${mIdx}].antonyms[${aIdx}]`));
      });

      if (stringsToTranslate.length === 0) return entry;

      // 2. Perform translations (using vibeon_translator)
      // For simplicity and to bypass backend batch limits if any, we'll do them in parallel with a concurrency limit if needed, 
      // but for a single entry a few dozen strings is fine.
      const translations = await Promise.all(
        stringsToTranslate.map(text => 
          translatorIntegrationService.translateText({
            text,
            targetLanguage,
            sourceLanguage: 'en'
          }).then(res => res.data?.translatedText || text)
          .catch(() => text)
        )
      );

      // 3. Reconstruct entry
      const translatedEntry = JSON.parse(JSON.stringify(entry));
      mapping.forEach((path, idx) => {
        const val = translations[idx];
        // Poor man's lodash set
        const parts = path.split(/\[|\]\.|\]\[|\]|\./).filter(Boolean);
        let current = translatedEntry;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = val;
      });

      return translatedEntry;
    } catch (e) {
      logger.error('Dictionary entry translation failed:', e);
      return entry;
    }
  }
}

module.exports = new DictionaryService();
