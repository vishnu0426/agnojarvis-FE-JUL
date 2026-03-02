# AgnoX V1 - Frontend

**React + TypeScript + Vite + shadcn/ui**

Modern web interface for managing AgnoX voice agent configurations.

---

## Features

✅ **Real-time Agent Configuration** - View and edit agent settings
✅ **Version History** - Track all configuration changes
✅ **Audit Log** - Complete audit trail of modifications
✅ **Test Agent** - Preview mode for testing configurations
✅ **No Mock Data** - All data fetched from Agent Manager API
✅ **Read-Only Agent Creation** - Users can only edit existing agents

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_DEFAULT_AGENT_ID=01
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

---

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching & caching
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Routing

---

- **Agent Deployment UI** - Simplified to configuration management only

### ✅ Added

- **API Service Layer** - `src/services/api.ts`
- **React Query Hooks** - `src/hooks/use-agent-config.ts`
- **Agent Config Page** - `src/pages/AgentConfig.tsx`
- **Version History Tab** - View all configuration versions
- **Audit Log Tab** - Complete audit trail
- **Chat Room** - Interactive chat interface for testing agents
- **Health Check** - Agent Manager connectivity status

---

## Pages

### `/agents` - Agent Overview

Displays current agent configuration, shows LLM/STT/TTS providers, lists enabled tools.

### `/agent-config` - Configuration Editor

- **Configuration Tab** - View/edit all settings
- **Version History Tab** - See past configurations
- **Audit Log Tab** - Track all changes
- **Chat Room** - Interactive testing interface

### `/test-agent` - Chat Room

- **Text Chat** - Send text messages to your agent
- **Voice Responses** - Hear agent responses with TTS
- **Mute Toggle** - Switch between voice and text-only modes
- **Real-time Transcription** - See agent responses as text

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Agent Manager API URL | `http://localhost:8000` |
| `VITE_DEFAULT_AGENT_ID` | Default agent ID | `01` |

---

## Troubleshooting

### "Failed to connect to Agent Manager API"

**Solution**: Ensure backend is running at `http://localhost:8000`

```bash
python run_agent_manager.py
```

---

**Need Help?** Check the [Developer Guide](../docs/DEVELOPER_GUIDE.md) for detailed documentation.
