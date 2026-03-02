import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Bot,
  Users,
  // Phone,
  // Download,
  // Upload,
  BarChart3,
  FileText,
  Settings,
  Zap,
  // MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveAgent } from "@/hooks/use-agents";
// import { useChatContext } from "@/contexts/ChatContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Rooms", href: "/rooms", icon: Video },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Sessions", href: "/sessions", icon: Users },
  // { name: "SIP", href: "/sip", icon: Phone },
  // { name: "Egress", href: "/egress", icon: Download },
  // { name: "Ingress", href: "/ingress", icon: Upload },
  { name: "Usage", href: "/usage", icon: BarChart3 },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { data: activeAgent } = useActiveAgent();
  // const { openChat } = useChatContext();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sidebar-foreground">AgnoJarvis</span>
      </div>

      {/* Active Agent Info */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md bg-muted">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              activeAgent?.is_active ? "bg-success" : "bg-muted-foreground"
            )} />
            <span className="text-sidebar-foreground">
              {activeAgent?.name || "No Active Agent"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Check if current route matches or is a child route
          let isActive = location.pathname === item.href;
          
          // Special case: highlight Agents for /create-agent route
          if (item.href === "/agents" && location.pathname === "/create-agent") {
            isActive = true;
          }
          
          // Child routes check (except for Dashboard to avoid highlighting on all routes)
          if (!isActive && item.href !== "/" && location.pathname.startsWith(item.href)) {
            isActive = true;
          }
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Chat Button - COMMENTED OUT */}
        {/* <button
          onClick={() => openChat()}
          className="sidebar-item w-full"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat Room</span>
        </button> */}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}