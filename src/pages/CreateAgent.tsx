/**
 * Create Agent Page
 * 
 * Two-step process:
 * 1. Basic information (name, description)
 * 2. Full configuration with tabs
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useCreateAgent } from "@/hooks/use-agents";
import { useProviderWhitelists, useToolDefinitions } from "@/hooks/use-agent-config";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AgentConfig as AgentConfigType } from "@/services/api";

// Import configuration components
import { ConfigTabs } from "@/components/agent/create/ConfigTabs";
import { PromptConfigSection } from "@/components/agent/create/PromptConfigSection";
import { LLMConfigSection } from "@/components/agent/create/LLMConfigSection";
import { STTConfigSection } from "@/components/agent/create/STTConfigSection";
import { TTSConfigSection } from "@/components/agent/create/TTSConfigSection";
import { ToolsConfigSection } from "@/components/agent/create/ToolsConfigSection";
import { AdvancedConfigSection } from "@/components/agent/create/AdvancedConfigSection";

const CONFIG_TABS = [
  { id: "prompt", label: "Prompt" },
  { id: "llm", label: "LLM Settings" },
  { id: "stt", label: "Speech-to-Text" },
  { id: "tts", label: "Text-to-Speech" },
  { id: "tools", label: "Tools" },
  { id: "advanced", label: "Advanced" },
];

export default function CreateAgent() {
  const navigate = useNavigate();
  const createAgent = useCreateAgent();
  const { data: whitelists } = useProviderWhitelists();
  const { data: tools } = useToolDefinitions();

  const [activeTab, setActiveTab] = useState("prompt");
  const [name, setName] = useState("");
  const [config, setConfig] = useState<AgentConfigType>({
    prompt: {
      system_prompt: "You are a helpful AI assistant.",
      greeting: "Hello! How can I help you today?",
      tone: "professional",
      language: "en",
    },
    llm: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1024,
    },
    stt: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
    },
    tts: {
      provider: "aws",
      voice: "Matthew",
      speech_engine: "standard",
      language: "en-US",
    },
    tools: {
      transfer_to_department: true,
      transfer_to_number: false,
      schedule_callback: true,
      lookup_customer: true,
      check_queue_status: true,
      place_on_hold: true,
      end_call: true,
    },
    mcp: {
      enabled: false,
      servers: [],
    },
    http_tool: {
      enabled: false,
      requests: [],
    },
  });

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    try {
      await createAgent.mutateAsync({
        name,
        description: "",
        initial_config: {
          ...config,
          updated_by: "user",
        },
      });
      toast.success("Agent created successfully!");
      navigate("/agents");
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create agent:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "prompt":
        return (
          <PromptConfigSection
            name={name}
            config={config.prompt}
            onNameChange={setName}
            onChange={(prompt) => setConfig({ ...config, prompt })}
          />
        );
      case "llm":
        return (
          <LLMConfigSection
            config={config.llm}
            whitelists={whitelists}
            onChange={(llm) => setConfig({ ...config, llm })}
          />
        );
      case "stt":
        return (
          <STTConfigSection
            config={config.stt}
            whitelists={whitelists}
            onChange={(stt) => setConfig({ ...config, stt })}
          />
        );
      case "tts":
        return (
          <TTSConfigSection
            config={config.tts}
            whitelists={whitelists}
            onChange={(tts) => setConfig({ ...config, tts })}
          />
        );
      case "tools":
        return (
          <ToolsConfigSection
            config={config.tools}
            toolDefinitions={tools}
            onChange={(tools) => setConfig({ ...config, tools })}
          />
        );
      case "advanced":
        return (
          <AdvancedConfigSection
            mcpConfig={config.mcp}
            httpToolConfig={config.http_tool}
            onMCPChange={(mcp) => setConfig({ ...config, mcp })}
            onHTTPToolChange={(http_tool) => setConfig({ ...config, http_tool })}
          />
        );
      default:
        return null;
    }
  };


  return (
    <DashboardLayout title="">
      <div className="min-h-screen">
        {/* Tabs - At the very top */}
        <div className="sticky top-0 z-50 bg-background border-b">
          <div className="flex gap-8 px-6">
            {CONFIG_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-w-5xl">
          {renderTabContent()}
        </div>

        {/* Bottom Action Buttons */}
        <div className="py-3 px-6">
          <div className="max-w-5xl flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/agents')}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createAgent.isPending}>
              {createAgent.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}