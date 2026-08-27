// Contexto de visibilidade da sidebar
// Gerencia estado aberto/fechado entre Sidebar, Topbar e MainLayout

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  aberta: boolean;
  alternar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  aberta: true,
  alternar: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(true);

  const alternar = () => setAberta((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ aberta, alternar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
