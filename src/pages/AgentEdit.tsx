/**
 * Agent Edit Page - EDIT ONLY
 * 
 * Displays AgentConfigEditor for editing configuration.
 * Save/Cancel both redirect back to /agents list.
 */

import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgentConfigEditor } from "@/components/agent/AgentConfigEditor";
import {
  useAgentConfig,
  useProviderWhitelists,
  useToolDefinitions,
  useUpdateAgentConfig,
} from "@/hooks/use-agent-config";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { AgentConfig as AgentConfigType } from "@/services/api";

export default function AgentEdit() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();

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

  // Fetch data
  const { data: config, isLoading: configLoading, error: configError } = useAgentConfig(agentId);
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
      // Redirect back to agents list
      navigate('/agents');
    } catch (error: any) {
      toast.error(`Failed to update configuration: ${error.message}`);
    }
  };

  const handleCancel = () => {
    // Redirect back to agents list
    navigate('/agents');
  };

  // Loading state
  if (configLoading) {
    return (
      <DashboardLayout title="Edit Agent">
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
      <DashboardLayout title="Edit Agent">
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
    <DashboardLayout title="Edit Agent Configuration">
      <div className="h-full">
        <AgentConfigEditor
          config={config!.config}
          whitelists={whitelists}
          tools={tools}
          onSave={handleSaveConfig}
          onCancel={handleCancel}
          isSaving={updateConfigMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}