import AppLogo from "./AppLogo";
import ConnectionStatus, {
type CloudSyncStatus,
} from "./ConnectionStatus";
import "./Header.css";
import { APP_VERSION } from "../version";

interface HeaderProps {
username: string | null;
syncStatus: CloudSyncStatus;
}

function Header({ username, syncStatus }: HeaderProps) {
return ( <header className="app-header"> <div className="header-logo"> <AppLogo /> </div>

  <div className="header-info">
    <h1>Sleep Tracker</h1>

    <p className="version">
      Version {APP_VERSION}
    </p>

    {username && (
      <p className="usernameDisplay">
        {username}
      </p>
    )}

    <ConnectionStatus syncStatus={syncStatus} />
  </div>
</header>


);
}

export default Header;
