import { X } from "lucide-react";
import { Link, NavLink } from "react-router";
import { accountNavigation, mainNavigation } from "./navigation";
import Drawer from "./ui/Drawer";
import IconButton from "./ui/IconButton";

type MobileMenuProps = {
  isClosing: boolean;
  onClose: () => void;
};

export default function MobileMenu({ isClosing, onClose }: MobileMenuProps) {
  return (
    <div className="md:hidden">
      <Drawer
        id="mobile-navigation"
        isClosing={isClosing}
        label="Menu de navegação"
        onClose={onClose}
        side="left"
        widthClassName="w-[min(20rem,85vw)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <p className="text-lg font-semibold text-slate-950">Menu</p>
          <IconButton aria-label="Fechar menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>

        <nav aria-label="Navegação mobile" className="mt-5 flex flex-col">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-3 text-base font-medium transition ${
                  isActive
                    ? "bg-amber-50 text-slate-950 ring-1 ring-inset ring-amber-200"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-5">
          {accountNavigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
