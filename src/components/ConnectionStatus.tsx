import { useEffect, useState } from "react";

type ConnectionState = "connected" | "offline" | "checking";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>("checking");

  useEffect(() => {
    const updateConnection = () => {
      setStatus(navigator.onLine ? "connected" : "offline");
    };

    updateConnection();

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  const labels = {
    connected: "Connected",
    offline: "Offline",
    checking: "Checking",
  };

  return (
    <div className="connection-status">
      <span className={`connection-dot ${status}`} />
      <span>{labels[status]}</span>
    </div>
  );
}