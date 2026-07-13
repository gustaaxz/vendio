type Props = { className?: string; size?: number };

/**
 * Vendio brand mark — renders the new generated premium logo icon.
 */
export function BrandMark({ className, size = 32 }: Props) {
  return (
    <img
      src="/logo.png"
      alt="Vendio Logo"
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className || ""}`}
    />
  );
}

export function BrandLogo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <BrandMark size={size} className={className} />
  );
}

