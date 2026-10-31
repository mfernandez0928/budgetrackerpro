interface BrandMarkProps {
  label: string;
  color: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandMark({
  label,
  color,
  textColor = "#0f172a",
  size = "md",
}: BrandMarkProps) {
  const sizeMap = {
    sm: "h-12 w-12 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-16 w-16 text-lg",
  };

  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded-2xl font-extrabold ${sizeMap[size]}`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </div>
  );
}
