import { Bot, Wifi, WifiOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isConnected: boolean;
  agentName?: string;
}

export function Header({ isConnected, agentName = "Director Agent" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 glass sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
              isConnected ? "bg-success" : "bg-destructive"
            )}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="font-semibold text-foreground">{agentName}</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-success" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-destructive" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <Button variant="ghost" size="icon">
        <Settings className="w-5 h-5 text-muted-foreground" />
      </Button>
    </header>
  );
}
