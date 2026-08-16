import { cn } from "~/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  className?: string;
  tone?: "dark" | "light";
};

export default function SectionHeading({ eyebrow, title, className, tone = "dark" }: SectionHeadingProps) {
  const titleColor = tone === "light" ? "text-white" : "text-slate-950";
  const eyebrowColor = tone === "light" ? "text-amber-300" : "text-amber-700";

  return (
    <div className={className}>
      <p className={cn("text-sm font-semibold", eyebrowColor)}>{eyebrow}</p>
      <h2 className={cn("mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl", titleColor)}>{title}</h2>
    </div>
  );
}
