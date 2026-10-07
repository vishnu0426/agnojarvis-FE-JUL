// /**
//  * API Service for AgnoX Agent Manager
//  *
//  * Provides typed API client for interacting with the backend Agent Manager API.
//  */

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// // ==================== Types ====================
// import { StatusType } from "@/components/dashboard/StatusBadge";

// export interface PromptConfig {
//   system_prompt: string;
//   greeting?: string;
//   tone: string;
//   language: string;
//   personality_traits?: string[];
// }

// export interface ProviderConfig {
//   provider: string;
//   model?: string;
//   voice?: string;
//   temperature?: number;
//   max_tokens?: number;
//   language?: string;
//   speech_engine?: string;
//   secret_ref?: string;
// }

// export interface MCPServerConfig {
//   name: string;
//   url?: string;
//   endpoint?: string;
//   transport_type?: 'stdio' | 'sse' | 'http';
//   command?: string;
//   args?: string[];
//   capabilities: string[];
// }

// export interface MCPConfig {
//   enabled: boolean;
//   servers: MCPServerConfig[];
// }

// export interface MCPTestResult {
//   status: 'success' | 'error' | 'partial' | 'disabled' | 'no_servers';
//   message: string;
//   servers: Array<{
//     name: string;
//     status: 'success' | 'error';
//     message: string;
//   }>;
// }

// export interface ChatMessage {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp?: string;
// }

// export interface ChatRequest {
//   message: string;
//   conversation_history?: ChatMessage[];
// }

// export interface ChatResponse {
//   message: string;
//   agent_name: string;
//   timestamp: string;
// }

// export interface GreetingResponse {
//   greeting: string;
//   agent_name: string;
//   timestamp: string;
// }

// export interface HTTPRequestConfig {
//   name: string;
//   url: string;
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
//   headers?: string;
//   body?: string;
//   description?: string;
// }

// export interface HTTPToolConfig {
//   enabled: boolean;
//   requests: HTTPRequestConfig[];
// }

// export interface AgentConfig {
//   prompt: PromptConfig;
//   llm: ProviderConfig;
//   stt: ProviderConfig;
//   tts: ProviderConfig;
//   tools: Record<string, boolean>;
//   mcp?: MCPConfig;
//   http_tool?: HTTPToolConfig;
// }

// export interface AgentConfigResponse {
//   agent_id: string;
//   version: number;
//   is_active: boolean;
//   config: AgentConfig;
//   created_at: string;
//   updated_by: string;
// }

// export interface AgentConfigRequest {
//   prompt: PromptConfig;
//   llm: ProviderConfig;
//   stt: ProviderConfig;
//   tts: ProviderConfig;
//   tools: Record<string, boolean>;
//   mcp?: MCPConfig;
//   http_tool?: HTTPToolConfig;
//   updated_by: string;
// }

// export interface AuditLogEntry {
//   id: string;
//   agent_id: string;
//   version: number;
//   action: string;
//   changed_by: string;
//   changes: Record<string, any>;
//   timestamp: string;
// }

// export interface AgentMetadata {
//   agent_id: string;
//   name: string;
//   description?: string;
//   is_active: boolean;
//   created_at: string;
//   created_by: string;
//   version?: number;
//   updated_by?: string;
// }

// export interface CreateAgentRequest {
//   name: string;
//   description?: string;
//   initial_config: AgentConfigRequest;
// }

// export interface ProviderWhitelist {
//   llm: Array<{
//     provider_name: string;
//     model_name: string;
//     cost_per_token: number | null;
//     cost_per_minute: number | null;
//     is_enabled: boolean;
//   }>;
//   stt: Array<{
//     provider_name: string;
//     model_name: string;
//     cost_per_token: number | null;
//     cost_per_minute: number | null;
//     is_enabled: boolean;
//   }>;
//   tts: Array<{
//     provider_name: string;
//     model_name: string;
//     cost_per_token: number | null;
//     cost_per_minute: number | null;
//     is_enabled: boolean;
//   }>;
// }

// export interface ToolDefinition {
//   tool_name: string;
//   description: string;
//   risk_level: string;
//   is_enabled: boolean;
// }

