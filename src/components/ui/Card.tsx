import { cn } from "@/components/ui/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm shadow-black/30 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

Card.Title = function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-base font-semibold text-white">{children}</div>;
};

Card.Description = function CardDescription({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-sm text-white/70">{children}</div>;
};

