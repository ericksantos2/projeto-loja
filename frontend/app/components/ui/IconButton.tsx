import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";

type IconButtonProps = ComponentProps<"button">;

export default function IconButton({ className, type = "button", ...props }: IconButtonProps) {
  return <button type={type} className={cn("cursor-pointer rounded-lg p-2 text-slate-700 transition hover:bg-slate-100", className)} {...props} />;
}