// export interface HealthCheckResponse {
//   status: string;
//   service: string;
// }

// // LiveKit Rooms & Sessions
// export interface Room {
//   id: string;
//   name: string;
//   participants: number;
//   maxParticipants: number;
//   createdAt: string;
//   status: 'active' | 'inactive';
//   duration: string;
//   metadata?: string;
// }

// export interface RoomsResponse {
//   rooms: Room[];
// }

// export interface Participant {
//   id: string;
//   identity: string;
//   name: string;
//   state?: string;
//   joinedAt?: string;
//   metadata?: string;
// }

// export interface RoomDetails {
//   id: string;
//   name: string;
//   participants: Participant[];
//   numParticipants: number;
//   maxParticipants: number;
//   createdAt: string;
//   metadata?: string;
// }

// export interface Session {
//   id: string;
//   roomName: string;
//   room_name?: string; // Backend uses room_name
//   participants: Array<{
//     id: string;
//     identity: string;
//     name: string;
//   }>;
//   num_participants?: number; // Backend field
//   status: StatusType;
//   startTime: string;
//   endTime?: string;
//   created_at?: string; // Backend field
//   duration: string;
//   disposition?: string; // Backend field
//   transcription?: Array<{
//     speaker: string;
//     text: string;
//     timestamp?: string;
//     confidence?: number;
//   }>;
// }

// export interface SessionsResponse {
//   sessions: Session[];
// }

// // ==================== Egress Types ====================

// export interface Egress {
//   id: string;
//   room_name: string;
//   status: number;
//   started_at: number;
//   ended_at?: number;
//   file_path?: string;
//   file_size?: number;
//   duration?: number;
// }

// export interface EgressResponse {
//   egress: Egress[];
// }

// // ==================== SIP Trunk Types ====================

// export interface SIPTrunk {
//   id: string;
//   name: string;
//   type: 'inbound' | 'outbound';
//   numbers: string[];
//   status: string;
//   metadata?: string;
//   address?: string; // Only for outbound trunks
// }

// export interface SIPTrunksResponse {
//   trunks: SIPTrunk[];
// }

// // ==================== Analytics Types ====================

// export interface CallStatusBreakdown {
//   completed: number;
//   active: number;
//   failed: number;
//   total: number;
// }

// export interface TimeSeriesDataPoint {
//   date: string;
//   count: number;
//   duration: number;
// }

// export interface AnalyticsMetrics {
//   totalSessions: number;
//   activeRooms: number;
//   totalParticipants: number;
//   totalDuration: number; // in seconds
//   averageDuration: number; // in seconds
//   callStatusBreakdown: CallStatusBreakdown;
//   sessionsOverTime: TimeSeriesDataPoint[];
// }

// // ==================== API Client ====================

// class ApiClient {
//   private baseUrl: string;

//   constructor(baseUrl: string = API_BASE_URL) {
//     this.baseUrl = baseUrl;
//   }

//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<T> {
//     const url = `${this.baseUrl}${endpoint}`;

//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//     });

//     if (!response.ok) {
//       const error = await response.json().catch(() => ({ detail: response.statusText }));
//       throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
//     }

//     return response.json();
//   }

//   // ==================== Agent Management ====================

//   async listAgents(): Promise<AgentMetadata[]> {
//     return this.request<AgentMetadata[]>('/api/v1/agents');
//   }

//   async getActiveAgent(): Promise<AgentMetadata> {
//     return this.request<AgentMetadata>('/api/v1/agents/active');
//   }

//   async createAgent(request: CreateAgentRequest): Promise<AgentConfigResponse> {
//     return this.request<AgentConfigResponse>('/api/v1/agents', {
//       method: 'POST',
//       body: JSON.stringify(request),
//     });
//   }

//   async activateAgent(agentId: string, activatedBy: string): Promise<{ agent_id: string; is_active: boolean }> {
//     return this.request(`/api/v1/agents/${agentId}/activate`, {
//       method: 'POST',
//       body: JSON.stringify({ activated_by: activatedBy }),
//     });
//   }

