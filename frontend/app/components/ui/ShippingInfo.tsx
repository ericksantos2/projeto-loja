import { ShieldCheck, Truck } from "lucide-react";

type ShippingInfoProps = {
  estimatedDelivery: string;
  returns: string;
};

export default function ShippingInfo({
  estimatedDelivery,
  returns,
}: ShippingInfoProps) {
  return (
    <div className="grid gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:grid-cols-2">
      <p className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-amber-700" aria-hidden="true" />
        Entrega em {estimatedDelivery}
      </p>
      <p className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-amber-700" aria-hidden="true" />
        {returns}
      </p>
    </div>
  );
}
