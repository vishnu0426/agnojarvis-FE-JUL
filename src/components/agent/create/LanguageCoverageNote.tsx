/**
 * Small notes shown under the STT / TTS language pickers:
 *  - languages the agent speaks that this component does not cover
 *  - how the provider will treat several languages
 */

import { AlertTriangle, Info } from "lucide-react";
import { coversLanguage, languageLabel } from "@/lib/languages";
import type { LanguageCatalog } from "@/services/api";

interface Props {
  catalog: LanguageCatalog;
  selected: string[];
  agentLanguages?: string[];
  what: "recognise" | "speak";
  hint?: { level: "info" | "warn"; text: string } | null;
  /** Selected languages the current provider cannot handle. */
  unsupported?: string[];
  providerName?: string;
}

export function LanguageCoverageNote({
  catalog,
  selected,
  agentLanguages = [],
  what,
  hint,
  unsupported = [],
  providerName,
}: Props) {
  const missing = agentLanguages.filter((l) => !coversLanguage(selected, l, catalog.aliases));
  if (missing.length === 0 && unsupported.length === 0 && !hint) return null;
  return (
    <div className="space-y-1 text-xs">
      {unsupported.length > 0 && (
        <p className="flex items-start gap-1.5 text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {providerName ?? "This provider"} does not support {unsupported.map((u) => languageLabel(u, catalog)).join(", ")}.
            Remove {unsupported.length === 1 ? "it" : "them"} or pick another provider.
          </span>
        </p>
      )}
      {missing.length > 0 && (
        <p className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            The agent is set to speak {missing.map((m) => languageLabel(m, catalog)).join(", ")}, but this
            setting will not {what} it.
          </span>
        </p>
      )}
      {hint && (
        <p
          className={`flex items-start gap-1.5 ${
            hint.level === "warn" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          }`}
        >
          {hint.level === "warn" ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <span>{hint.text}</span>
        </p>
      )}
    </div>
  );
}