//   async deactivateAgent(agentId: string, deactivatedBy: string): Promise<{ agent_id: string; is_active: boolean }> {
//     return this.request(`/api/v1/agents/${agentId}/deactivate`, {
//       method: 'POST',
//       body: JSON.stringify({ activated_by: deactivatedBy }),
//     });
//   }

//   async deleteAgent(agentId: string, deletedBy: string): Promise<{ message: string }> {
//     return this.request(`/api/v1/agents/${agentId}?deleted_by=${deletedBy}`, {
//       method: 'DELETE',
//     });
//   }

//   // ==================== Agent Configuration ====================

//   async getAgentConfig(agentId: string): Promise<AgentConfigResponse> {
//     return this.request<AgentConfigResponse>(`/api/v1/agents/${agentId}/config`);
//   }

//   async updateAgentConfig(
//     agentId: string,
//     config: AgentConfigRequest
//   ): Promise<AgentConfigResponse> {
//     return this.request<AgentConfigResponse>(`/api/v1/agents/${agentId}/config`, {
//       method: 'PUT',
//       body: JSON.stringify(config),
//     });
//   }

//   async getConfigVersions(agentId: string, limit: number = 10): Promise<AgentConfigResponse[]> {
//     return this.request<AgentConfigResponse[]>(
//       `/api/v1/agents/${agentId}/config/versions?limit=${limit}`
//     );
//   }

//   async getAuditLog(agentId: string, limit: number = 50): Promise<AuditLogEntry[]> {
//     return this.request<AuditLogEntry[]>(
//       `/api/v1/agents/${agentId}/audit?limit=${limit}`
//     );
//   }

//   // ==================== Provider Whitelists ====================

//   async getProviderWhitelists(): Promise<ProviderWhitelist> {
//     return this.request<ProviderWhitelist>('/api/v1/providers/whitelists');
//   }

//   // ==================== Tool Definitions ====================

//   async getToolDefinitions(): Promise<ToolDefinition[]> {
//     return this.request<ToolDefinition[]>('/api/v1/tools/definitions');
//   }

//   // ==================== Health Check ====================

//   async healthCheck(): Promise<HealthCheckResponse> {
//     return this.request<HealthCheckResponse>('/health');
//   }

//   // ==================== LiveKit Rooms ====================

//   async getRooms(): Promise<RoomsResponse> {
//     return this.request<RoomsResponse>('/api/v1/rooms');
//   }

//   async getRoom(roomName: string): Promise<RoomDetails> {
//     return this.request<RoomDetails>(`/api/v1/rooms/${encodeURIComponent(roomName)}`);
//   }

//   async deleteRoom(roomName: string): Promise<{ message: string }> {
//     return this.request<{ message: string }>(`/api/v1/rooms/${encodeURIComponent(roomName)}`, {
//       method: 'DELETE',
//     });
//   }

//   // ==================== LiveKit Sessions ====================

//   async getSessions(): Promise<SessionsResponse> {
//     return this.request<SessionsResponse>('/api/v1/sessions');
//   }

//   // ==================== Egress (Recordings) ====================

//   async getEgress(): Promise<EgressResponse> {
//     return this.request<EgressResponse>('/api/v1/egress');
//   }

//   async getEgressById(egressId: string): Promise<Egress> {
//     return this.request<Egress>(`/api/v1/egress/${egressId}`);
//   }

//   async deleteEgress(egressId: string): Promise<{ message: string }> {
//     return this.request<{ message: string }>(`/api/v1/egress/${egressId}`, {
//       method: 'DELETE',
//     });
//   }

//   // ==================== SIP Trunks ====================

//   async getSIPTrunks(): Promise<SIPTrunksResponse> {
//     return this.request<SIPTrunksResponse>('/api/v1/sip/trunks');
//   }

//   // ==================== Agent Preview/Testing ====================

//   async createPreviewToken(agentId: string): Promise<{
//     token: string;
//     room_name: string;
//     url: string;
//   }> {
//     return this.request<{
//       token: string;
//       room_name: string;
//       url: string;
//     }>(`/api/v1/agents/${agentId}/preview/token`, {
//       method: 'POST',
//     });
//   }

