import Header from "../../../components/Header";
import BottomNav from "../../../components/BottomNav";

export default async function SemesterPage({ params }) {
  const { semester } = await params;

  return (
    <main>
      <Header />

      <div className="home-content">

        <section className="welcome">
          <h1>{semester} Semester</h1>

          <p>
            Subjects will appear here
          </p>
        </section>

        <section className="subjects-page">
        </section>

      </div>

      <BottomNav />
    </main>
  );
    }
