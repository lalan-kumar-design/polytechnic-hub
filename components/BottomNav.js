import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">

      <Link href="/" className="nav-item active">
        <span>⌂</span>
        <small>Home</small>
      </Link>

      <Link href="/courses" className="nav-item">
        <span>▣</span>
        <small>Courses</small>
      </Link>

      <Link href="/videos" className="nav-item">
        <span>▶</span>
        <small>Videos</small>
      </Link>

      <Link href="/help" className="nav-item">
        <span>?</span>
        <small>Help</small>
      </Link>

    </nav>
  );
    }
