import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background gpu-accelerate">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <Header />
        <div className="p-6 page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
