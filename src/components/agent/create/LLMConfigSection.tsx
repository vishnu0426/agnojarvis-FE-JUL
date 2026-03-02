/**
 * LLM Configuration Section
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
import { Input } from "@/components/ui/input";
import type { AgentConfig, ProviderWhitelist } from "@/services/api";
import { formatProviderName } from "@/lib/format-provider";

interface LLMConfigSectionProps {
  config: AgentConfig["llm"];
  whitelists?: ProviderWhitelist;
  onChange: (config: AgentConfig["llm"]) => void;
}

export function LLMConfigSection({ config, whitelists, onChange }: LLMConfigSectionProps) {
  // Get unique providers
  const getLLMProviders = () => {
    if (!whitelists?.llm) return [];
    const uniqueProviders = [...new Set(whitelists.llm.map((item) => item.provider_name))];
    return uniqueProviders;
  };

  // Get models for selected provider
  const getLLMModels = () => {
    if (!whitelists?.llm) return [];
    const models = whitelists.llm
      .filter((item) => item.provider_name === config.provider)
      .map((item) => item.model_name);
    // Deduplicate models
    return [...new Set(models)];
  };

  const updateConfig = (field: keyof AgentConfig["llm"], value: string | number) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleProviderChange = (provider: string) => {
    const models = whitelists?.llm
      ?.filter((item) => item.provider_name === provider)
      .map((item) => item.model_name) || [];

    // Deduplicate models
    const uniqueModels = [...new Set(models)];

    onChange({
      ...config,
      provider,
      model: uniqueModels[0] || "",
    });
  };

  const llmProviders = getLLMProviders();
  const llmModels = getLLMModels();

  return (
    <div className="space-y-6">
      {/* Provider and Model */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Large language model (LLM)</h3>
          <p className="text-sm text-muted-foreground">
            Your agent's brain, responsible for generating responses and using tools.
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
                {llmProviders.map((provider) => (
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
                {llmModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Temperature</h3>
          <p className="text-sm text-muted-foreground">
            Controls randomness in responses. Lower values are more focused, higher values are more creative.
          </p>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-mono">
              {config.temperature.toFixed(2)}
            </span>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[config.temperature]}
            onValueChange={(value) => updateConfig("temperature", value[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Precise (0.0)</span>
            <span>Balanced (1.0)</span>
            <span>Creative (2.0)</span>
          </div>
        </div>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Max Tokens</h3>
          <p className="text-sm text-muted-foreground">
            Maximum number of tokens in the response.
          </p>
        </div>
        <Input
          type="number"
          min={256}
          max={8192}
          step={256}
          value={config.max_tokens}
          onChange={(e) => updateConfig("max_tokens", parseInt(e.target.value) || 1024)}
          className="max-w-xs mt-3"
        />
      </div>
    </div>
  );
}