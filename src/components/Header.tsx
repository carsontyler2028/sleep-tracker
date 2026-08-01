import AppLogo from "./AppLogo";
import ConnectionStatus from "./ConnectionStatus";
import "./Header.css";

interface HeaderProps {
  username: string | null;
}

function Header({
  username,
}: HeaderProps) {

  return (
    <header className="app-header">

      <div className="header-logo">
        <AppLogo />
      </div>

      <div className="header-info">

        <h1>
          Sleep Tracker
        </h1>

        <p className="version">
          v0.3 Beta
        </p>

        {username && (
          <p className="usernameDisplay">
            {username}
          </p>
        )}

        <ConnectionStatus />

      </div>

    </header>
  );
}

export default Header;