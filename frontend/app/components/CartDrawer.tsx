import { ShoppingBag, X } from "lucide-react";
import Drawer from "./ui/Drawer";
import IconButton from "./ui/IconButton";

type CartDrawerProps = {
  isClosing: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isClosing, onClose }: CartDrawerProps) {
  return (
    <Drawer id="shopping-cart" isClosing={isClosing} label="Carrinho de compras" onClose={onClose} side="right" widthClassName="w-[min(24rem,100vw)]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h2 className="text-lg font-semibold text-slate-950">Seu carrinho</h2>
          <IconButton aria-label="Fechar carrinho" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-amber-100 p-4 text-amber-700">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-950">Seu carrinho está vazio</p>
          <p className="mt-2 max-w-60 text-sm leading-6 text-slate-600">Adicione produtos para vê-los aqui.</p>
          <button type="button" className="mt-6 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" onClick={onClose}>
            Continuar comprando
          </button>
        </div>
    </Drawer>
  );
}
