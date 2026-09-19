import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Courses() {
  return (
    <main>
      <Header />

      <div className="home-content">

        <section className="welcome">
          <h1>All Courses</h1>
          <p>
            Choose your engineering branch and start learning
          </p>
        </section>

        <section className="courses-page">

          <div className="branch-card">
            <img
              src="/images/civil.webp"
              alt="Civil Engineering"
            />

            <div className="branch-info">
              <h2>Civil Engineering</h2>
              <p>6 Subjects</p>
            </div>
          </div>

        </section>

      </div>

      <BottomNav />
    </main>
  );
    }