//   async createTestAgent(): Promise<AgentConfigResponse> {
//     const testConfig = {
//       name: "Test Agent",
//       description: "Quick test agent for development",
//       initial_config: {
//         prompt: {
//           system_prompt: "You are a helpful AI assistant for testing purposes. Be friendly and concise.",
//           greeting: "Hello! I'm a test agent. How can I help you today?",
//           tone: "friendly",
//           language: "en",
//           personality_traits: ["helpful", "concise"]
//         },
//         llm: {
//           provider: "openai",
//           model: "gpt-4o-mini",
//           temperature: 0.7,
//           max_tokens: 1024,
//           secret_ref: "openai_api_key"
//         },
//         stt: {
//           provider: "deepgram",
//           model: "nova-2",
//           language: "en",
//           secret_ref: "deepgram_api_key"
//         },
//         tts: {
//           provider: "aws",
//           voice: "Matthew",
//           speech_engine: "standard",
//           language: "en-US",
//           secret_ref: "aws_credentials"
//         },
//         tools: {
//           end_call: true
//         },
//         mcp: {
//           enabled: false,
//           servers: []
//         },
//         http_tool: {
//           enabled: false,
//           requests: []
//         },
//         updated_by: "system"
//       }
//     };

//     return this.request<AgentConfigResponse>('/api/v1/agents', {
//       method: 'POST',
//       body: JSON.stringify(testConfig),
//     });
//   }

//   // ==================== MCP Management ====================

//   async addMCPServer(
//     agentId: string,
//     serverConfig: MCPServerConfig,
//     updatedBy: string
//   ): Promise<{ message: string; server: MCPServerConfig }> {
//     return this.request<{ message: string; server: MCPServerConfig }>(
//       `/api/v1/agents/${agentId}/mcp/servers?updated_by=${updatedBy}`,
//       {
//         method: 'POST',
//         body: JSON.stringify(serverConfig),
//       }
//     );
//   }

//   async removeMCPServer(
//     agentId: string,
//     serverName: string,
//     updatedBy: string
//   ): Promise<{ message: string }> {
//     return this.request<{ message: string }>(
//       `/api/v1/agents/${agentId}/mcp/servers/${serverName}?updated_by=${updatedBy}`,
//       {
//         method: 'DELETE',
//       }
//     );
//   }

//   async updateMCPServer(
//     agentId: string,
//     serverName: string,
//     serverConfig: MCPServerConfig,
//     updatedBy: string
//   ): Promise<{ message: string; server: MCPServerConfig }> {
//     return this.request<{ message: string; server: MCPServerConfig }>(
//       `/api/v1/agents/${agentId}/mcp/servers/${serverName}?updated_by=${updatedBy}`,
//       {
//         method: 'PUT',
//         body: JSON.stringify(serverConfig),
//       }
//     );
//   }

//   async testMCPConnectivity(agentId: string): Promise<MCPTestResult> {
//     return this.request<MCPTestResult>(
//       `/api/v1/agents/${agentId}/mcp/test`
//     );
//   }

//   // ==================== Direct LLM Chat Methods ====================

//   async getAgentGreeting(agentId: string): Promise<GreetingResponse> {
//     return this.request<GreetingResponse>(
//       `/api/v1/agents/${agentId}/chat/greeting`
//     );
//   }

//   async sendChatMessage(agentId: string, request: ChatRequest): Promise<ChatResponse> {
//     return this.request<ChatResponse>(
//       `/api/v1/agents/${agentId}/chat/message`,
//       {
//         method: 'POST',
//         body: JSON.stringify(request),
//       }
//     );
//   }
// }

// // Export singleton instance
// export const apiClient = new ApiClient();

// // Export default
// export default apiClient;

