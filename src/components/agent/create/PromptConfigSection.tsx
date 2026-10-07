/**
 * Prompt Configuration Section
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageMultiSelect } from "@/components/ui/language-multi-select";
import type { AgentConfig } from "@/services/api";
import { useLanguageCatalog } from "@/hooks/use-language-catalog";
import {
  buildLanguageOptions,
  MAX_GREETING_CHARS,
  MAX_SYSTEM_PROMPT_CHARS,
  sectionLanguages,
} from "@/lib/languages";

interface PromptConfigSectionProps {
  name: string;
  config: AgentConfig["prompt"];
  onNameChange: (name: string) => void;
  onChange: (config: AgentConfig["prompt"]) => void;
  readOnly?: boolean; // For edit mode where name cannot be changed
}

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "empathetic", label: "Empathetic" },
];

function CharCounter({ used, max }: { used: number; max: number }) {
  const over = used > max;
  return (
    <p className={`text-xs ${over ? "text-destructive font-medium" : "text-muted-foreground"}`}>
      {used.toLocaleString()} / {max.toLocaleString()} characters
      {over ? ` - ${(used - max).toLocaleString()} over the limit, the agent cannot be saved` : ""}
    </p>
  );
}

export function PromptConfigSection({ name, config, onNameChange, onChange, readOnly = false }: PromptConfigSectionProps) {
  const { catalog } = useLanguageCatalog();
  const languageOptions = buildLanguageOptions(catalog);
  const selectedLanguages = sectionLanguages(config);

  const handleLanguagesChange = (next: string[]) => {
    if (next.length === 0) return; // at least one language is required
    onChange({ ...config, language: next[0], languages: next });
  };

  const updateConfig = (field: keyof AgentConfig["prompt"], value: string) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Agent Name */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Name</h3>
          <p className="text-sm text-muted-foreground">
            Reference name for dispatch rules and frontends.
          </p>
        </div>
        <Input
          id="agent-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Sales Assistant, Customer Support Bot"
          className="max-w-2xl"
          disabled={readOnly}
        />
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Instructions</h3>
          <p className="text-sm text-muted-foreground">
            Define your agent's personality, tone, and behavior guidelines.
          </p>
        </div>
        <Textarea
          id="system-prompt"
          value={config.system_prompt}
          onChange={(e) => updateConfig("system_prompt", e.target.value)}
          placeholder="You are a helpful AI assistant that..."
          rows={10}
          className="font-mono text-xs resize-none"
        />
        <CharCounter used={config.system_prompt.length} max={MAX_SYSTEM_PROMPT_CHARS} />
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold mb-1">Welcome message</h3>
          <p className="text-sm text-muted-foreground">
            The first message your agent says when a call begins.
          </p>
        </div>
        <Textarea
          id="greeting"
          value={config.greeting || ""}
          onChange={(e) => updateConfig("greeting", e.target.value)}
          placeholder="Greet the user and offer your assistance."
          rows={3}
          className="font-mono text-xs resize-none"
        />
        <CharCounter used={(config.greeting || "").length} max={MAX_GREETING_CHARS} />
      </div>

      {/* Tone and Language */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold mb-1">Tone</h3>
            <p className="text-sm text-muted-foreground">
              Communication style for the agent
            </p>
          </div>
          <Select value={config.tone} onValueChange={(value) => updateConfig("tone", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold mb-1">Languages</h3>
            <p className="text-sm text-muted-foreground">
              Languages the agent can speak. It starts in the primary (starred) one and replies in the
              caller's language when it is on this list.
            </p>
          </div>
          <LanguageMultiSelect
            id="agent-languages"
            value={selectedLanguages}
            onChange={handleLanguagesChange}
            options={languageOptions}
            max={catalog.max_languages}
            placeholder="Select languages"
          />
        </div>
      </div>
    </div>
  );
}