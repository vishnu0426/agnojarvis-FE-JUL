/**
 * Agent Configuration Editor Component
 *
 * User-friendly configuration editor with:
 * - Collapsible sections for better organization
 * - Inline help and examples
 * - Visual status indicators
 * - Tool categories and search
 * - Better form layout and spacing
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentConfig, ProviderWhitelist, ToolDefinition } from "@/services/api";
import { 
  Save, 
  X, 
  CheckCircle2,
  AlertCircle,
  Info,
  Search,
  Plus,
  Trash2,
  Cpu,
  Wrench,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentConfigEditorProps {
  config: AgentConfig;
  whitelists?: ProviderWhitelist;
  tools?: ToolDefinition[];
  onSave: (config: AgentConfig) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function AgentConfigEditor({
  config,
  whitelists,
  tools,
  onSave,
  onCancel,
  isSaving = false,
}: AgentConfigEditorProps) {
  const [editedConfig, setEditedConfig] = useState<AgentConfig>(config);
  const [sttLanguages, setSttLanguages] = useState<string[]>([]);
  const [ttsLanguages, setTtsLanguages] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    setEditedConfig(config);
    setHasUnsavedChanges(false);
  }, [config]);

  // Track changes
  useEffect(() => {
    if (JSON.stringify(editedConfig) !== JSON.stringify(config)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [editedConfig, config]);

  // Fetch STT languages when provider changes
  useEffect(() => {
    const fetchSTTLanguages = async () => {
      if (editedConfig.stt.provider) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/v1/providers/metadata/stt/${editedConfig.stt.provider}`
          );
          if (response.ok) {
            const data = await response.json();
            setSttLanguages(data.metadata?.languages || []);
          }
        } catch (error) {
          console.error("Failed to fetch STT languages:", error);
          setSttLanguages([]);
        }
      }
    };
    fetchSTTLanguages();
  }, [editedConfig.stt.provider]);

  // Fetch TTS languages when provider changes
  useEffect(() => {
    const fetchTTSLanguages = async () => {
      if (editedConfig.tts.provider) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/v1/providers/metadata/tts/${editedConfig.tts.provider}`
          );
          if (response.ok) {
            const data = await response.json();
            setTtsLanguages(data.metadata?.languages || []);
          }
        } catch (error) {
          console.error("Failed to fetch TTS languages:", error);
          setTtsLanguages([]);
        }
      }
    };
    fetchTTSLanguages();
  }, [editedConfig.tts.provider]);

  const handleSave = () => {
    onSave(editedConfig);
  };

  const updatePrompt = (field: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      prompt: { ...editedConfig.prompt, [field]: value },
    });
  };

  const updateLLM = (field: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      llm: { ...editedConfig.llm, [field]: value },
    });
  };

  const updateSTT = (field: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      stt: { ...editedConfig.stt, [field]: value },
    });
  };

  const updateTTS = (field: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      tts: { ...editedConfig.tts, [field]: value },
    });
  };

  const updateMCP = (field: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      mcp: { ...editedConfig.mcp, [field]: value } as any,
    });
  };

  const addMCPServer = () => {
    const newServer = {
      name: "",
      url: "",
      capabilities: [],
    };
    setEditedConfig({
      ...editedConfig,
      mcp: {
        ...editedConfig.mcp,
        servers: [...(editedConfig.mcp?.servers || []), newServer],
      } as any,
    });
  };

  const updateMCPServer = (index: number, field: string, value: any) => {
    const servers = [...(editedConfig.mcp?.servers || [])];
    servers[index] = { ...servers[index], [field]: value };
    setEditedConfig({
      ...editedConfig,
      mcp: {
        ...editedConfig.mcp,
        servers,
      } as any,
    });
  };

  const removeMCPServer = (index: number) => {
    const servers = [...(editedConfig.mcp?.servers || [])];
    servers.splice(index, 1);
    setEditedConfig({
      ...editedConfig,
      mcp: {
        ...editedConfig.mcp,
        servers,
      } as any,
    });
  };

  const toggleTool = (toolName: string, enabled: boolean) => {
    setEditedConfig({
      ...editedConfig,
      tools: { ...editedConfig.tools, [toolName]: enabled },
    });
  };

  // HTTP Tool Configuration Functions
  const updateHTTPTool = (field: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      http_tool: { ...editedConfig.http_tool, [field]: value } as any,
    });
  };

  const addHTTPRequest = () => {
    const newRequest = {
      name: "",
      url: "",
      method: "GET" as const,
      headers: "",
      body: "",
      description: "",
    };
    setEditedConfig({
      ...editedConfig,
      http_tool: {
        ...editedConfig.http_tool,
        enabled: editedConfig.http_tool?.enabled || false,
        requests: [...(editedConfig.http_tool?.requests || []), newRequest],
      } as any,
    });
  };

  const updateHTTPRequest = (index: number, field: string, value: any) => {
    const requests = [...(editedConfig.http_tool?.requests || [])];
    requests[index] = { ...requests[index], [field]: value };
    setEditedConfig({
      ...editedConfig,
      http_tool: {
        ...editedConfig.http_tool,
        enabled: editedConfig.http_tool?.enabled || false,
        requests,
      } as any,
    });
  };

  const removeHTTPRequest = (index: number) => {
    const requests = [...(editedConfig.http_tool?.requests || [])];
    requests.splice(index, 1);
    setEditedConfig({
      ...editedConfig,
      http_tool: {
        ...editedConfig.http_tool,
        enabled: editedConfig.http_tool?.enabled || false,
        requests,
      } as any,
    });
  };

  const validateHTTPRequest = (index: number): { valid: boolean; errors: string[] } => {
    const request = editedConfig.http_tool?.requests?.[index];
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

  // Get unique providers from whitelists
  const getLLMProviders = () => {
    if (!whitelists?.llm) return [];
    const uniqueProviders = [...new Set(whitelists.llm.map((item: any) => item.provider_name))];
    return uniqueProviders;
  };

  const getSTTProviders = () => {
    if (!whitelists?.stt) return [];
    const uniqueProviders = [...new Set(whitelists.stt.map((item: any) => item.provider_name))];
    return uniqueProviders;
  };

  const getTTSProviders = () => {
    if (!whitelists?.tts) return [];
    const uniqueProviders = [...new Set(whitelists.tts.map((item: any) => item.provider_name))];
    return uniqueProviders;
  };

  // Get available models for selected provider
  const getLLMModels = () => {
    if (!whitelists?.llm) return [];
    return whitelists.llm
      .filter((item: any) => item.provider_name === editedConfig.llm.provider)
      .map((item: any) => item.model_name);
  };

  const getSTTModels = () => {
    if (!whitelists?.stt) return [];
    return whitelists.stt
      .filter((item: any) => item.provider_name === editedConfig.stt.provider)
      .map((item: any) => item.model_name);
  };

  const getTTSVoices = () => {
    if (!whitelists?.tts) return [];

    const selectedEngine = editedConfig.tts.speech_engine;

    return whitelists.tts
      .filter((item: any) => {
        if (item.provider_name !== editedConfig.tts.provider) return false;
        if (item.provider_name === 'aws' && selectedEngine && item.engines) {
          return item.engines.includes(selectedEngine);
        }
        return true;
      })
      .map((item: any) => item.model_name);
  };

  // Filter and categorize tools
  const filteredTools = tools?.filter(tool => 
    tool.tool_name !== 'transfer_to_number' &&
    tool.tool_name.toLowerCase().includes(toolSearchQuery.toLowerCase())
  );

  // Check configuration status
  const isLLMConfigured = editedConfig.llm.provider && editedConfig.llm.model;
  const isSTTConfigured = editedConfig.stt.provider && editedConfig.stt.model;
  const isTTSConfigured = editedConfig.tts.provider && editedConfig.tts.voice;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic">
                <Info className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="providers">
                <Cpu className="w-4 h-4 mr-2" />
                AI Providers
              </TabsTrigger>
              <TabsTrigger value="tools">
                <Wrench className="w-4 h-4 mr-2" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info - CORRECTED ORDER */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>Personality & Instructions</CardTitle>
                    {editedConfig.prompt.system_prompt && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <CardDescription>
                    Define how your agent behaves and communicates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 1. GREETING MESSAGE - FIRST */}
                  {editedConfig.prompt.greeting !== undefined && (
                    <>
                      <div className="space-y-3">
                        <Label htmlFor="greeting" className="text-base font-medium">
                          Greeting Message
                        </Label>
                        <Input
                          id="greeting"
                          value={editedConfig.prompt.greeting}
                          onChange={(e) => updatePrompt("greeting", e.target.value)}
                          className="text-base h-11"
                          placeholder="Hello! How can I help you today?"
                        />
                        <p className="text-sm text-muted-foreground">
                          The first message users hear when they connect
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* 2. TONE AND LANGUAGE - SECOND */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="tone" className="text-base font-medium">Tone</Label>
                      <Select
                        value={editedConfig.prompt.tone}
                        onValueChange={(value) => updatePrompt("tone", value)}
                      >
                        <SelectTrigger id="tone" className="h-11">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="empathetic">Empathetic</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How the agent should speak to users
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="language" className="text-base font-medium">Language</Label>
                      <Select
                        value={editedConfig.prompt.language}
                        onValueChange={(value) => updatePrompt("language", value)}
                      >
                        <SelectTrigger id="language" className="h-11">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (EN)</SelectItem>
                          <SelectItem value="es">Spanish (ES)</SelectItem>
                          <SelectItem value="fr">French (FR)</SelectItem>
                          <SelectItem value="de">German (DE)</SelectItem>
                          <SelectItem value="it">Italian (IT)</SelectItem>
                          <SelectItem value="pt">Portuguese (PT)</SelectItem>
                          <SelectItem value="zh">Chinese (ZH)</SelectItem>
                          <SelectItem value="ja">Japanese (JA)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Primary language for responses
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* 3. SYSTEM PROMPT - THIRD (NO VIEW EXAMPLES BUTTON) */}
                  <div className="space-y-3">
                    <Label htmlFor="system_prompt" className="text-base font-medium">
                      System Prompt
                    </Label>
                    <Textarea
                      id="system_prompt"
                      value={editedConfig.prompt.system_prompt}
                      onChange={(e) => updatePrompt("system_prompt", e.target.value)}
                      rows={8}
                      className="text-base resize-none"
                      placeholder="You are a helpful and friendly voice assistant. Your goal is to..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Define your agent's role, personality, and how it should respond to users
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: AI Providers - NO CHANGES */}
            <TabsContent value="providers" className="space-y-6">
              {/* LLM Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>Language Model (LLM)</CardTitle>
                    {isLLMConfigured ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <CardDescription>
                    The AI model that powers conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="llm_provider" className="text-base font-medium">Provider</Label>
                      <Select
                        value={editedConfig.llm.provider}
                        onValueChange={(value) => updateLLM("provider", value)}
                      >
                        <SelectTrigger id="llm_provider" className="h-11">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {getLLMProviders().map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="llm_model" className="text-base font-medium">Model</Label>
                      <Select
                        value={editedConfig.llm.model}
                        onValueChange={(value) => updateLLM("model", value)}
                      >
                        <SelectTrigger id="llm_model" className="h-11">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {getLLMModels().map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="temperature" className="text-base font-medium">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        className="h-11"
                        value={editedConfig.llm.temperature}
                        onChange={(e) => updateLLM("temperature", parseFloat(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Controls randomness (0-2). Lower = more focused, Higher = more creative
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="max_tokens" className="text-base font-medium">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        className="h-11"
                        value={editedConfig.llm.max_tokens}
                        onChange={(e) => updateLLM("max_tokens", parseInt(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Maximum length of each response
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* STT Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>Speech-to-Text (STT)</CardTitle>
                    {isSTTConfigured ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <CardDescription>
                    Converts user speech into text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="stt_provider" className="text-base font-medium">Provider</Label>
                      <Select
                        value={editedConfig.stt.provider}
                        onValueChange={(value) => updateSTT("provider", value)}
                      >
                        <SelectTrigger id="stt_provider" className="h-11">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSTTProviders().map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="stt_model" className="text-base font-medium">Model</Label>
                      <Select
                        value={editedConfig.stt.model}
                        onValueChange={(value) => updateSTT("model", value)}
                      >
                        <SelectTrigger id="stt_model" className="h-11">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSTTModels().map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="stt_language" className="text-base font-medium">Language</Label>
                      {sttLanguages.length > 0 ? (
                        <Select
                          value={editedConfig.stt.language || sttLanguages[0]}
                          onValueChange={(value) => updateSTT("language", value)}
                        >
                          <SelectTrigger id="stt_language" className="h-11">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {sttLanguages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="stt_language"
                          className="h-11"
                          value={editedConfig.stt.language || ""}
                          onChange={(e) => updateSTT("language", e.target.value)}
                          placeholder="e.g., en, multi"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TTS Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>Text-to-Speech (TTS)</CardTitle>
                    {isTTSConfigured ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <CardDescription>
                    Converts agent responses into speech
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="tts_provider" className="text-base font-medium">Provider</Label>
                      <Select
                        value={editedConfig.tts.provider}
                        onValueChange={(value) => updateTTS("provider", value)}
                      >
                        <SelectTrigger id="tts_provider" className="h-11">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTTSProviders().map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="tts_voice" className="text-base font-medium">Voice</Label>
                      <Select
                        value={editedConfig.tts.voice}
                        onValueChange={(value) => updateTTS("voice", value)}
                      >
                        <SelectTrigger id="tts_voice" className="h-11">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTTSVoices().map((voice) => (
                            <SelectItem key={voice} value={voice}>
                              {voice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      {editedConfig.tts.provider === 'aws' ? (
                        <>
                          <Label htmlFor="speech_engine" className="text-base font-medium">Engine</Label>
                          <Select
                            value={editedConfig.tts.speech_engine || ""}
                            onValueChange={(value) => updateTTS("speech_engine", value)}
                          >
                            <SelectTrigger id="speech_engine" className="h-11">
                              <SelectValue placeholder="Select engine" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="neural">Neural</SelectItem>
                              <SelectItem value="generative">Generative</SelectItem>
                              <SelectItem value="long-form">Long-form</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      ) : ttsLanguages.length > 0 ? (
                        <>
                          <Label htmlFor="tts_language" className="text-base font-medium">Language</Label>
                          <Select
                            value={editedConfig.tts.language || ttsLanguages[0]}
                            onValueChange={(value) => updateTTS("language", value)}
                          >
                            <SelectTrigger id="tts_language" className="h-11">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {ttsLanguages.map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                  {lang.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Label htmlFor="tts_language" className="text-base font-medium">Language</Label>
                          <Input
                            id="tts_language"
                            className="h-11"
                            value={editedConfig.tts.language || ""}
                            onChange={(e) => updateTTS("language", e.target.value)}
                            placeholder="e.g., en-US"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Tools - NO CHANGES - Keeping rest of file same */}
            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>Function Tools</CardTitle>
                    <Badge variant="secondary">
                      {Object.values(editedConfig.tools).filter(Boolean).length} enabled
                    </Badge>
                  </div>
                  <CardDescription>
                    Enable or disable tools that your agent can use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tools..."
                      className="pl-9 h-10"
                      value={toolSearchQuery}
                      onChange={(e) => setToolSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Tools List */}
                  <div className="space-y-3">
                    {filteredTools?.map((tool) => {
                      const isEnabled = editedConfig.tools[tool.tool_name] ?? tool.is_enabled;
                      return (
                        <div
                          key={tool.tool_name}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-base font-medium capitalize">
                                {tool.tool_name.replace(/_/g, ' ')}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium",
                                  tool.risk_level === 'high' && 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400',
                                  tool.risk_level === 'medium' && 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400',
                                  tool.risk_level === 'low' && 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
                                )}
                              >
                                {tool.risk_level.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => toggleTool(tool.tool_name, checked)}
                            className="ml-4 mt-1"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {filteredTools?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tools found matching "{toolSearchQuery}"
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Advanced - NO CHANGES - Keeping full advanced tab */}
            <TabsContent value="advanced" className="space-y-6">
              {/* MCP Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>Model Context Protocol (MCP)</CardTitle>
                    {editedConfig.mcp?.enabled && (
                      <Badge variant="secondary">
                        {editedConfig.mcp?.servers?.length || 0} servers
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Enable external integrations like Google Calendar, Notion, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="mcp_enabled" className="text-base font-medium">Enable MCP</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow agent to use external context and tools
                      </p>
                    </div>
                    <Switch
                      id="mcp_enabled"
                      checked={editedConfig.mcp?.enabled || false}
                      onCheckedChange={(checked) => updateMCP("enabled", checked)}
                    />
                  </div>

                  {editedConfig.mcp?.enabled && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-medium">MCP Servers</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMCPServer}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Server
                          </Button>
                        </div>

                        {editedConfig.mcp?.servers?.map((server, index) => (
                          <Card key={index}>
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium">Server {index + 1}</h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMCPServer(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm">Name</Label>
                                  <Input
                                    value={server.name}
                                    onChange={(e) => updateMCPServer(index, "name", e.target.value)}
                                    placeholder="e.g., Google Calendar"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm">URL</Label>
                                  <Input
                                    value={server.url}
                                    onChange={(e) => updateMCPServer(index, "url", e.target.value)}
                                    placeholder="https://mcp.example.com"
                                    className="h-10"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {(!editedConfig.mcp?.servers || editedConfig.mcp.servers.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No MCP servers configured. Click "Add Server" to create one.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* HTTP Tool Configuration - Keeping all the HTTP tool code */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CardTitle>HTTP Tool Configuration</CardTitle>
                    {editedConfig.http_tool?.enabled && (
                      <Badge variant="secondary">
                        {editedConfig.http_tool?.requests?.length || 0} requests
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Configure pre-defined HTTP requests for external API calls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="http_tool_enabled" className="text-base font-medium">Enable HTTP Tool</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow agent to make HTTP requests to external APIs
                      </p>
                    </div>
                    <Switch
                      id="http_tool_enabled"
                      checked={editedConfig.http_tool?.enabled || false}
                      onCheckedChange={(checked) => updateHTTPTool("enabled", checked)}
                    />
                  </div>

                  {editedConfig.http_tool?.enabled && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-medium">HTTP Requests</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addHTTPRequest}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Request
                          </Button>
                        </div>

                        {editedConfig.http_tool?.requests?.map((request, index) => {
                          const validation = validateHTTPRequest(index);
                          const showBody = request.method !== 'GET' && request.method !== 'DELETE';

                          return (
                            <Card key={index}>
                              <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-medium">Request {index + 1}</h5>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeHTTPRequest(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Name *</Label>
                                    <Input
                                      value={request.name}
                                      onChange={(e) => updateHTTPRequest(index, "name", e.target.value)}
                                      placeholder="e.g., Get Weather"
                                      className="h-10"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Method *</Label>
                                    <Select
                                      value={request.method}
                                      onValueChange={(value) => updateHTTPRequest(index, "method", value)}
                                    >
                                      <SelectTrigger className="h-10">
                                        <SelectValue />
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
                                  <Label className="text-sm">URL *</Label>
                                  <Input
                                    value={request.url}
                                    onChange={(e) => updateHTTPRequest(index, "url", e.target.value)}
                                    placeholder="https://api.example.com/endpoint"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Description</Label>
                                  <Input
                                    value={request.description || ""}
                                    onChange={(e) => updateHTTPRequest(index, "description", e.target.value)}
                                    placeholder="What does this request do?"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Headers (JSON)</Label>
                                  <Textarea
                                    value={request.headers || ""}
                                    onChange={(e) => updateHTTPRequest(index, "headers", e.target.value)}
                                    placeholder='{"Authorization": "Bearer token"}'
                                    rows={3}
                                    className="resize-none font-mono text-sm"
                                  />
                                </div>

                                {showBody && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Request Body</Label>
                                    <Textarea
                                      value={request.body || ""}
                                      onChange={(e) => updateHTTPRequest(index, "body", e.target.value)}
                                      placeholder='{"key": "value"}'
                                      rows={4}
                                      className="resize-none font-mono text-sm"
                                    />
                                  </div>
                                )}

                                {!validation.valid && (
                                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400 space-y-1">
                                    {validation.errors.map((error, i) => (
                                      <div key={i}>• {error}</div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}

                        {(!editedConfig.http_tool?.requests || editedConfig.http_tool.requests.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No HTTP requests configured. Click "Add Request" to create one.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-background px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <span className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full mr-2"></span>
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}