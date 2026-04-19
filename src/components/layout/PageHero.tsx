import { cn } from "@/components/ui/cn";

type PageHeroProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export function PageHero({ title, subtitle, className }: PageHeroProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-5 max-w-md text-pretty text-lg font-light leading-relaxed text-white/70 md:mt-6 md:max-w-lg md:text-xl md:leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
