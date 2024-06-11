const WarningIcon = ({ stroke = 'var(--yellow)' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1.94718"
      y="12"
      width="14.2169"
      height="14.2169"
      transform="rotate(-45 1.94718 12)"
      stroke={stroke}
      strokeWidth="2"
    />
    <path d="M12 8.04053V13.0424" stroke={stroke} strokeWidth="1.8" />
    <path d="M12 14.4595V15.9595" stroke={stroke} strokeWidth="1.8" />
  </svg>
);

export default WarningIcon;
