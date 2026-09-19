export default function Header() {
  return (
    <header className="top-header">

      <div className="brand">
        <div className="logo">🎓</div>

        <div>
          <h2>
            POLYTECHNIC <span>HUB</span>
          </h2>

          <p>Learn • Practice • Grow</p>
        </div>
      </div>

      <div className="header-actions">

        <button className="notification">
          🔔
          <span></span>
        </button>

        <div className="profile">
          👤
        </div>

      </div>

    </header>
  );
    }
