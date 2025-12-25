import { Bot, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center animate-pulse-slow">
          <Bot className="w-10 h-10 text-primary" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-warning animate-float" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Your AI Director
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        I can help manage your calendars, emails, tasks, and more across all your accounts.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["Calendars", "Emails", "Tasks", "Finance", "Research"].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-xs rounded-full bg-secondary text-muted-foreground border border-border/50"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
