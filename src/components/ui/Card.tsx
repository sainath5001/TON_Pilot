import { cn } from "@/components/ui/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm shadow-black/30 backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-white/[0.14] hover:shadow-lg hover:shadow-violet-500/[0.06]",
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

