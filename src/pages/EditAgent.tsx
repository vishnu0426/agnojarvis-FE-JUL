/**
 * Agent Edit Page
 * 
 * Clean layout matching Create Agent with tabs at top
 * Reuses all section components from Create Agent
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  useAgentConfig,
  useUpdateAgentConfig,
  useProviderWhitelists,
  useToolDefinitions,
} from "@/hooks/use-agent-config";
import { useAgents } from "@/hooks/use-agents"; // ADD THIS LINE
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentConfig as AgentConfigType } from "@/services/api";

// Import configuration components (same as CreateAgent)
import { PromptConfigSection } from "@/components/agent/create/PromptConfigSection";
import { LLMConfigSection } from "@/components/agent/create/LLMConfigSection";
import { STTConfigSection } from "@/components/agent/create/STTConfigSection";
import { TTSConfigSection } from "@/components/agent/create/TTSConfigSection";
import { ToolsConfigSection } from "@/components/agent/create/ToolsConfigSection";
import { AdvancedConfigSection } from "@/components/agent/create/AdvancedConfigSection";

const CONFIG_TABS = [
  { id: "prompt", label: "Prompt" },
  { id: "llm", label: "LLM Settings" },
  { id: "stt", label: "Speech Recognition (ASR)" },
  { id: "tts", label: "Text-to-Speech" },
  { id: "tools", label: "Tools" },
  { id: "advanced", label: "Advanced" },
];

export default function EditAgent() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();

  const { data: agentData, isLoading, error } = useAgentConfig(agentId!);
  const { data: whitelists } = useProviderWhitelists();
  const { data: tools } = useToolDefinitions();
  const { data: agents } = useAgents(); // ADD THIS LINE to get agent name
  const updateAgent = useUpdateAgentConfig(agentId!);

  const [activeTab, setActiveTab] = useState("prompt");
  const [name, setName] = useState(""); // ADD THIS LINE
  const [config, setConfig] = useState<AgentConfigType | null>(null);

  // Load agent data when available
  useEffect(() => {
    if (agentData) {
      setConfig(agentData.config);
    }
    // Load agent name from agents list
    if (agents && agentId) {
      const currentAgent = agents.find(a => a.agent_id === agentId);
      if (currentAgent) {
        setName(currentAgent.name);
      }
    }
  }, [agentData, agents, agentId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    if (!config) return;

    try {
      await updateAgent.mutateAsync({
        ...config,
        name: name, // ADD THIS LINE
        updated_by: "user",
      });
      toast.success("Agent updated successfully!");
      navigate("/agents");
    } catch (error) {
      console.error("Failed to update agent:", error);
      // Error is handled by the mutation
    }
  };

  const renderTabContent = () => {
    if (!config) return null;

    switch (activeTab) {
      case "prompt":
        return (
          <PromptConfigSection
            name={name}
            config={config.prompt}
            onNameChange={setName}
            onChange={(prompt) => setConfig({ ...config, prompt })}
          // readOnly={false} - Don't pass readOnly, or set to false
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

  // Error state
  if (!agentId) {
    return (
      <DashboardLayout title="Edit Agent">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Agent ID is required</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Edit Agent">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load agent configuration: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Loading state
  if (isLoading || !config) {
    return (
      <DashboardLayout title="Edit Agent">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

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
            <Button onClick={handleSave} disabled={updateAgent.isPending}>
              {updateAgent.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}