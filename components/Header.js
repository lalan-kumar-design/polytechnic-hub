import Link from "next/link";
import PWAInstallButton from "./PWAInstallButton";

export default function Header() {
  return (
    <header className="top-header">
      <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="logo">🎓</div>

        <div>
          <h2>
            POLYTECHNIC <span>HUB</span>
          </h2>
          <p>Learn • Practice • Grow</p>
        </div>
      </Link>

      <div className="header-actions">
        <PWAInstallButton variant="header" />

        <button className="notification" aria-label="Notifications" title="Notifications">
          🔔
          <span></span>
        </button>

        <Link
          href="/admin"
          className="profile"
          aria-label="Admin Portal"
          title="Admin Portal (/admin)"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          👤
        </Link>
      </div>
    </header>
  );
}
