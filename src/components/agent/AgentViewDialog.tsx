/**
 * Agent View/Edit Dialog Component
 * 
 * Single dialog that toggles between View and Edit modes.
 * Opens in View mode by default, with Edit button to switch modes.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useAgentConfig,
  useConfigVersions,
  useAuditLog,
  useProviderWhitelists,
  useToolDefinitions,
  useUpdateAgentConfig,
} from "@/hooks/use-agent-config";
import { AgentConfigEditor } from "@/components/agent/AgentConfigEditor";
import {
  Bot,
  Settings,
  History,
  FileText,
  AlertCircle,
  Edit,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { AgentConfig as AgentConfigType } from "@/services/api";
import { useChatContext } from "@/contexts/ChatContext";

interface AgentViewDialogProps {
  agentId: string;
  open: boolean;
  onClose: () => void;
}

export function AgentViewDialog({ agentId, open, onClose }: AgentViewDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("configuration");
  const { openChat } = useChatContext();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsEditMode(false);
      setActiveTab("configuration");
    }
  }, [open, agentId]);

  // Fetch data
  const { data: config, isLoading: configLoading, error: configError } = useAgentConfig(agentId);
  const { data: versions, isLoading: versionsLoading } = useConfigVersions(agentId);
  const { data: auditLog, isLoading: auditLoading } = useAuditLog(agentId);
  const { data: whitelists } = useProviderWhitelists();
  const { data: tools } = useToolDefinitions();

  const updateConfigMutation = useUpdateAgentConfig(agentId);

  const handleSaveConfig = async (updatedConfig: AgentConfigType) => {
    try {
      await updateConfigMutation.mutateAsync({
        ...updatedConfig,
        updated_by: "admin", // TODO: Get from auth context
      });
      toast.success("Configuration updated successfully!");
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(`Failed to update configuration: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleOpenChat = () => {
    openChat(agentId);
    onClose();
  };

  // Handle dialog close
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  // Loading state
  if (configLoading) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (configError) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load agent configuration: {configError.message}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        {isEditMode ? (
          /* EDIT MODE - Show full editor */
          <div className="h-[85vh] flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Edit Agent Configuration</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <AgentConfigEditor
                config={config!.config}
                whitelists={whitelists}
                tools={tools}
                onSave={handleSaveConfig}
                onCancel={handleCancelEdit}
                isSaving={updateConfigMutation.isPending}
              />
            </div>
          </div>
        ) : (
          /* VIEW MODE - Show configuration details */
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>Agent Configuration</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Version {config?.version} • Updated by {config?.updated_by}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditMode(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenChat();
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Badge variant={config?.is_active ? "default" : "secondary"}>
                    {config?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[calc(85vh-100px)] px-6 pb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="w-full">
                  <TabsTrigger 
                    value="configuration"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger 
                    value="versions"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Versions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="audit"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Audit Log
                  </TabsTrigger>
                </TabsList>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="space-y-4">
                  {/* Prompt Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Prompt Configuration</CardTitle>
                      <CardDescription>
                        Agent's personality, tone, and behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">System Prompt</label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {config?.config.prompt.system_prompt}
                        </p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Tone</label>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {config?.config.prompt.tone}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Language</label>
                          <p className="text-sm text-muted-foreground mt-1 uppercase">
                            {config?.config.prompt.language}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* LLM Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Language Model (LLM)</CardTitle>
                      <CardDescription>
                        AI model for conversation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Provider</label>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {config?.config.llm.provider}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config?.config.llm.model}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Temperature</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config?.config.llm.temperature}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Max Tokens</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config?.config.llm.max_tokens}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* STT Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Speech-to-Text (STT)</CardTitle>
                      <CardDescription>
                        Speech recognition configuration
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Provider</label>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {config?.config.stt.provider}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config?.config.stt.model}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* TTS Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Text-to-Speech (TTS)</CardTitle>
                      <CardDescription>
                        Voice synthesis configuration
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Provider</label>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {config?.config.tts.provider}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Voice</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config?.config.tts.voice}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Engine</label>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {config?.config.tts.speech_engine}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tools Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Function Tools</CardTitle>
                      <CardDescription>
                        Enabled tools for the agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {config?.config.tools && Object.entries(config.config.tools).map(([tool, enabled]) => (
                          <div key={tool} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm font-medium capitalize">
                              {tool.replace(/_/g, ' ')}
                            </span>
                            <Badge variant={enabled ? "default" : "secondary"}>
                              {enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Version History Tab */}
                <TabsContent value="versions" className="space-y-4">
                  {versionsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    versions?.map((version) => (
                      <Card key={version.version}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">Version {version.version}</CardTitle>
                              <CardDescription>
                                Updated by {version.updated_by} on {format(new Date(version.created_at), "PPpp")}
                              </CardDescription>
                            </div>
                            <Badge variant={version.is_active ? "default" : "outline"}>
                              {version.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Audit Log Tab */}
                <TabsContent value="audit" className="space-y-4">
                  {auditLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    auditLog?.map((entry) => (
                      <Card key={entry.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg capitalize">{entry.action.replace(/_/g, ' ')}</CardTitle>
                              <CardDescription>
                                {entry.changed_by} • {entry.timestamp ? format(new Date(entry.timestamp), "PPpp") : 'N/A'} • Version {entry.version}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}