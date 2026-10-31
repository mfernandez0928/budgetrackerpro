import type { ReactNode } from "react";
import { clampPercent } from "../../lib/ui";

interface WalletCardProps {
  name: string;
  initials: string;
  color: string;
  label: "Balance" | "Available credit";
  amount: string;
  usage?: number;
  onClick?: () => void;
  menu?: ReactNode;
  className?: string;
}

export function WalletCard({
  name,
  initials,
  color,
  label,
  amount,
  usage,
  onClick,
  menu,
  className = "",
}: WalletCardProps) {
  const body = (
    <>
      <span className="pointer-events-none absolute -right-[30%] -top-[40%] aspect-square w-[90%] rounded-full bg-white/[0.12]" />
      <span className="pointer-events-none absolute -bottom-[55%] -right-[10%] aspect-square w-[70%] rounded-full bg-black/[0.12]" />

      <span className="relative flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-[11px] font-extrabold">
          {initials}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{name}</span>
      </span>

      <span className="relative block h-[22px] w-[30px] rounded-[5px] bg-gradient-to-br from-[#f5d77a] to-[#c9a33f]" />

      <span className="relative block">
        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80">
          {label}
        </span>
        <span className="block truncate text-lg font-extrabold">{amount}</span>
        {usage !== undefined ? (
          <span className="mt-1.5 block h-[5px] rounded-full bg-white/30">
            <span
              className="block h-full rounded-full bg-white"
              style={{ width: `${clampPercent(usage)}%` }}
            />
          </span>
        ) : null}
      </span>
    </>
  );

  const shared = `relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden rounded-[18px] p-4 text-left text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${className}`;
  const style = {
    background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 70%, white))`,
  };

  return (
    <div className="relative">
      {onClick ? (
        <button type="button" onClick={onClick} className={`${shared} transition hover:-translate-y-0.5`} style={style}>
          {body}
        </button>
      ) : (
        <div className={shared} style={style}>
          {body}
        </div>
      )}
      {menu ? <div className="absolute right-2 top-2">{menu}</div> : null}
    </div>
  );
}
