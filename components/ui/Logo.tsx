type LogoProps = {
  /** Rendered width/height in px (the mark is square). */
  size?: number;
  className?: string;
  /** Accessible label; pass an empty string to mark the logo decorative. */
  title?: string;
};

/**
 * Tanaka Projects mark — nested squares with corner ties.
 * Strokes use `currentColor` so the logo inherits the surrounding text color
 * (adapts to light/dark theme and any placement). Scale via the `size` prop.
 */
export function Logo({ size = 24, className, title = "Tanaka's Gallery" }: LogoProps) {
  const decorative = title === "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
    >
      <rect x="6" y="6" width="36" height="36" stroke="currentColor" strokeWidth="1.2" />
      <rect x="15" y="15" width="18" height="18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="6" y1="6" x2="15" y2="15" stroke="currentColor" strokeWidth="1.2" />
      <line x1="42" y1="6" x2="33" y2="15" stroke="currentColor" strokeWidth="1.2" />
      <line x1="6" y1="42" x2="15" y2="33" stroke="currentColor" strokeWidth="1.2" />
      <line x1="42" y1="42" x2="33" y2="33" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
