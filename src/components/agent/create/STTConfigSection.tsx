/**
 * Speech-to-Text Configuration Section
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

interface STTConfigSectionProps {
  config: AgentConfig["stt"];
  whitelists?: ProviderWhitelist;
  onChange: (config: AgentConfig["stt"]) => void;
}

export function STTConfigSection({ config, whitelists, onChange }: STTConfigSectionProps) {
  // ── Metadata helpers ─────────────────────────────────────────────────────────

  // Find the metadata for the currently selected STT provider
  const getProviderMetadata = (provider: string) => {
    const item = whitelists?.stt?.find((i) => i.provider_name === provider);
    return item?.metadata ?? {};
  };

  // Unique providers from whitelist
  const sttProviders = whitelists?.stt
    ? [...new Set(whitelists.stt.map((item) => item.provider_name))]
    : [];

  // Models for selected provider from whitelist
  const sttModels = whitelists?.stt
    ? [
        ...new Set(
          whitelists.stt
            .filter((item) => item.provider_name === config.provider)
            .map((item) => item.model_name)
        ),
      ]
    : [];

  // Languages from whitelist metadata for the current provider
  const getSttLanguages = (): { code: string; label: string }[] => {
    const meta = getProviderMetadata(config.provider);
    const langs: string[] = meta.languages ?? [];
    if (langs.length > 0) {
      return langs.map((code) => ({ code, label: formatLanguageCode(code) }));
    }
    // Fallback defaults
    return [
      { code: "en", label: "English" },
      { code: "hi", label: "Hindi" },
      { code: "es", label: "Spanish" },
      { code: "fr", label: "French" },
      { code: "de", label: "German" },
    ];
  };

  const sttLanguages = getSttLanguages();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updateConfig = (field: keyof AgentConfig["stt"], value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleProviderChange = (provider: string) => {
    const models = whitelists?.stt
      ?.filter((item) => item.provider_name === provider)
      .map((item) => item.model_name) ?? [];
    const uniqueModels = [...new Set(models)];

    const meta = getProviderMetadata(provider);
    const langs: string[] = meta.languages ?? [];
    const defaultLang = langs[0] || config.language || "en";

    onChange({
      provider,
      model: uniqueModels[0] || "",
      language: defaultLang,
    });
  };

  return (
    <div className="space-y-6">
      {/* STT Section */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Speech-to-text (STT)</h3>
          <p className="text-sm text-muted-foreground">
            Transcribes the user's speech into text for input to the LLM.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Provider</Label>
            <Select value={config.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {sttProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {formatProviderName(provider)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Model</Label>
            <Select value={config.model} onValueChange={(value) => updateConfig("model", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {sttModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Language</Label>
            <Select value={config.language} onValueChange={(value) => updateConfig("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {sttLanguages.map(({ code, label }) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}