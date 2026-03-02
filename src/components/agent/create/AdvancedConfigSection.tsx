/**
 * Advanced Configuration Section
 * 
 * Handles MCP and HTTP Tool configurations with collapsible sections
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { AgentConfig, MCPServerConfig, HTTPToolConfig } from "@/services/api";

interface AdvancedConfigSectionProps {
  mcpConfig: AgentConfig["mcp"];
  httpToolConfig?: HTTPToolConfig;
  onMCPChange: (config: AgentConfig["mcp"]) => void;
  onHTTPToolChange: (config: HTTPToolConfig) => void;
}

export function AdvancedConfigSection({
  mcpConfig,
  httpToolConfig,
  onMCPChange,
  onHTTPToolChange,
}: AdvancedConfigSectionProps) {
  const [httpToolsOpen, setHttpToolsOpen] = useState(false);
  const [mcpServersOpen, setMcpServersOpen] = useState(false);

  // MCP Functions
  const addMCPServer = () => {
    const newServer: MCPServerConfig = {
      name: "",
      url: "",
      capabilities: [],
    };
    onMCPChange({
      ...mcpConfig,
      enabled: true,
      servers: [...mcpConfig.servers, newServer],
    });
  };

  const updateMCPServer = (index: number, field: keyof MCPServerConfig, value: any) => {
    const servers = [...mcpConfig.servers];
    servers[index] = { ...servers[index], [field]: value };
    onMCPChange({
      ...mcpConfig,
      servers,
    });
  };

  const removeMCPServer = (index: number) => {
    const servers = mcpConfig.servers.filter((_, i) => i !== index);
    onMCPChange({
      ...mcpConfig,
      servers,
    });
  };

  const addPresetMCPServer = (preset: string) => {
    const presets: Record<string, MCPServerConfig> = {
      "google-calendar": {
        name: "Google Calendar",
        url: "https://mcp.google.com/calendar",
        capabilities: ["context", "tools"],
      },
      "notion": {
        name: "Notion",
        url: "https://mcp.notion.com",
        capabilities: ["context", "tools", "resources"],
      },
    };

    const presetConfig = presets[preset];
    if (presetConfig) {
      onMCPChange({
        ...mcpConfig,
        enabled: true,
        servers: [...mcpConfig.servers, presetConfig],
      });
    }
  };

  // HTTP Tool Functions
  const addHTTPRequest = () => {
    const newRequest = {
      name: "",
      url: "",
      method: "GET" as const,
      headers: "",
      body: "",
      description: "",
    };
    onHTTPToolChange({
      enabled: true,
      requests: [...(httpToolConfig?.requests || []), newRequest],
    });
  };

  const updateHTTPRequest = (index: number, field: string, value: any) => {
    const requests = [...(httpToolConfig?.requests || [])];
    requests[index] = { ...requests[index], [field]: value };
    onHTTPToolChange({
      enabled: httpToolConfig?.enabled || false,
      requests,
    });
  };

  const removeHTTPRequest = (index: number) => {
    const requests = (httpToolConfig?.requests || []).filter((_, i) => i !== index);
    onHTTPToolChange({
      enabled: httpToolConfig?.enabled || false,
      requests,
    });
  };

  const validateHTTPRequest = (index: number): { valid: boolean; errors: string[] } => {
    const request = httpToolConfig?.requests?.[index];
    const errors: string[] = [];

    if (!request) return { valid: false, errors: ["Request not found"] };

    if (!request.name?.trim()) {
      errors.push("Name is required");
    }

    if (!request.url?.trim()) {
      errors.push("URL is required");
    } else if (!request.url.startsWith("http://") && !request.url.startsWith("https://")) {
      errors.push("URL must start with http:// or https://");
    }

    if (request.headers?.trim()) {
      try {
        JSON.parse(request.headers);
      } catch {
        errors.push("Headers must be valid JSON");
      }
    }

    return { valid: errors.length === 0, errors };
  };

  return (
    <div className="space-y-0">
      {/* HTTP Tools - Collapsible */}
      <div className="border-b py-6 first:pt-0">
        <button
          onClick={() => setHttpToolsOpen(!httpToolsOpen)}
          className="w-full flex items-start gap-3 text-left group"
        >
          {httpToolsOpen ? (
            <ChevronDown className="w-4 h-4 mt-0.5 text-muted-foreground transition-transform" />
          ) : (
            <ChevronUp className="w-4 h-4 mt-0.5 text-muted-foreground rotate-180 transition-transform" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-foreground">HTTP tools</h3>
                <p className="text-sm text-muted-foreground">
                  Define web requests to enable your agent to interact with web-based APIs and services.
                </p>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {httpToolConfig?.enabled ? "ON" : "OFF"}
                </span>
                <button
                  onClick={() => onHTTPToolChange({
                    enabled: !httpToolConfig?.enabled,
                    requests: httpToolConfig?.requests || []
                  })}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${httpToolConfig?.enabled ? 'bg-primary' : 'bg-muted'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                      ${httpToolConfig?.enabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </button>

        {httpToolsOpen && httpToolConfig?.enabled && (
          <div className="mt-4 ml-7 space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={addHTTPRequest}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add HTTP tool
            </Button>

            {httpToolConfig?.requests && httpToolConfig.requests.length > 0 && (
              <div className="space-y-4">
                {httpToolConfig.requests.map((request, index) => {
                  const validation = validateHTTPRequest(index);
                  const showBody = request.method !== 'GET' && request.method !== 'DELETE';

                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Request {index + 1}</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHTTPRequest(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={request.name}
                            onChange={(e) => updateHTTPRequest(index, "name", e.target.value)}
                            placeholder="e.g., Get Weather"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>HTTP Method *</Label>
                          <Select
                            value={request.method}
                            onValueChange={(value) => updateHTTPRequest(index, "method", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                              <SelectItem value="PATCH">PATCH</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URL *</Label>
                        <Input
                          value={request.url}
                          onChange={(e) => updateHTTPRequest(index, "url", e.target.value)}
                          placeholder="https://api.example.com/endpoint"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={request.description || ""}
                          onChange={(e) => updateHTTPRequest(index, "description", e.target.value)}
                          placeholder="What does this request do?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Headers (JSON)</Label>
                        <Textarea
                          value={request.headers || ""}
                          onChange={(e) => updateHTTPRequest(index, "headers", e.target.value)}
                          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                          rows={3}
                          className="font-mono text-xs"
                        />
                      </div>

                      {showBody && (
                        <div className="space-y-2">
                          <Label>Request Body</Label>
                          <Textarea
                            value={request.body || ""}
                            onChange={(e) => updateHTTPRequest(index, "body", e.target.value)}
                            placeholder='{"key": "value"}'
                            rows={4}
                            className="font-mono text-xs"
                          />
                        </div>
                      )}

                      {!validation.valid && (
                        <div className="text-sm text-destructive space-y-1">
                          {validation.errors.map((error, i) => (
                            <div key={i}>• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MCP Servers - Collapsible */}
      <div className="border-b py-6">
        <button
          onClick={() => setMcpServersOpen(!mcpServersOpen)}
          className="w-full flex items-start gap-3 text-left group"
        >
          {mcpServersOpen ? (
            <ChevronDown className="w-4 h-4 mt-0.5 text-muted-foreground transition-transform" />
          ) : (
            <ChevronUp className="w-4 h-4 mt-0.5 text-muted-foreground rotate-180 transition-transform" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-foreground">MCP servers</h3>
                <p className="text-sm text-muted-foreground">
                  Configure external MCP servers for your agent to connect and interact with.
                </p>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {mcpConfig.enabled ? "ON" : "OFF"}
                </span>
                <button
                  onClick={() => onMCPChange({
                    ...mcpConfig,
                    enabled: !mcpConfig.enabled
                  })}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${mcpConfig.enabled ? 'bg-primary' : 'bg-muted'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                      ${mcpConfig.enabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </button>

        {mcpServersOpen && mcpConfig.enabled && (
          <div className="mt-4 ml-7 space-y-4">
            <div className="flex gap-2">
              <Select onValueChange={addPresetMCPServer}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google-calendar">Google Calendar</SelectItem>
                  <SelectItem value="notion">Notion</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={addMCPServer}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add custom
              </Button>
            </div>

            {mcpConfig.servers.length > 0 && (
              <div className="space-y-4">
                {mcpConfig.servers.map((server, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Server {index + 1}</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMCPServer(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={server.name}
                          onChange={(e) => updateMCPServer(index, "name", e.target.value)}
                          placeholder="e.g., Google Calendar"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={server.url}
                          onChange={(e) => updateMCPServer(index, "url", e.target.value)}
                          placeholder="https://mcp.example.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}