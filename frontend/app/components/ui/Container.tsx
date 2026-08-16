import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";

type ContainerProps = ComponentProps<"div">;

export default function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-6", className)}
      {...props}
    />
  );
}
