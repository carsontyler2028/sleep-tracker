type Page =
  | "home"
  | "history"
  | "analytics"
  | "settings";


interface NavigationProps {
  page: Page;
  setPage: (page: Page) => void;
}


function Navigation({
  page,
  setPage,
}: NavigationProps) {


  return (

    <nav>

      <button
        className={page === "home" ? "active" : ""}
        onClick={() => setPage("home")}
      >
        🏠
        <small>
          Home
        </small>
      </button>


      <button
        className={page === "history" ? "active" : ""}
        onClick={() => setPage("history")}
      >
        📅
        <small>
          History
        </small>
      </button>


      <button
        className={page === "analytics" ? "active" : ""}
        onClick={() => setPage("analytics")}
      >
        📊
        <small>
          Analytics
        </small>
      </button>


      <button
        className={page === "settings" ? "active" : ""}
        onClick={() => setPage("settings")}
      >
        ⚙️
        <small>
          Settings
        </small>
      </button>

    </nav>

  );
}


export default Navigation;