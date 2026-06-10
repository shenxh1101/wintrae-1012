import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-cream-100">
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
