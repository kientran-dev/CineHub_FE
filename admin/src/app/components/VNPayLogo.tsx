export function VNPayLogo() {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-blue-600 rounded text-white font-bold text-xs">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3h18v18H3V3z"
          fill="currentColor"
        />
        <path
          d="M7 7l5 10M12 7l5 10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>VNPAY</span>
    </div>
  );
}