/**
 * API Service for AgnoX Agent Manager
 *
 * Provides typed API client for interacting with the backend Agent Manager API.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ==================== Types ====================

export interface PromptConfig {
  system_prompt: string;
  greeting?: string;
  tone: string;
  language: string; // primary language (first of `languages`)
  languages?: string[]; // every language the agent may speak; first is primary
  personality_traits?: string[];
}

export interface ProviderConfig {
  provider: string;
  model?: string;
  voice?: string;
  speaker?: string;
  temperature?: number;
  max_tokens?: number;
  language?: string; // primary language (first of `languages`)
  languages?: string[]; // STT: languages to recognise; TTS: languages to speak
  speech_engine?: string;
  secret_ref?: string;
}

export interface LanguageCatalog {
  languages: Array<{ code: string; name: string; native: string }>;
  special: Array<{ code: string; name: string; native: string }>;
  aliases: Record<string, string>;
  max_languages: number;
}

export interface MCPServerConfig {
  name: string;
  url?: string;
  endpoint?: string;
  transport_type?: 'stdio' | 'sse' | 'http';
  command?: string;
  args?: string[];
  capabilities: string[];
}

export interface MCPConfig {
  enabled: boolean;
  servers: MCPServerConfig[];
}

export interface MCPTestResult {
  status: 'success' | 'error' | 'partial' | 'disabled' | 'no_servers';
  message: string;
  servers: Array<{
    name: string;
    status: 'success' | 'error';
    message: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  /** Used by tools such as schedule_callback, which needs a number to call back. */
  caller_phone?: string;
  caller_name?: string;
  caller_email?: string;
  /** false = plain text chat without tools. */
  execute_tools?: boolean;
  /** true = tools run without outside effects (nothing is saved or sent). */
  dry_run?: boolean;
}

export interface ChatToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result: string;
  status: 'ok' | 'error' | 'handoff' | 'ended' | 'dry_run';
  duration_ms: number;
}

/** Set when the agent asked for a human; a chat has no phone line, so the channel must route it. */
export interface ChatHandoff {
  type: 'department' | 'number';
  department?: string;
  target?: string;
  requested?: string;
  reason?: string;
}

export interface ChatResponse {
  message: string;
  agent_name: string;
  timestamp: string;
  tool_calls?: ChatToolCall[];
  handoff?: ChatHandoff | null;
  ended?: boolean;
}

export interface GreetingResponse {
  greeting: string;
  agent_name: string;
  timestamp: string;
}

export interface HTTPRequestConfig {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: string;
  body?: string;
  description?: string;
}

export interface HTTPToolConfig {
  enabled: boolean;
  requests: HTTPRequestConfig[];
}

export interface AgentConfig {
  prompt: PromptConfig;
  llm: ProviderConfig;
  stt: ProviderConfig;
  tts: ProviderConfig;
  tools: Record<string, boolean>;
  mcp?: MCPConfig;
  http_tool?: HTTPToolConfig;
}

export interface AgentConfigResponse {
  agent_id: string;
  version: number;
  is_active: boolean;
  config: AgentConfig;
  created_at: string;
  updated_by: string;
}

export interface AgentConfigRequest {
  prompt: PromptConfig;
  llm: ProviderConfig;
  stt: ProviderConfig;
  tts: ProviderConfig;
  tools: Record<string, boolean>;
  mcp?: MCPConfig;
  http_tool?: HTTPToolConfig;
  updated_by: string;
  name?: string;
}

export interface AuditLogEntry {
  id: string;
  agent_id: string;
  version: number;
  action: string;
  changed_by: string;
  changes: Record<string, any>;
  timestamp: string;
}

// ==================== NEW: Agent Models Interface ====================
export interface AgentModels {
  llm: {
    provider: string | null;
    model: string | null;
  };
  stt: {
    provider: string | null;
    model: string | null;
  };
  tts: {
    provider: string | null;
    voice: string | null;
  };
}

export interface AgentMetadata {
  agent_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
  version?: number;
  updated_by?: string;
  models?: AgentModels | null; // NEW: Add models field
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  initial_config: AgentConfigRequest;
}

export interface ProviderWhitelistMetadata {
  languages?: string[];
  speakers_by_model?: Record<string, string[]>;
  default_speakers?: Record<string, string>;
  supports_streaming?: boolean;
  supports_multilingual?: boolean;
  [key: string]: unknown;
}

