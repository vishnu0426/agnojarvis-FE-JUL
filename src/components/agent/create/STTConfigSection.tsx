/**
 * Speech Recognition (ASR / STT) Configuration Section
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageMultiSelect } from "@/components/ui/language-multi-select";
import { LanguageCoverageNote } from "@/components/agent/create/LanguageCoverageNote";
import type { AgentConfig, ProviderWhitelist } from "@/services/api";
import { formatProviderName } from "@/lib/format-provider";
import { useLanguageCatalog } from "@/hooks/use-language-catalog";
import {
  buildLanguageOptions,
  mapToProviderCodes,
  sectionLanguages,
  unsupportedLanguages,
  sttMultiLanguageHint,
} from "@/lib/languages";

interface STTConfigSectionProps {
  config: AgentConfig["stt"];
  whitelists?: ProviderWhitelist;
  onChange: (config: AgentConfig["stt"]) => void;
  /** Languages the agent speaks; used to warn when STT would not recognise one of them. */
  agentLanguages?: string[];
}

export function STTConfigSection({ config, whitelists, onChange, agentLanguages }: STTConfigSectionProps) {
  const { catalog } = useLanguageCatalog();

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

  const providerCodes: string[] | undefined = getProviderMetadata(config.provider).languages;
  const selectedLanguages = sectionLanguages(config);
  const languageOptions = buildLanguageOptions(catalog, providerCodes, formatProviderName(config.provider));
  const hint = sttMultiLanguageHint(config.provider, config.model ?? "", selectedLanguages, catalog.aliases);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updateConfig = (field: keyof AgentConfig["stt"], value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleLanguagesChange = (next: string[]) => {
    if (next.length === 0) return; // at least one language is required
    onChange({ ...config, language: next[0], languages: next });
  };

  const handleProviderChange = (provider: string) => {
    const models = whitelists?.stt
      ?.filter((item) => item.provider_name === provider)
      .map((item) => item.model_name) ?? [];
    const uniqueModels = [...new Set(models)];

    // Keep the languages the new provider also supports; otherwise start from its first one.
    const codes: string[] | undefined = getProviderMetadata(provider).languages;
    const kept = mapToProviderCodes(selectedLanguages, codes, catalog.aliases);
    const langs = kept.length > 0 ? kept : [codes?.find((c) => c !== "multi") ?? config.language ?? "en"];

    onChange({
      provider,
      model: uniqueModels[0] || "",
      language: langs[0],
      languages: langs,
    });
  };

  return (
    <div className="space-y-6">
      {/* STT Section */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Speech recognition (ASR / STT)</h3>
          <p className="text-sm text-muted-foreground">
            Automatic speech recognition: transcribes the caller's speech into text for the LLM.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
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
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-sm text-muted-foreground">Languages to recognise</Label>
          <LanguageMultiSelect
            id="stt-languages"
            value={selectedLanguages}
            onChange={handleLanguagesChange}
            options={languageOptions}
            max={catalog.max_languages}
            placeholder="Select languages"
          />
          <LanguageCoverageNote
            catalog={catalog}
            selected={selectedLanguages}
            agentLanguages={agentLanguages}
            unsupported={unsupportedLanguages(selectedLanguages, providerCodes, catalog.aliases)}
            providerName={formatProviderName(config.provider)}
            what="recognise"
            hint={hint}
          />
        </div>
      </div>
    </div>
  );
}
