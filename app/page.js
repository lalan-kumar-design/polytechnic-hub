import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Home() {
  return (
    <main>
      <Header />

      <div className="home-content">

        <section className="welcome">
          <h1>Welcome to Polytechnic Hub</h1>

          <p>
            Your Complete Learning Platform for a Brighter Future
          </p>
        </section>

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

      </div>

      <BottomNav />
    </main>
  );
    }
