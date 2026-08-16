type Specification = {
  label: string;
  value: string;
};

type SpecsListProps = {
  specifications: Specification[];
};

export default function SpecsList({ specifications }: SpecsListProps) {
  return (
    <dl className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5">
      {specifications.map((spec) => (
        <div
          key={spec.label}
          className="flex justify-between gap-4 py-4 text-sm"
        >
          <dt className="text-slate-500">{spec.label}</dt>
          <dd className="text-right font-medium text-slate-950">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
