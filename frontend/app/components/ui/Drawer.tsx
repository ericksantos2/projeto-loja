import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

type DrawerProps = {
  children: ReactNode;
  id: string;
  isClosing: boolean;
  label: string;
  onClose: () => void;
  side: "left" | "right";
  widthClassName: string;
};

export default function Drawer({ children, id, isClosing, label, onClose, side, widthClassName }: DrawerProps) {
  const overlayAnimation = isClosing ? "animate-[menu-overlay-out_200ms_ease-in_forwards]" : "animate-[menu-overlay-in_200ms_ease-out]";
  const drawerAnimation = isClosing
    ? side === "left" ? "animate-[menu-drawer-out_200ms_ease-in_forwards]" : "animate-[cart-drawer-out_200ms_ease-in_forwards]"
    : side === "left" ? "animate-[menu-drawer-in_280ms_cubic-bezier(0.16,1,0.3,1)]" : "animate-[cart-drawer-in_280ms_cubic-bezier(0.16,1,0.3,1)]";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" className={cn("absolute inset-0 bg-slate-950/40 motion-reduce:animate-none", overlayAnimation)} aria-label={`Fechar ${label.toLowerCase()}`} onClick={onClose} />
      <aside id={id} className={cn("absolute flex h-full flex-col bg-white p-5 shadow-2xl motion-reduce:animate-none", side === "left" ? "left-0" : "right-0", widthClassName, drawerAnimation)}>
        {children}
      </aside>
    </div>
  );
}
