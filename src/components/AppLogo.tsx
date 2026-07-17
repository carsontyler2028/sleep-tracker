export default function AppLogo() {
  return (
    <div className="app-logo">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Moon */}
        <path
          d="M30 8C25 10 21 15 21 21C21 29 27 35 35 35C37 35 39 34.5 41 33.5C37 40 30 44 23 42C14 39 9 30 12 21C15 13 22 8 30 8Z"
          fill="currentColor"
        />

        {/* Heartbeat line */}
        <path
          d="M10 27H17L20 22L24 31L28 25H38"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span>Sleep Tracker</span>
    </div>
  );
}