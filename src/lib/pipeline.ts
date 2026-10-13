/**
 * Pipeline-mode helpers shared by the create and edit agent pages.
 *
 * The backend requires "exactly one of (stt+llm+tts) or realtime", decided by `pipeline`.
 * buildConfigPayload strips the unused side so a cascaded agent never sends a realtime block and vice-versa.
 */

import type { AgentConfig } from "@/services/api";

export type PipelineMode = "cascaded" | "realtime";

export function pipelineOf(config: Pick<AgentConfig, "pipeline">): PipelineMode {
  return config.pipeline === "realtime" ? "realtime" : "cascaded";
}

/** The config object to send, with only the fields the chosen pipeline uses. */
export function buildConfigPayload(config: AgentConfig): AgentConfig {
  const base = {
    pipeline: pipelineOf(config),
    prompt: config.prompt,
    tools: config.tools,
    mcp: config.mcp,
    http_tool: config.http_tool,
  };
  if (pipelineOf(config) === "realtime") {
    return { ...base, realtime: config.realtime } as AgentConfig;
  }
  return { ...base, llm: config.llm, stt: config.stt, tts: config.tts } as AgentConfig;
}

/** True when the validation gate should block saving (mirrors the backend one-of rule). */
export function pipelineError(config: AgentConfig): string | null {
  if (pipelineOf(config) === "realtime") {
    if (!config.realtime?.provider || !config.realtime?.model) {
      return "Choose a speech-to-speech provider and model.";
    }
  } else {
    if (!config.stt?.provider || !config.llm?.provider || !config.tts?.provider) {
      return "Cascaded agents need a speech-recognition, LLM and text-to-speech provider.";
    }
  }
  return null;
}
