/**
 * Configuration Tabs Component
 * 
 * Provides tabbed navigation for agent configuration sections
 */

import { Card } from "@/components/ui/card";

interface ConfigTab {
  id: string;
  label: string;
}

interface ConfigTabsProps {
  tabs: ConfigTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export function ConfigTabs({ tabs, activeTab, onTabChange, children }: ConfigTabsProps) {
  return (
    <Card>
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}