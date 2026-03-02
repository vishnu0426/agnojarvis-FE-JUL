/**
 * Tools Configuration Section
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AgentConfig, ToolDefinition } from "@/services/api";

interface ToolsConfigSectionProps {
  config: AgentConfig["tools"];
  toolDefinitions?: ToolDefinition[];
  onChange: (config: AgentConfig["tools"]) => void;
}

const DEFAULT_TOOLS = [
  { tool_name: "transfer_to_department", description: "Transfer call to a specific department" },
  { tool_name: "transfer_to_number", description: "Transfer call to a phone number" },
  { tool_name: "schedule_callback", description: "Schedule a callback for later" },
  { tool_name: "lookup_customer", description: "Look up customer information" },
  { tool_name: "check_queue_status", description: "Check current queue status" },
  { tool_name: "place_on_hold", description: "Place caller on hold" },
  { tool_name: "end_call", description: "End the current call" },
];

export function ToolsConfigSection({ config, toolDefinitions, onChange }: ToolsConfigSectionProps) {
  const tools = toolDefinitions || DEFAULT_TOOLS;

  const toggleTool = (toolName: string) => {
    onChange({
      ...config,
      [toolName]: !config[toolName as keyof typeof config],
    });
  };

  return (
    <div className="space-y-6">
      {/* Tools List */}
      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.tool_name}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="flex-1">
              <Label
                htmlFor={`tool-${tool.tool_name}`}
                className="font-medium cursor-pointer text-sm"
              >
                {tool.tool_name.split("_").map((word: string) => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(" ")}
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                {tool.description}
              </p>
            </div>
            <Switch
              id={`tool-${tool.tool_name}`}
              checked={!!config[tool.tool_name as keyof typeof config]}
              onCheckedChange={() => toggleTool(tool.tool_name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}