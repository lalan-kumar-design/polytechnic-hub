import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function VideosPage() {
  return (
    <main>
      <Header />

      <div className="home-content">
        <section className="welcome">
          <h1>Video Lectures</h1>
          <p>Watch recorded and live lectures from experienced faculty</p>
        </section>

        <section className="subjects-page">
          <p style={{ color: "#aebdd3", fontSize: "15px" }}>
            Video lectures and tutorials will appear here
          </p>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
