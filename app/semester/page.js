import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function SemesterPage() {
  return (
    <main>
      <Header />

      <div className="home-content">

        <section className="welcome">
          <h1>Choose Semester</h1>
          <p>
            Select your semester to continue
          </p>
        </section>

        <section className="semester-grid">

          <button>1st Semester</button>
          <button>2nd Semester</button>
          <button>3rd Semester</button>
          <button>4th Semester</button>
          <button>5th Semester</button>
          <button>6th Semester</button>

        </section>

      </div>

      <BottomNav />
    </main>
  );
    }
