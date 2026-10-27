"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { DEFAULT_BRANCHES, getSubjects } from "../../lib/firebase/services";

export default function Courses() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    async function loadData() {
      const all = await getSubjects();
      setSubjects(all);
    }
    loadData();
  }, []);

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
          {DEFAULT_BRANCHES.map((branch) => {
            const count = subjects.filter((s) => s.branchId === branch.id).length;
            return (
              <Link
                key={branch.id}
                href={`/semester?branch=${branch.id}`}
                className="branch-card"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <img
                  src={branch.image}
                  alt={branch.name}
                />

                <div className="branch-info">
                  <h2>{branch.name}</h2>
                  <p>
                    {count > 0 ? `${count} Published Subjects` : "6 Semesters Available"}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
