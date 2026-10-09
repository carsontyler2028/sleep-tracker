import { useEffect, useState } from "react";

export type CloudSyncStatus =
| "idle"
| "syncing"
| "synced"
| "error";

interface ConnectionStatusProps {
syncStatus: CloudSyncStatus;
}

type ConnectionState = "connected" | "offline" | "checking";

export default function ConnectionStatus({
syncStatus,
}: ConnectionStatusProps) {
const [connection, setConnection] =
useState<ConnectionState>("checking");

useEffect(() => {
function updateConnection() {
setConnection(
navigator.onLine ? "connected" : "offline"
);
}


updateConnection();

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

return () => {
  window.removeEventListener("online", updateConnection);
  window.removeEventListener("offline", updateConnection);
};

}, []);

let label: string;
let dotClass: string;

if (connection === "checking") {
label = "Checking";
dotClass = "checking";
} else if (connection === "offline") {
label = "Offline";
dotClass = "offline";
} else {
switch (syncStatus) {
case "syncing":
label = "Connected · Syncing…";
dotClass = "syncing";
break;


  case "synced":
    label = "Connected · Synced";
    dotClass = "synced";
    break;

  case "error":
    label = "Connected · Sync failed";
    dotClass = "sync-error";
    break;

  default:
    label = "Connected";
    dotClass = "connected";
    break;
}


}

return ( <div
   className="connection-status"
   role="status"
   aria-live="polite"
 >
<span className={`connection-dot ${dotClass}`} /> <span>{label}</span> </div>
);
}
