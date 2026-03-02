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
import type { AgentConfig } from "@/services/api";

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

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

export function PromptConfigSection({ name, config, onNameChange, onChange, readOnly = false }: PromptConfigSectionProps) {
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
            <h3 className="text-sm font-semibold mb-1">Language</h3>
            <p className="text-sm text-muted-foreground">
              Primary language for responses
            </p>
          </div>
          <Select value={config.language} onValueChange={(value) => updateConfig("language", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}