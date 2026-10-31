interface SusiProps {
  mood?: "wave" | "think";
  size?: number;
  className?: string;
}

// Susi: the app's wolf coach (Finnish for "wolf"). Original flat SVG.
export function Susi({ mood = "wave", size = 128, className = "" }: SusiProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <g transform={mood === "think" ? "rotate(-6 60 66)" : undefined}>
        <path d="M22 18 L44 46 L30 58 Z" fill="#6b7480" />
        <path d="M98 18 L76 46 L90 58 Z" fill="#6b7480" />
        <path d="M27 26 L40 45 L32 51 Z" fill="#e7b9a8" />
        <path d="M93 26 L80 45 L88 51 Z" fill="#e7b9a8" />
        <path
          d="M60 30 C84 30 98 48 98 68 C98 90 80 104 60 104 C40 104 22 90 22 68 C22 48 36 30 60 30 Z"
          fill="#8a94a0"
        />
        <path
          d="M60 52 C74 52 84 66 84 80 C84 96 72 104 60 104 C48 104 36 96 36 80 C36 66 46 52 60 52 Z"
          fill="#eef1f4"
        />
        <path d="M34 58 C40 52 48 52 52 58 C48 62 40 64 34 58 Z" fill="#eef1f4" />
        <path d="M86 58 C80 52 72 52 68 58 C72 62 80 64 86 58 Z" fill="#eef1f4" />
        <circle cx="44" cy="62" r="6" fill="#16202a" />
        <circle cx="76" cy="62" r="6" fill="#16202a" />
        <circle cx="46" cy="60" r="2" fill="#ffffff" />
        <circle cx="78" cy="60" r="2" fill="#ffffff" />
        <path
          d="M53 76 C53 72 67 72 67 76 C67 80 62 83 60 83 C58 83 53 80 53 76 Z"
          fill="#16202a"
        />
        <path
          d="M60 83 L60 88 M54 90 C57 93 63 93 66 90"
          stroke="#16202a"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <path d="M30 100 C44 110 76 110 90 100 L92 112 C76 120 44 120 28 112 Z" fill="#5fae58" />
      <path d="M78 106 L90 118 L82 120 L74 109 Z" fill="#3f8d3b" />
      {mood === "wave" ? (
        <g transform="rotate(-18 104 92)">
          <ellipse cx="104" cy="92" rx="9" ry="12" fill="#8a94a0" />
          <ellipse cx="104" cy="88" rx="5" ry="5" fill="#eef1f4" />
        </g>
      ) : (
        <>
          <circle cx="104" cy="22" r="5" fill="#eef1f4" />
          <circle cx="112" cy="12" r="3" fill="#eef1f4" />
        </>
      )}
    </svg>
  );
}
