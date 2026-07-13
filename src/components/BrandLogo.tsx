type Props = { className?: string; size?: number };

/**
 * Vendio brand mark — abstract "V" formed by two ascending bars,
 * suggesting growth / rising sales. Uses currentColor so it inherits
 * from the parent, plus a gradient fill defined inline.
 */
export function BrandMark({ className, size = 32 }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vendio-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(258 90% 66%)" />
          <stop offset="100%" stopColor="hsl(190 95% 55%)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#vendio-mark)" />
      <path
        d="M8 9 L13 22 L16 22 L11 9 Z M18 9 L23 9 L18 22 L15 22 Z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <BrandMark size={28} />
      <span className="text-lg">
        Vendio<span className="text-primary">.</span>
      </span>
    </span>
  );
}
