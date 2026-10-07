/**
 * Language helpers shared by the agent forms.
 *
 * The full catalog comes from the Agent Manager (GET /api/v1/languages). Providers
 * publish their own codes ("hi", "hi-IN", "cmn-CN"), so everything is compared by
 * base language ("hi"), with the backend's alias table folded in ("cmn" -> "zh").
 */

import type { AgentConfig, LanguageCatalog, ProviderWhitelist } from "@/services/api";
import { LANGUAGE_LABELS } from "@/lib/format-provider";

export interface LanguageOption {
  value: string;
  label: string;
  hint?: string; // native name
  disabled?: boolean;
  reason?: string; // why it is disabled
}

/** Used only until (or if) the catalog cannot be loaded from the API. */
export const FALLBACK_CATALOG: LanguageCatalog = {
  languages: [
    { code: "ar", name: "Arabic", native: "العربية" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "zh", name: "Chinese", native: "中文" },
    { code: "nl", name: "Dutch", native: "Nederlands" },
    { code: "en", name: "English", native: "English" },
    { code: "fr", name: "French", native: "Français" },
    { code: "de", name: "German", native: "Deutsch" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "it", name: "Italian", native: "Italiano" },
    { code: "ja", name: "Japanese", native: "日本語" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ko", name: "Korean", native: "한국어" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "pt", name: "Portuguese", native: "Português" },
    { code: "ru", name: "Russian", native: "Русский" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "sw", name: "Swahili (Kiswahili)", native: "Kiswahili" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "tr", name: "Turkish", native: "Türkçe" },
    { code: "ur", name: "Urdu", native: "اردو" },
  ],
  special: [{ code: "multi", name: "Multiple languages (auto-detect)", native: "" }],
  aliases: { cmn: "zh", yue: "zh", nb: "no", nn: "no", arb: "ar", tl: "fil" },
  max_languages: 20,
};

/** Must match the Agent Manager's PromptConfig limits. */
export const MAX_SYSTEM_PROMPT_CHARS = 20000;
export const MAX_GREETING_CHARS = 500;

const SPECIAL = new Set(["multi", "auto", "unknown"]);

/** Language subtag of a code, aliases folded: "hi-IN" -> "hi", "cmn-CN" -> "zh". */
export function baseCode(code: string, aliases: Record<string, string> = {}): string {
  const b = (code || "").split(/[-_]/)[0].toLowerCase();
  return aliases[b] ?? b;
}

/** Human label for any code (catalog name, plus the region for variants). */
export function languageLabel(code: string, catalog: LanguageCatalog): string {
  if (SPECIAL.has(code)) return "Multiple languages (auto-detect)";
  if (LANGUAGE_LABELS[code]) return LANGUAGE_LABELS[code];
  const entry = catalog.languages.find((l) => l.code === baseCode(code, catalog.aliases));
  if (!entry) return code;
  const region = code.split(/[-_]/).slice(1).join("-");
  return region ? `${entry.name} (${region})` : entry.name;
}

function nativeName(code: string, catalog: LanguageCatalog): string | undefined {
  return catalog.languages.find((l) => l.code === baseCode(code, catalog.aliases))?.native;
}

/**
 * Options for a picker.
 *  - no `providerCodes`: every catalog language is selectable (agent-level language).
 *  - with `providerCodes`: the provider's own codes are selectable; every other
 *    catalog language is listed disabled so the full list stays visible.
 */
export function buildLanguageOptions(
  catalog: LanguageCatalog,
  providerCodes?: string[],
  providerName?: string
): LanguageOption[] {
  const codes = (providerCodes ?? []).filter((c) => !SPECIAL.has(c));
  if (codes.length === 0) {
    return catalog.languages.map((l) => ({ value: l.code, label: l.name, hint: l.native }));
  }

  const supported: LanguageOption[] = [...new Set(codes)].map((c) => ({
    value: c,
    label: languageLabel(c, catalog),
    hint: nativeName(c, catalog),
  }));
  supported.sort((a, b) => a.label.localeCompare(b.label));

  const covered = new Set(codes.map((c) => baseCode(c, catalog.aliases)));
  const unsupported: LanguageOption[] = catalog.languages
    .filter((l) => !covered.has(l.code))
    .map((l) => ({
      value: l.code,
      label: l.name,
      hint: l.native,
      disabled: true,
      reason: providerName ? `Not supported by ${providerName}` : "Not supported by this provider",
    }));
  return [...supported, ...unsupported];
}

/** True if `selected` contains a language with the same base as `lang`. */
export function coversLanguage(selected: string[], lang: string, aliases: Record<string, string> = {}): boolean {
  const b = baseCode(lang, aliases);
  return selected.some((s) => baseCode(s, aliases) === b);
}

/** Languages in `wanted` that `selected` does not cover (by base language). */
export function missingLanguages(selected: string[], wanted: string[], aliases: Record<string, string> = {}): string[] {
  return wanted.filter((w) => !coversLanguage(selected, w, aliases));
}

/** Same members regardless of order. */
export function sameLanguageSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * Map agent languages onto a provider's codes, keeping order. A language the
 * provider lacks is dropped. Prefers an exact code, else the first provider code
 * with the same base ("hi" -> "hi-IN").
 */
export function mapToProviderCodes(
  langs: string[],
  providerCodes: string[] | undefined,
  aliases: Record<string, string> = {}
): string[] {
  const codes = (providerCodes ?? []).filter((c) => !SPECIAL.has(c));
  if (codes.length === 0) return [...langs];
  const out: string[] = [];
  for (const l of langs) {
    const exact = codes.find((c) => c === l);
    const same = exact ?? codes.find((c) => baseCode(c, aliases) === baseCode(l, aliases));
    if (same && !out.includes(same)) out.push(same);
  }
  return out;
}

/** Normalised list from a config section (`languages`, else the legacy `language`). */
export function sectionLanguages(section?: { language?: string | string[]; languages?: string[] }): string[] {
  if (!section) return [];
  if (section.languages && section.languages.length > 0) return section.languages;
  const l = section.language;
  if (Array.isArray(l)) return l.filter(Boolean);
  return l ? [l] : [];
}

/**
 * When the agent's languages change, keep a component's list (STT/TTS) in step
 * with it *only if it was previously following the agent languages*; a list the
 * user customised is left alone.
 */
export function followAgentLanguages(
  prevAgent: string[],
  nextAgent: string[],
  componentLangs: string[],
  providerCodes: string[] | undefined,
  aliases: Record<string, string> = {}
): string[] {
  const wasFollowing =
    componentLangs.length === 0 ||
    sameLanguageSet(componentLangs, mapToProviderCodes(prevAgent, providerCodes, aliases));
  if (!wasFollowing) return componentLangs;
  const mapped = mapToProviderCodes(nextAgent, providerCodes, aliases);
  return mapped.length > 0 ? mapped : componentLangs;
}

// ── Provider behaviour hints (mirror app/agents/language_support.py) ────────────

const DEEPGRAM_NOVA3_MULTI = ["en", "es", "fr", "de", "hi", "ru", "pt", "ja", "it", "nl"];

/** Explains how the worker will handle several STT languages; null when nothing to say. */
export function sttMultiLanguageHint(
  provider: string,
  model: string,
  langs: string[],
  aliases: Record<string, string> = {}
): { level: "info" | "warn"; text: string } | null {
  if (langs.length < 2) return null;
  const bases = [...new Set(langs.map((l) => baseCode(l, aliases)))];
  if (provider === "deepgram") {
    if (model.startsWith("nova-3")) {
      const missing = bases.filter((b) => !DEEPGRAM_NOVA3_MULTI.includes(b));
      return missing.length > 0
        ? {
            level: "warn",
            text: `Deepgram multi-language mode recognises ${DEEPGRAM_NOVA3_MULTI.join(", ")}. Not covered: ${missing.join(", ")}.`,
          }
        : { level: "info", text: "Deepgram nova-3 will recognise these languages together (code-switching)." };
    }
    return bases.every((b) => b === "en" || b === "es")
      ? { level: "info", text: "This model recognises English and Spanish together." }
      : { level: "warn", text: `${model || "This model"} can only recognise the primary language. Choose nova-3 for multi-language recognition.` };
  }
  if (provider === "openai") return { level: "info", text: "The language is detected automatically for each utterance." };
  if (provider === "sarvam") return { level: "info", text: "Sarvam detects the spoken language automatically." };
  if (provider === "elevenlabs") return { level: "info", text: "Scribe detects the spoken language automatically." };
  if (provider === "assemblyai") {
    const missing = bases.filter((b) => !["en", "es", "fr", "de", "it", "pt"].includes(b));
    return missing.length > 0
      ? { level: "warn", text: `AssemblyAI multilingual streaming recognises English, Spanish, French, German, Italian and Portuguese. Not covered: ${missing.join(", ")}.` }
      : { level: "info", text: "The multilingual AssemblyAI model is used and detects the language automatically." };
  }
  if (provider === "azure") {
    return langs.length > 4
      ? { level: "warn", text: "Azure identifies the language among at most 4 candidates; only the first 4 selected languages are used." }
      : { level: "info", text: "Azure identifies the spoken language among the selected ones automatically." };
  }
  if (provider === "google") {
    return model.startsWith("gemini")
      ? { level: "info", text: "Gemini transcription detects the language automatically. Text arrives about 1-2 s after the caller stops speaking, slower than Deepgram or ElevenLabs." }
      : { level: "info", text: "Google Cloud models need a service-account credential on the server; without one the agent uses Gemini transcription (about 1-2 s slower to finalise)." };
  }
  return { level: "warn", text: `${provider} only recognises the primary language here; the others are ignored.` };
}

/** TTS speaks one language at a time; say when the voice must handle the others. */
export function ttsMultiLanguageHint(provider: string, langs: string[]): { level: "info" | "warn"; text: string } | null {
  if (langs.length < 2) return null;
  if (provider === "elevenlabs" || provider === "openai" || provider === "cartesia") {
    return { level: "info", text: "This provider's voices are multilingual; the text decides the language spoken." };
  }
  return {
    level: "warn",
    text: "The voice speaks the primary language. The other languages are spoken correctly only if the selected voice supports them.",
  };
}

/**
 * After the agent's languages change, update STT and TTS to follow them (only where
 * they were following before). Returns a new config.
 */
export function syncLanguagesAfterPromptChange(
  config: AgentConfig,
  nextPrompt: AgentConfig["prompt"],
  whitelists: ProviderWhitelist | undefined,
  aliases: Record<string, string> = {}
): AgentConfig {
  const prev = sectionLanguages(config.prompt);
  const next = sectionLanguages(nextPrompt);
  if (prev.length === next.length && prev.every((l, i) => l === next[i])) {
    return { ...config, prompt: nextPrompt };
  }
  const codesFor = (kind: "stt" | "tts", provider: string): string[] | undefined =>
    whitelists?.[kind]?.find((i) => i.provider_name === provider)?.metadata?.languages;
  const follow = (section: AgentConfig["stt"], kind: "stt" | "tts") => {
    const langs = followAgentLanguages(prev, next, sectionLanguages(section), codesFor(kind, section.provider), aliases);
    return { ...section, language: langs[0], languages: langs };
  };
  return { ...config, prompt: nextPrompt, stt: follow(config.stt, "stt"), tts: follow(config.tts, "tts") };
}

/** Selected languages the provider cannot handle (by base language). Empty if the provider list is unknown. */
export function unsupportedLanguages(
  selected: string[],
  providerCodes: string[] | undefined,
  aliases: Record<string, string> = {}
): string[] {
  const codes = (providerCodes ?? []).filter((c) => !SPECIAL.has(c));
  if (codes.length === 0) return [];
  return selected.filter((s) => !codes.some((c) => baseCode(c, aliases) === baseCode(s, aliases)));
}
