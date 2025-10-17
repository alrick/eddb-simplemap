export function UnifrLogo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0" y="0" width="28" height="85" fill="currentColor" />
      <rect x="36" y="0" width="28" height="28" fill="currentColor" />
      <rect x="72" y="0" width="28" height="85" fill="currentColor" />
      <rect x="36" y="29" width="28" height="28" fill="currentColor" />
      <rect x="0" y="86" width="64" height="14" fill="currentColor" />
    </svg>
  )
}
