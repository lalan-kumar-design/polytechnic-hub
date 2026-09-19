"use client";

import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function SemesterPage() {
  const selectSemester = (semester) => {
    window.location.href = `/semester/${semester}`;
  };

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

          <button onClick={() => selectSemester("1")}>
            1st Semester
          </button>

          <button onClick={() => selectSemester("2")}>
            2nd Semester
          </button>

          <button onClick={() => selectSemester("3")}>
            3rd Semester
          </button>

          <button onClick={() => selectSemester("4")}>
            4th Semester
          </button>

          <button onClick={() => selectSemester("5")}>
            5th Semester
          </button>

          <button onClick={() => selectSemester("6")}>
            6th Semester
          </button>

        </section>

      </div>

      <BottomNav />
    </main>
  );
              }
