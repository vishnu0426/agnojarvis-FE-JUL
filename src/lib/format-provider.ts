/**
 * Provider Display Utilities
 *
 * File Location: src/lib/format-provider.ts
 *
 * Utility functions for formatting provider names and language codes for display.
 * Handles special cases like AWS, OpenAI, Deepgram, Sarvam, etc.
 */

/**
 * Comprehensive map from language/locale codes → human-readable labels.
 * Covers locale codes (en-US, hi-IN) used by AWS/Google/Azure/Sarvam,
 * and short codes (en, hi, ta) used by OpenAI/ElevenLabs/Deepgram.
 */
export const LANGUAGE_LABELS: Record<string, string> = {
  // ── English variants ───────────────────────────────────────────────────────
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "en-AU": "English (Australia)",
  "en-IN": "English (India)",
  "en-IE": "English (Ireland)",
  "en-ZA": "English (South Africa)",
  "en-NZ": "English (New Zealand)",
  "en-GB-WLS": "English (Welsh)",
  "en": "English",
  // ── Indian languages ──────────────────────────────────────────────────────
  "hi-IN": "Hindi (India)",   "hi": "Hindi",
  "ta-IN": "Tamil (India)",   "ta": "Tamil",
  "te-IN": "Telugu (India)",  "te": "Telugu",
  "ml-IN": "Malayalam (India)", "ml": "Malayalam",
  "kn-IN": "Kannada (India)", "kn": "Kannada",
  "mr-IN": "Marathi (India)", "mr": "Marathi",
  "gu-IN": "Gujarati (India)", "gu": "Gujarati",
  "bn-IN": "Bengali (India)", "bn": "Bengali",
  "pa-IN": "Punjabi (India)", "pa": "Punjabi",
  "od-IN": "Odia (India)",    "or": "Odia",
  "raj-IN": "Rajasthani (India)",
  "as-IN": "Assamese (India)", "as": "Assamese",
  // ── European languages ────────────────────────────────────────────────────
  "es-ES": "Spanish (Spain)", "es-MX": "Spanish (Mexico)",
  "es-US": "Spanish (US)",    "es-419": "Spanish (Latin America)",
  "es": "Spanish",
  "fr-FR": "French",          "fr-CA": "French (Canada)",
  "fr-BE": "French (Belgium)", "fr": "French",
  "de-DE": "German",          "de-CH": "German (Switzerland)",
  "de-AT": "German (Austria)", "de": "German",
  "it-IT": "Italian",         "it": "Italian",
  "pt-BR": "Portuguese (Brazil)", "pt-PT": "Portuguese (Portugal)",
  "pt": "Portuguese",
  "nl-NL": "Dutch",           "nl-BE": "Dutch (Belgium)",
  "nl": "Dutch",
  "pl-PL": "Polish",          "pl": "Polish",
  "ru-RU": "Russian",         "ru": "Russian",
  "tr-TR": "Turkish",         "tr": "Turkish",
  "sv-SE": "Swedish",         "sv": "Swedish",
  "nb-NO": "Norwegian",       "no": "Norwegian",
  "da-DK": "Danish",          "da": "Danish",
  "fi-FI": "Finnish",         "fi": "Finnish",
  "ro-RO": "Romanian",        "ro": "Romanian",
  "cs-CZ": "Czech",           "cs": "Czech",
  "sk-SK": "Slovak",          "sk": "Slovak",
  "hu-HU": "Hungarian",       "hu": "Hungarian",
  "el-GR": "Greek",           "el": "Greek",
  "uk-UA": "Ukrainian",       "uk": "Ukrainian",
  "hr-HR": "Croatian",        "hr": "Croatian",
  "bg-BG": "Bulgarian",       "bg": "Bulgarian",
  "sr-RS": "Serbian",         "sr": "Serbian",
  "sl-SI": "Slovenian",       "sl": "Slovenian",
  "is-IS": "Icelandic",       "is": "Icelandic",
  "ca-ES": "Catalan",         "ca": "Catalan",
  "cy-GB": "Welsh",           "cy": "Welsh",
  "ms-MY": "Malay",           "ms": "Malay",
  // ── East Asian languages ──────────────────────────────────────────────────
  "ja-JP": "Japanese",        "ja": "Japanese",
  "ko-KR": "Korean",          "ko": "Korean",
  "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
  "cmn-CN": "Chinese (Mandarin)", "yue-CN": "Chinese (Cantonese)",
  "zh": "Chinese",
  // ── Middle Eastern / Other ────────────────────────────────────────────────
  "ar-AE": "Arabic",          "arb": "Arabic (Standard)",
  "ar-SA": "Arabic (Saudi)",  "ar": "Arabic",
  "he-IL": "Hebrew",          "he": "Hebrew",
  "fa-IR": "Persian",         "fa": "Persian",
  "ur-PK": "Urdu",            "ur": "Urdu",
  // ── African / Others ─────────────────────────────────────────────────────
  "af-ZA": "Afrikaans",       "af": "Afrikaans",
  "sw-KE": "Swahili",         "sw": "Swahili",
  // ── Other world languages ─────────────────────────────────────────────────
  "hy-AM": "Armenian",        "hy": "Armenian",
  "az-AZ": "Azerbaijani",     "az": "Azerbaijani",
  "be-BY": "Belarusian",      "be": "Belarusian",
  "bs-BA": "Bosnian",         "bs": "Bosnian",
  "et-EE": "Estonian",        "et": "Estonian",
  "gl-ES": "Galician",        "gl": "Galician",
  "id-ID": "Indonesian",      "id": "Indonesian",
  "kk-KZ": "Kazakh",          "kk": "Kazakh",
  "lv-LV": "Latvian",         "lv": "Latvian",
  "lt-LT": "Lithuanian",      "lt": "Lithuanian",
  "mk-MK": "Macedonian",      "mk": "Macedonian",
  "mi-NZ": "Māori",           "mi": "Māori",
  "ne-NP": "Nepali",          "ne": "Nepali",
  "tl-PH": "Filipino",        "tl": "Filipino",
  "fil": "Filipino",
  "th-TH": "Thai",            "th": "Thai",
  "vi-VN": "Vietnamese",      "vi": "Vietnamese",
  "multi": "Multilingual (auto-detect)",
};

