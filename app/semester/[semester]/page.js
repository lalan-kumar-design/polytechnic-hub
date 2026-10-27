"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import BottomNav from "../../../components/BottomNav";
import { getSubjects, DEFAULT_BRANCHES } from "../../../lib/firebase/services";

export default function SemesterPage({ params }) {
  const unwrappedParams = use(params);
  const semesterNum = Number(unwrappedParams.semester);

  const [subjects, setSubjects] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSemesterSubjects() {
      setLoading(true);
      const branchParam = selectedBranch === "all" ? null : selectedBranch;
      const list = await getSubjects(branchParam, semesterNum);
      setSubjects(list);
      setLoading(false);
    }
    loadSemesterSubjects();
  }, [selectedBranch, semesterNum]);

  return (
    <main>
      <Header />

      <div className="home-content">
        <section className="welcome">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#aebdd3", marginBottom: "8px" }}>
            <Link href="/courses" style={{ color: "#aebdd3", textDecoration: "none" }}>
              Courses
            </Link>
            <span>›</span>
            <Link href="/semester" style={{ color: "#aebdd3", textDecoration: "none" }}>
              Semesters
            </Link>
            <span>›</span>
            <span style={{ color: "#1687ff" }}>Semester {semesterNum}</span>
          </div>

          <h1>Semester {semesterNum} Subjects</h1>
          <p>Explore notes, PYQ, and practice quizzes for your semester</p>
        </section>

        {/* Branch Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            margin: "10px 20px 20px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          <button
            onClick={() => setSelectedBranch("all")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: selectedBranch === "all" ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.25)",
              background: selectedBranch === "all" ? "#1687ff" : "#09233d",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            All Branches
          </button>
          {DEFAULT_BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: selectedBranch === b.id ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.25)",
                background: selectedBranch === b.id ? "#1687ff" : "#09233d",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {b.icon} {b.name}
            </button>
          ))}
        </div>

        {/* Subjects List */}
        <section style={{ margin: "0 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 15px" }}></div>
              <p style={{ color: "#aebdd3" }}>Loading semester subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "45px 20px",
                background: "#09233d",
                borderRadius: "20px",
                border: "1px dashed rgba(80, 140, 190, 0.3)",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📚</div>
              <h3 style={{ fontSize: "19px", color: "white" }}>
                No subjects found for Semester {semesterNum}
              </h3>
              <p style={{ color: "#aebdd3", fontSize: "14px", marginTop: "8px", maxWidth: "420px", margin: "8px auto 20px" }}>
                Subjects, folders, and notes can be added easily from the Admin Portal.
              </p>
              <Link
                href="/admin"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "#1687ff",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Go to Admin Portal →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {subjects.map((sub) => {
                const branchObj = DEFAULT_BRANCHES.find((b) => b.id === sub.branchId);
                return (
                  <Link
                    key={sub.id}
                    href={`/subject/${sub.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        background: "#09233d",
                        border: "1px solid rgba(80, 140, 190, 0.25)",
                        borderRadius: "18px",
                        padding: "18px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "transform 0.2s ease, border-color 0.2s ease",
                      }}
                      className="branch-card"
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background: "#061a2e",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "24px",
                            }}
                          >
                            {sub.icon || "📚"}
                          </span>

                          <span
                            style={{
                              fontSize: "11px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: "rgba(22, 135, 255, 0.15)",
                              color: "#1687ff",
                              fontWeight: "700",
                            }}
                          >
                            Sem {sub.semester}
                          </span>
                        </div>

                        <h3 style={{ fontSize: "17px", fontWeight: "700", lineHeight: "1.3" }}>
                          {sub.name}
                        </h3>

                        {sub.code && (
                          <p style={{ color: "#aebdd3", fontSize: "12px", marginTop: "4px" }}>
                            Code: {sub.code}
                          </p>
                        )}
                      </div>

                      <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(80, 140, 190, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#aebdd3" }}>
                          {branchObj?.name || sub.branchId}
                        </span>
                        <span style={{ fontSize: "13px", color: "#1687ff", fontWeight: "700" }}>
                          Open Notes →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
