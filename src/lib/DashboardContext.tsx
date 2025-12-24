import { createContext, useContext, useState, ReactNode } from "react";

type DashboardView = "dashboard" | "interviews" | "candidates" | "settings";

interface DashboardContextType {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");

  return (
    <DashboardContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}











