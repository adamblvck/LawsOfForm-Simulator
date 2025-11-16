import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const AppShell = ({ header, children, className }: AppShellProps) => {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {header && <header className="sticky top-0 z-40 border-b border-border/80 bg-card/70 backdrop-blur">{header}</header>}
      <main className="flex-1">{children}</main>
    </div>
  );
};
