/**
 * Text-to-Speech Configuration Section
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgentConfig, ProviderWhitelist } from "@/services/api";
import { formatProviderName, formatLanguageCode } from "@/lib/format-provider";

// ── Component ─────────────────────────────────────────────────────────────────

interface TTSConfigSectionProps {
  config: AgentConfig["tts"];
  whitelists?: ProviderWhitelist;
  onChange: (config: AgentConfig["tts"]) => void;
}

export function TTSConfigSection({ config, whitelists, onChange }: TTSConfigSectionProps) {
  const isSarvam = config.provider === "sarvam";

  // Unique providers from whitelist
  const ttsProviders = whitelists?.tts
    ? [...new Set(whitelists.tts.map((item) => item.provider_name))]
    : [];

  // ── Metadata helpers ─────────────────────────────────────────────────────────

  // Get the metadata object for the currently selected TTS provider
  const getProviderMetadata = (provider: string) => {
    const item = whitelists?.tts?.find((i) => i.provider_name === provider);
    return item?.metadata ?? {};
  };

  // Sarvam model list from whitelist metadata, fallback to hardcoded
  const getSarvamModels = (): string[] => {
    const meta = getProviderMetadata("sarvam");
    const speakersByModel = meta.speakers_by_model;
    if (speakersByModel && Object.keys(speakersByModel).length > 0) {
      return Object.keys(speakersByModel);
    }
    // Fallback: collect unique model names from whitelist rows
    return [
      ...new Set(
        (whitelists?.tts ?? [])
          .filter((i) => i.provider_name === "sarvam")
          .map((i) => i.model_name)
      ),
    ];
  };

  // Speakers for the currently selected Sarvam model from whitelist metadata
  const getSarvamSpeakers = (): string[] => {
    const meta = getProviderMetadata("sarvam");
    const speakersByModel: Record<string, string[]> = meta.speakers_by_model ?? {};
    const model = config.voice || "bulbul:v2";
    // Try exact match, then first available model
    return (
      speakersByModel[model] ??
      speakersByModel[Object.keys(speakersByModel)[0]] ??
      []
    );
  };

  // Language list from whitelist metadata for the current provider
  const getLanguageOptions = (): { code: string; label: string }[] => {
    const meta = getProviderMetadata(config.provider);
    const langs: string[] = meta.languages ?? [];
    if (langs.length > 0) {
      return langs.map((code) => ({ code, label: formatLanguageCode(code) }));
    }
    // Fallback defaults
    if (isSarvam) {
      return [
        { code: "hi-IN", label: "Hindi (India)" },
        { code: "en-IN", label: "English (India)" },
      ];
    }
    return [
      { code: "en-US", label: "English (US)" },
      { code: "en-GB", label: "English (UK)" },
      { code: "hi-IN", label: "Hindi (India)" },
    ];
  };

  // Voices (non-Sarvam): filtered by provider and engine, deduplicated to avoid React key collisions
  const getTTSVoices = (): string[] => {
    if (!whitelists?.tts || isSarvam) return [];
    const selectedEngine = config.speech_engine;
    const voices = whitelists.tts
      .filter((item) => {
        if (item.provider_name !== config.provider) return false;
        if (config.provider === "aws" && selectedEngine && item.engines) {
          return item.engines.includes(selectedEngine);
        }
        return true;
      })
      .map((item) => item.model_name);
    // Deduplicate: the same voice name can appear on multiple model rows (e.g. OpenAI tts-1 / tts-1-hd)
    return [...new Set(voices)];
  };

  const languageOptions = getLanguageOptions();
  const sarvamModels = getSarvamModels();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updateConfig = (field: keyof AgentConfig["tts"], value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleProviderChange = (provider: string) => {
    if (provider === "sarvam") {
      const meta = getProviderMetadata("sarvam");
      const speakersByModel: Record<string, string[]> = meta.speakers_by_model ?? {};
      const defaultModel =
        Object.keys(speakersByModel)[0] || "bulbul:v2";
      const defaultSpeaker = (speakersByModel[defaultModel] ?? [])[0] || "";
      const defaultLang = (meta.languages ?? ["hi-IN"])[0];
      onChange({
        provider,
        voice: defaultModel,
        speaker: defaultSpeaker,
        language: defaultLang,
        speech_engine: undefined,
      });
    } else {
      const voices =
        whitelists?.tts
          ?.filter((item) => item.provider_name === provider)
          .map((item) => item.model_name) || [];
      const provMeta = getProviderMetadata(provider);
      const defaultLang = (provMeta.languages ?? ["en-US"])[0];
      onChange({
        provider,
        voice: voices[0] || "",
        speaker: undefined,
        speech_engine: provider === "aws" ? "standard" : undefined,
        language: defaultLang,
      });
    }
  };

  // When Sarvam model changes: keep language, reset speaker to first available
  const handleSarvamModelChange = (model: string) => {
    const meta = getProviderMetadata("sarvam");
    const speakersByModel: Record<string, string[]> = meta.speakers_by_model ?? {};
    const speakers = speakersByModel[model] ?? [];
    onChange({
      ...config,
      voice: model,
      speaker: speakers[0] || "",
    });
  };

  const ttsVoices = getTTSVoices();

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Provider + Model/Voice row */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Text-to-speech (TTS)</h3>
          <p className="text-sm text-muted-foreground">
            Converts your agent's text response into speech using the selected voice.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          {/* Provider */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Provider</Label>
            <Select value={config.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {ttsProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {formatProviderName(provider)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice / Model */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {isSarvam ? "Model" : "Voice"}
            </Label>
            {isSarvam ? (
              <Select value={config.voice ?? ""} onValueChange={handleSarvamModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {sarvamModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={config.voice ?? ""} onValueChange={(v) => updateConfig("voice", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {ttsVoices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Sarvam: Speaker row */}
      {isSarvam && (
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold mb-1">Speaker</h3>
            <p className="text-sm text-muted-foreground">
              Voice persona compatible with the selected model.
            </p>
          </div>
          <Select
            value={config.speaker ?? getSarvamSpeakers()[0] ?? ""}
            onValueChange={(v) => updateConfig("speaker", v)}
          >
            <SelectTrigger className="max-w-xs mt-3">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent>
              {getSarvamSpeakers().map((spk) => (
                <SelectItem key={spk} value={spk}>
                  {spk.charAt(0).toUpperCase() + spk.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* AWS: Speech Engine */}
      {config.provider === "aws" && (
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold mb-1">Speech Engine</h3>
            <p className="text-sm text-muted-foreground">
              AWS Polly engine type for voice synthesis.
            </p>
          </div>
          <Select
            value={config.speech_engine ?? "standard"}
            onValueChange={(v) => updateConfig("speech_engine", v)}
          >
            <SelectTrigger className="max-w-xs mt-3">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="neural">Neural</SelectItem>
              <SelectItem value="generative">Generative</SelectItem>
              <SelectItem value="long-form">Long-form</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Language (all non-AWS providers including Sarvam) */}
      {config.provider !== "aws" && (
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold mb-1">Language</h3>
            <p className="text-sm text-muted-foreground">
              Voice language and locale.
            </p>
          </div>
          <Select
            value={config.language ?? (isSarvam ? "hi-IN" : "en-US")}
            onValueChange={(v) => updateConfig("language", v)}
          >
            <SelectTrigger className="max-w-xs mt-3">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(({ code, label }) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}