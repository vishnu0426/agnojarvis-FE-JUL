/**
 * Realtime (speech-to-speech) Configuration Section
 *
 * Shown instead of the STT / LLM / TTS sections when the agent's pipeline is "realtime".
 * One model does listening + reasoning + speaking (OpenAI Realtime/GPT-Live, Gemini Live, Nova Sonic).
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { AgentConfig, ProviderWhitelist } from "@/services/api";
import { formatProviderName } from "@/lib/format-provider";

interface RealtimeConfigSectionProps {
  config: NonNullable<AgentConfig["realtime"]>;
  whitelists?: ProviderWhitelist;
  onChange: (config: NonNullable<AgentConfig["realtime"]>) => void;
}

export function RealtimeConfigSection({ config, whitelists, onChange }: RealtimeConfigSectionProps) {
  const rows = whitelists?.realtime ?? [];

  const providers = [...new Set(rows.map((r) => r.provider_name))];
  const models = [...new Set(rows.filter((r) => r.provider_name === config.provider).map((r) => r.model_name))];
  const providerMeta = rows.find((r) => r.provider_name === config.provider)?.metadata;
  const voices = providerMeta?.voices ?? [];
  const note = providerMeta?.note;

  const update = (field: keyof NonNullable<AgentConfig["realtime"]>, value: string | number) =>
    onChange({ ...config, [field]: value });

  const handleProviderChange = (provider: string) => {
    const meta = rows.find((r) => r.provider_name === provider)?.metadata;
    const providerModels = rows.filter((r) => r.provider_name === provider).map((r) => r.model_name);
    onChange({
      ...config,
      provider,
      model: (meta?.default_model as string) || providerModels[0] || "",
      voice: (meta?.default_voice as string) || "",
    });
  };

  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No speech-to-speech providers are available. Apply migration 016 and make sure at least one realtime provider
        is enabled.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Speech-to-speech model</h3>
          <p className="text-sm text-muted-foreground">
            One model listens, thinks and speaks — the lowest-latency pipeline. It replaces separate speech
            recognition and text-to-speech. Prompt, tools and knowledge still apply.
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
                {providers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {formatProviderName(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Model</Label>
            <Select value={config.model} onValueChange={(v) => update("model", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {voices.length > 0 && (
          <div className="space-y-2 mt-3 max-w-xs">
            <Label className="text-sm text-muted-foreground">Voice</Label>
            <Select value={config.voice} onValueChange={(v) => update("voice", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {note && (
          <p className="text-xs text-muted-foreground mt-2 border-l-2 border-amber-500/40 pl-2">{note}</p>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Temperature</h3>
          <p className="text-sm text-muted-foreground">
            Controls randomness. Lower is more focused, higher more varied.
          </p>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-mono">
              {(config.temperature ?? 0.7).toFixed(2)}
            </span>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[config.temperature ?? 0.7]}
            onValueChange={(v) => update("temperature", v[0])}
            className="py-4"
          />
        </div>
      </div>

      <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
        Speech-to-speech is fastest (~0.5–0.8 s) but gives less control over grounding answers in a knowledge base,
        and dialect quality varies by provider. Test with real calls before production, especially for Arabic.
      </div>
    </div>
  );
}