export interface ProviderWhitelist {
  llm: Array<{
    provider_name: string;
    model_name: string;
    cost_per_token: number | null;
    cost_per_minute: number | null;
    is_enabled: boolean;
    metadata?: ProviderWhitelistMetadata;
  }>;
  stt: Array<{
    provider_name: string;
    model_name: string;
    cost_per_token: number | null;
    cost_per_minute: number | null;
    is_enabled: boolean;
    metadata?: ProviderWhitelistMetadata;
  }>;
  tts: Array<{
    provider_name: string;
    model_name: string;
    /** AWS Polly: list of supported engine types (generative, neural, standard, long-form) */
    engines?: string[];
    /** OpenAI: voice id bundled with the model row */
    voice?: string;
    cost_per_token: number | null;
    cost_per_minute: number | null;
    is_enabled: boolean;
    metadata?: ProviderWhitelistMetadata;
  }>;
}

export interface ToolDefinition {
  tool_name: string;
  description: string;
  risk_level: string;
  is_enabled: boolean;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}

// LiveKit Rooms & Sessions
export interface Room {
  id: string;
  name: string;
  participants: number;
  maxParticipants: number;
  createdAt: string;
  status: 'active' | 'inactive';
  duration: string;
  metadata?: string;
}

export interface RoomsResponse {
  rooms: Room[];
}

export interface Participant {
  id: string;
  identity: string;
  name: string;
  state?: string;
  joinedAt?: string;
  metadata?: string;
}

export interface RoomDetails {
  id: string;
  name: string;
  participants: Participant[];
  numParticipants: number;
  maxParticipants: number;
  createdAt: string;
  metadata?: string;
}

export interface Session {
  id: string;
  roomName: string;
  room_name?: string; // Backend uses room_name
  participants: Array<{
    id: string;
    identity: string;
    name: string;
  }>;
  num_participants?: number; // Backend field
  status: string; // Raw status from DB (in_progress, completed, cancelled, etc.)
  startTime: string;
  endTime?: string;
  created_at?: string; // Backend field
  duration: string;
  disposition?: string; // Backend field
  transcription?: Array<{
    speaker: string;
    text: string;
    timestamp?: string;
    confidence?: number;
  }>;
  average_sentiment?: number | null; // Sentiment polarity score (-1.0 to 1.0)
}

export interface SessionsResponse {
  sessions: Session[];
}

// ==================== Egress Types ====================

export interface Egress {
  id: string;
  room_name: string;
  status: number;
  started_at: number;
  ended_at?: number;
  file_path?: string;
  file_size?: number;
  duration?: number;
}

export interface EgressResponse {
  egress: Egress[];
}

// ==================== Recording Types ====================

export interface CallRecording {
  id: string;
  call_id: string;
  file_path: string;
  duration_seconds?: number | null;
  file_size_bytes?: number | null;
  recorded_at?: string | null;
  egress_id?: string | null;
  status: string;
  room_name?: string | null;
  caller_phone?: string | null;
  call_status?: string | null;
}

export interface CallRecordingsResponse {
  recordings: CallRecording[];
}

export interface AllRecordingsResponse {
  recordings: CallRecording[];
  total: number;
}

// ==================== SIP Trunk Types ====================

export interface SIPTrunk {
  id: string;
  name: string;
  type: 'inbound' | 'outbound';
  numbers: string[];
  status: string;
  metadata?: string;
  address?: string; // Only for outbound trunks
}

export interface SIPTrunksResponse {
  trunks: SIPTrunk[];
}

// ==================== Analytics Types ====================

export interface CallStatusBreakdown {
  completed: number;
  active: number;
  failed: number;
  total: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
  duration: number;
}

export interface AnalyticsMetrics {
  totalSessions: number;
  activeRooms: number;
  totalParticipants: number;
  totalDuration: number; // in seconds
  averageDuration: number; // in seconds
  callStatusBreakdown: CallStatusBreakdown;
  sessionsOverTime: TimeSeriesDataPoint[];
}

// ==================== API Client ====================

