import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatPopup } from "@/components/chat/ChatPopup";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Agents from "./pages/Agents";
import AgentDetails from "./pages/AgentDetails";
import EditAgent from "./pages/EditAgent"; // NEW: Updated EditAgent component
import AgentConfig from "./pages/AgentConfig";
import CreateAgent from "./pages/CreateAgent";
import TestAgent from "./pages/TestAgent";
import Sessions from "./pages/Sessions";
import SIP from "./pages/SIP";
import Egress from "./pages/Egress";
import Ingress from "./pages/Ingress";
import Usage from "./pages/Usage";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChatProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/agents" element={<Agents />} />
            {/* NEW: Agent detail routes */}
            <Route path="/agents/:agentId" element={<AgentDetails />} />
            <Route path="/agents/:agentId/edit" element={<EditAgent />} />
            {/* OLD: Keep for backward compatibility */}
            <Route path="/agent-config/:agentId" element={<AgentConfig />} />
            <Route path="/create-agent" element={<CreateAgent />} />
            <Route path="/test-agent" element={<TestAgent />} />
            <Route path="/test-agent/:agentId" element={<TestAgent />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sip" element={<SIP />} />
            <Route path="/egress" element={<Egress />} />
            <Route path="/ingress" element={<Ingress />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatPopup />
        </BrowserRouter>
      </TooltipProvider>
    </ChatProvider>
  </QueryClientProvider>
);

export default App;