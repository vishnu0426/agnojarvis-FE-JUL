/**
 * MCP Configuration Section
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { AgentConfig, MCPServerConfig } from "@/services/api";

interface MCPConfigSectionProps {
  config: AgentConfig["mcp"];
  onChange: (config: AgentConfig["mcp"]) => void;
}

export function MCPConfigSection({ config, onChange }: MCPConfigSectionProps) {
  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");

  const toggleMCP = () => {
    onChange({
      ...config,
      enabled: !config.enabled,
    });
  };

  const addMCPServer = () => {
    if (!newServerUrl.trim()) return;
    
    const newServer: MCPServerConfig = {
      name: newServerName.trim() || `Server ${config.servers.length + 1}`,
      url: newServerUrl.trim(),
      capabilities: [],
    };
    
    onChange({
      ...config,
      servers: [...config.servers, newServer],
    });
    setNewServerName("");
    setNewServerUrl("");
  };

  const removeMCPServer = (index: number) => {
    onChange({
      ...config,
      servers: config.servers.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
        <div>
          <Label className="text-base font-medium">Enable MCP</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect external data sources and services
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={toggleMCP}
        />
      </div>

      {config.enabled && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Add MCP Server</Label>
            <Input
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              placeholder="Server name (optional)"
            />
            <div className="flex gap-2">
              <Input
                value={newServerUrl}
                onChange={(e) => setNewServerUrl(e.target.value)}
                placeholder="https://mcp-server.example.com"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMCPServer();
                  }
                }}
              />
              <Button onClick={addMCPServer} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {config.servers.length > 0 && (
            <div className="space-y-2">
              <Label>Configured Servers ({config.servers.length})</Label>
              <div className="space-y-2">
                {config.servers.map((server, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{server.name}</p>
                      <code className="text-xs text-muted-foreground">{server.url}</code>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeMCPServer(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}