/** FastAPI returns `detail` as a string, or (422) an array of { loc, msg } objects. */
export function formatApiError(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = Array.isArray(d?.loc) ? d.loc.filter((p: unknown) => p !== 'body' && p !== 'initial_config').join('.') : '';
        return field ? `${field}: ${d?.msg ?? 'invalid value'}` : String(d?.msg ?? JSON.stringify(d));
      })
      .join('; ');
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return '';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(formatApiError(error.detail) || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== Agent Management ====================

  async listAgents(): Promise<AgentMetadata[]> {
    return this.request<AgentMetadata[]>('/api/v1/agents');
  }

  async getActiveAgent(): Promise<AgentMetadata> {
    return this.request<AgentMetadata>('/api/v1/agents/active');
  }

  async createAgent(request: CreateAgentRequest): Promise<AgentConfigResponse> {
    return this.request<AgentConfigResponse>('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async activateAgent(agentId: string, activatedBy: string): Promise<{ agent_id: string; is_active: boolean }> {
    return this.request(`/api/v1/agents/${agentId}/activate`, {
      method: 'POST',
      body: JSON.stringify({ activated_by: activatedBy }),
    });
  }

  async deactivateAgent(agentId: string, deactivatedBy: string): Promise<{ agent_id: string; is_active: boolean }> {
    return this.request(`/api/v1/agents/${agentId}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ activated_by: deactivatedBy }),
    });
  }

  async deleteAgent(agentId: string, deletedBy: string): Promise<{ message: string }> {
    return this.request(`/api/v1/agents/${agentId}?deleted_by=${deletedBy}`, {
      method: 'DELETE',
    });
  }

  // ==================== Agent Configuration ====================

  async getAgentConfig(agentId: string): Promise<AgentConfigResponse> {
    return this.request<AgentConfigResponse>(`/api/v1/agents/${agentId}/config`);
  }

  async updateAgentConfig(
    agentId: string,
    config: AgentConfigRequest
  ): Promise<AgentConfigResponse> {
    return this.request<AgentConfigResponse>(`/api/v1/agents/${agentId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getConfigVersions(agentId: string, limit: number = 10): Promise<AgentConfigResponse[]> {
    return this.request<AgentConfigResponse[]>(
      `/api/v1/agents/${agentId}/config/versions?limit=${limit}`
    );
  }

  async getAuditLog(agentId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.request<AuditLogEntry[]>(
      `/api/v1/agents/${agentId}/audit?limit=${limit}`
    );
  }

  // ==================== Provider Whitelists ====================

  async getProviderWhitelists(): Promise<ProviderWhitelist> {
    return this.request<ProviderWhitelist>('/api/v1/providers/whitelists');
  }

  async getProviderMetadata(providerType: string, providerName: string): Promise<any> {
    return this.request<any>(`/api/v1/providers/metadata/${providerType}/${providerName}`);
  }

  async getLanguages(): Promise<LanguageCatalog> {
    return this.request<LanguageCatalog>('/api/v1/languages');
  }

  // ==================== Tool Definitions ====================

  async getToolDefinitions(): Promise<ToolDefinition[]> {
    return this.request<ToolDefinition[]>('/api/v1/tools/definitions');
  }

  // ==================== Health Check ====================

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  // ==================== LiveKit Rooms ====================

  async getRooms(): Promise<RoomsResponse> {
    return this.request<RoomsResponse>('/api/v1/rooms');
  }

  async getRoom(roomName: string): Promise<RoomDetails> {
    return this.request<RoomDetails>(`/api/v1/rooms/${encodeURIComponent(roomName)}`);
  }

  async deleteRoom(roomName: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/rooms/${encodeURIComponent(roomName)}`, {
      method: 'DELETE',
    });
  }

  // ==================== LiveKit Sessions ====================

  async getSessions(): Promise<SessionsResponse> {
    return this.request<SessionsResponse>('/api/v1/sessions');
  }

  async forceEndSession(sessionId: string, disposition = 'abandoned'): Promise<{ id: string; status: string; disposition: string }> {
    return this.request(`/api/v1/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ disposition }),
    });
  }

  // ==================== Egress (Recordings) ====================

  async getEgress(): Promise<EgressResponse> {
    return this.request<EgressResponse>('/api/v1/egress');
  }

  async getEgressById(egressId: string): Promise<Egress> {
    return this.request<Egress>(`/api/v1/egress/${egressId}`);
  }

  async deleteEgress(egressId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/egress/${egressId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Call Recordings ====================

  async getAllRecordings(limit = 100, offset = 0): Promise<AllRecordingsResponse> {
    return this.request<AllRecordingsResponse>(`/api/v1/recordings?limit=${limit}&offset=${offset}`);
  }

  async getCallRecordings(callId: string): Promise<CallRecordingsResponse> {
    return this.request<CallRecordingsResponse>(`/api/v1/recordings/call/${callId}`);
  }

  getCallRecordingAudioUrl(callId: string): string {
    return `${this.baseUrl}/api/v1/recordings/audio/${callId}`;
  }

  // ==================== SIP Trunks ====================

  async getSIPTrunks(): Promise<SIPTrunksResponse> {
    return this.request<SIPTrunksResponse>('/api/v1/sip/trunks');
  }

  // ==================== Agent Preview/Testing ====================

  async createPreviewToken(agentId: string): Promise<{
    token: string;
    room_name: string;
    url: string;
  }> {
    return this.request<{
      token: string;
      room_name: string;
      url: string;
    }>(`/api/v1/agents/${agentId}/preview/token`, {
      method: 'POST',
    });
  }

  async createTestAgent(): Promise<AgentConfigResponse> {
    const testConfig = {
      name: "Test Agent",
      description: "Quick test agent for development",
      initial_config: {
        prompt: {
          system_prompt: "You are a helpful AI assistant for testing purposes. Be friendly and concise.",
          greeting: "Hello! I'm a test agent. How can I help you today?",
          tone: "friendly",
          language: "en",
          personality_traits: ["helpful", "concise"]
        },
        llm: {
          provider: "openai",
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 1024,
          secret_ref: "openai_api_key"
        },
        stt: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
          secret_ref: "deepgram_api_key"
        },
        tts: {
          provider: "aws",
          voice: "Matthew",
          speech_engine: "standard",
          language: "en-US",
          secret_ref: "aws_credentials"
        },
        tools: {
          end_call: true
        },
        mcp: {
          enabled: false,
          servers: []
        },
        http_tool: {
          enabled: false,
          requests: []
        },
        updated_by: "system"
      }
    };

    return this.request<AgentConfigResponse>('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify(testConfig),
    });
  }

  // ==================== MCP Management ====================

  async addMCPServer(
    agentId: string,
    serverConfig: MCPServerConfig,
    updatedBy: string
  ): Promise<{ message: string; server: MCPServerConfig }> {
    return this.request<{ message: string; server: MCPServerConfig }>(
      `/api/v1/agents/${agentId}/mcp/servers?updated_by=${updatedBy}`,
      {
        method: 'POST',
        body: JSON.stringify(serverConfig),
      }
    );
  }

  async removeMCPServer(
    agentId: string,
    serverName: string,
    updatedBy: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/api/v1/agents/${agentId}/mcp/servers/${serverName}?updated_by=${updatedBy}`,
      {
        method: 'DELETE',
      }
    );
  }

  async updateMCPServer(
    agentId: string,
    serverName: string,
    serverConfig: MCPServerConfig,
    updatedBy: string
  ): Promise<{ message: string; server: MCPServerConfig }> {
    return this.request<{ message: string; server: MCPServerConfig }>(
      `/api/v1/agents/${agentId}/mcp/servers/${serverName}?updated_by=${updatedBy}`,
      {
        method: 'PUT',
        body: JSON.stringify(serverConfig),
      }
    );
  }

  async testMCPConnectivity(agentId: string): Promise<MCPTestResult> {
    return this.request<MCPTestResult>(
      `/api/v1/agents/${agentId}/mcp/test`
    );
  }

  // ==================== Direct LLM Chat Methods ====================

  async getAgentGreeting(agentId: string): Promise<GreetingResponse> {
    return this.request<GreetingResponse>(
      `/api/v1/agents/${agentId}/chat/greeting`
    );
  }

  async sendChatMessage(agentId: string, request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>(
      `/api/v1/agents/${agentId}/chat/message`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default
export default apiClient;