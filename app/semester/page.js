"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { DEFAULT_BRANCHES } from "../../lib/firebase/services";
import { Suspense } from "react";

function SemesterContent() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");
  const branch = DEFAULT_BRANCHES.find((b) => b.id === branchId);

  return (
    <div className="home-content">
      <section className="welcome">
        {branch && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#1687ff", marginBottom: "6px" }}>
            <span>{branch.icon} {branch.name}</span>
          </div>
        )}
        <h1>Choose Semester</h1>
        <p>Select your semester to access subjects, notes, and PYQs</p>
      </section>

      <section className="semester-grid">
        {[1, 2, 3, 4, 5, 6].map((sem) => (
          <Link
            key={sem}
            href={`/semester/${sem}${branchId ? `?branch=${branchId}` : ""}`}
            style={{ textDecoration: "none" }}
          >
            <button style={{ width: "100%", height: "100%" }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                {sem === 1 ? "1st" : sem === 2 ? "2nd" : sem === 3 ? "3rd" : `${sem}th`} Semester
              </div>
              <span style={{ fontSize: "12px", color: "#aebdd3", fontWeight: "normal" }}>
                Notes • PYQ • Quiz
              </span>
            </button>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default function SemesterPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#aebdd3" }}>Loading semesters...</p>
        </div>
      }>
        <SemesterContent />
      </Suspense>
      <BottomNav />
    </main>
  );
}
