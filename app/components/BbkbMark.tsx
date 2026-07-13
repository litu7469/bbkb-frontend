export function BbkbMark({ size = 34, radius = 8 }: { size?: number; radius?: number }) {
  const icon = Math.round(size * 0.56);
  return (
    <div style={{
      width: size, height: size, background: '#F5A623',
      borderRadius: radius, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width={icon} height={icon} viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="2" rx="1" fill="#0D2B5E" />
        <rect x="2" y="8" width="12" height="2" rx="1" fill="#0D2B5E" />
        <rect x="2" y="12" width="14" height="2" rx="1" fill="#0D2B5E" />
        <circle cx="15" cy="14" r="4" fill="#0D2B5E" />
        <path d="M13.5 14l1 1 2-2" stroke="#F5A623" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
