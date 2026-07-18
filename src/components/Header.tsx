import AppLogo from "./AppLogo";
import ConnectionStatus from "./ConnectionStatus";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">

      <div className="header-logo">
        <AppLogo />
      </div>

      <div className="header-info">
        <h1>Sleep Tracker</h1>
        <p className="version">
          v0.2 Beta
        </p>

        <ConnectionStatus />
      </div>

    </header>
  );
}

export default Header;