import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Home() {
  return (
    <main>
  <Header />

  <div className="home-content">

    {/* Welcome */}
    <section className="welcome">
      <h1>Welcome to Polytechnic Hub</h1>

      <p>
        Your Complete Learning Platform for a Brighter Future
      </p>
    </section>

    {/* Hero */}
    <section className="hero">
      <div className="hero-content">
        <h2>
          Study Smart
          <br />
          Build Your <span>Future</span>
        </h2>

        <p>
          Notes • PYQ • Quizzes • Video Lectures
          <br />
          All in One Place
        </p>

        <button className="start-button">
          Start Learning →
        </button>
      </div>
    </section>

    {/* Quick Access */}
    <section className="quick-access">

      <div className="quick-card">
        <div className="quick-icon">📚</div>
        <h3>Notes</h3>
        <p>Study Notes</p>
      </div>

      <div className="quick-card">
        <div className="quick-icon">📝</div>
        <h3>PYQ</h3>
        <p>Previous Year Questions</p>
      </div>

      <div className="quick-card">
        <div className="quick-icon">🎯</div>
        <h3>Quiz</h3>
        <p>Test Your Knowledge</p>
      </div>

      <div className="quick-card">
        <div className="quick-icon">📖</div>
        <h3>Study Materials</h3>
        <p>Books, PDFs & More</p>
      </div>

    </section>
      <section className="courses-section">

  <div className="section-title">
    <h2>Recent Courses</h2>

    <button>
      View All →
    </button>
  </div>
      <div className="course-card">
  <div className="course-image">
    🏗️
  </div>

  <div className="course-info">
    <h3>Civil Engineering</h3>
    <p>6 Subjects</p>
  </div>
</div>

</section>

  </div>

  <BottomNav />
</main>
  );
}
