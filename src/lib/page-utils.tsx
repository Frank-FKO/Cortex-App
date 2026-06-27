import { type ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg grid place-items-center ${
              accent ? "bg-white/20" : "bg-primary/10 text-primary"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {hint && (
        <div className={`text-xs mt-1 ${accent ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/30 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
