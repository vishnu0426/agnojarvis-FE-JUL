/**
 * Pipeline mode selector — two plain radio buttons.
 */

import type { PipelineMode } from "@/lib/pipeline";

const OPTIONS: { mode: PipelineMode; label: string }[] = [
  { mode: "cascaded", label: "Cascaded (STT → LLM → TTS)" },
  { mode: "realtime", label: "Speech-to-speech" },
];

interface PipelineSelectorProps {
  value: PipelineMode;
  onChange: (mode: PipelineMode) => void;
}

export function PipelineSelector({ value, onChange }: PipelineSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Pipeline" className="flex items-center gap-6">
      <span className="text-sm font-medium">Pipeline:</span>
      {OPTIONS.map((opt) => (
        <label key={opt.mode} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="pipeline"
            value={opt.mode}
            checked={value === opt.mode}
            onChange={() => onChange(opt.mode)}
            className="h-4 w-4 accent-primary"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