/**
 * Convert a language/locale code to a human-readable label.
 * Falls back to the raw code if no label is defined.
 */
export function formatLanguageCode(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}

/**
 * Format provider name for display
 * Handles special cases and proper capitalization
 */
export function formatProviderName(provider: string): string {
  if (!provider) return '';
  
  const lowerProvider = provider.toLowerCase();
  
  // Special cases - exact matches
  const specialCases: Record<string, string> = {
    'aws': 'AWS',
    'openai': 'OpenAI',
    'deepgram': 'Deepgram',
    'elevenlabs': 'ElevenLabs',
    'playht': 'PlayHT',
    'assemblyai': 'AssemblyAI',
    'anthropic': 'Anthropic',
    'google': 'Google',
    'groq': 'Groq',
    'azure': 'Azure',
    'together': 'Together AI',
    'cerebras': 'Cerebras',
    'cartesia': 'Cartesia',
    'lmnt': 'LMNT',
    'sarvam': 'Sarvam',
  };
  
  // Check if we have a special case
  if (specialCases[lowerProvider]) {
    return specialCases[lowerProvider];
  }
  
  // Default: capitalize first letter
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

/**
 * Format model name for display
 * Preserves formatting for model names
 */
export function formatModelName(model: string): string {
  if (!model) return '';
  return model; // Keep model names as-is
}

/**
 * Format voice name for display
 * Capitalizes first letter
 */
export function formatVoiceName(voice: string): string {
  if (!voice) return '';
  return voice.charAt(0).toUpperCase() + voice.slice(1);
}