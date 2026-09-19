import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">

      <Link href="/" className="nav-item active">
        <img src="/images/home.png" alt="Home" />
        <small>Home</small>
      </Link>

      <Link href="/courses" className="nav-item">
        <img src="/images/courses.png" alt="Courses" />
        <small>Courses</small>
      </Link>

      <Link href="/videos" className="nav-item">
        <img src="/images/videos.png" alt="Videos" />
        <small>Videos</small>
      </Link>

      <Link href="/help" className="nav-item">
        <img src="/images/help.png" alt="Help" />
        <small>Help</small>
      </Link>

    </nav>
  );
    }
