/**
 * Agent Details Page - VIEW ONLY
 * 
 * Displays agent configuration in read-only mode.
 * NO edit button - users must use "Edit Configuration" from agents list.
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useAgentConfig,
  useConfigVersions,
  useAuditLog,
} from "@/hooks/use-agent-config";
import {
  Bot,
  Settings,
  History,
  FileText,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatProviderName } from "@/lib/format-provider";

export default function AgentDetails() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const [activeTab, setActiveTab] = useState("configuration");

  if (!agentId) {
    return (
      <DashboardLayout title="Agent Details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Agent ID is required</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Fetch data
  const { data: config, isLoading: configLoading, error: configError } = useAgentConfig(agentId);
  const { data: versions, isLoading: versionsLoading } = useConfigVersions(agentId);
  const { data: auditLog, isLoading: auditLoading } = useAuditLog(agentId);

  // Loading state
  if (configLoading) {
    return (
      <DashboardLayout title="Agent Details">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (configError) {
    return (
      <DashboardLayout title="Agent Details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load agent configuration: {configError.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agent Details">
      {/* Back Link - Refined Style */}
      <div className="mb-2">
        <button 
          onClick={() => navigate('/agents')}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Agents
        </button>
      </div>

      {/* Header - Read-only view */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{config?.agent_id}</h2>
            <p className="text-sm text-muted-foreground">
              Version {config?.version} • Last updated by {config?.updated_by}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="configuration">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="versions">
            <History className="w-4 h-4 mr-2" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
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
              <CardDescription>AI model for conversation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatProviderName(config?.config.llm.provider || '')}
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
              <CardDescription>Speech recognition configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatProviderName(config?.config.stt.provider || '')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config?.config.stt.model}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <p className="text-sm text-muted-foreground mt-1 uppercase">
                    {config?.config.stt.language || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TTS Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Text-to-Speech (TTS)</CardTitle>
              <CardDescription>Voice synthesis configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatProviderName(config?.config.tts.provider || '')}
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
                    {config?.config.tts.speech_engine || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <p className="text-sm text-muted-foreground mt-1 uppercase">
                    {config?.config.tts.language || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tools Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Function Tools</CardTitle>
              <CardDescription>Enabled tools for the agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {config?.config.tools &&
                  Object.entries(config.config.tools).map(([tool, enabled]) => (
                    <div
                      key={tool}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="text-sm font-medium capitalize">
                        {tool.replace(/_/g, " ")}
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
                      <CardTitle className="text-lg">
                        Version {version.version}
                      </CardTitle>
                      <CardDescription>
                        Updated by {version.updated_by} on{" "}
                        {format(new Date(version.created_at), "PPpp")}
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
                      <CardTitle className="text-lg capitalize">
                        {entry.action.replace(/_/g, " ")}
                      </CardTitle>
                      <CardDescription>
                        {entry.changed_by} •{" "}
                        {entry.timestamp
                          ? format(new Date(entry.timestamp), "PPpp")
                          : "N/A"}{" "}
                        • Version {entry.version}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}