"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import BottomNav from "../../../components/BottomNav";
import {
  getSubjectById,
  getFolders,
  getNotes,
  getQuizzes,
  DEFAULT_BRANCHES,
} from "../../../lib/firebase/services";

export default function SubjectDetailPage({ params }) {
  const unwrappedParams = use(params);
  const subjectId = unwrappedParams.id;

  const [subject, setSubject] = useState(null);
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [activeTypeTab, setActiveTypeTab] = useState("notes"); // 'notes' | 'quizzes'
  const [loading, setLoading] = useState(true);

  // Active full-screen / expanded preview item
  const [previewNote, setPreviewNote] = useState(null);
  const [previewQuiz, setPreviewQuiz] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [sData, fData, nData, qData] = await Promise.all([
        getSubjectById(subjectId),
        getFolders(subjectId),
        getNotes(subjectId),
        getQuizzes(subjectId),
      ]);
      setSubject(sData);
      setFolders(fData);
      setNotes(nData);
      setQuizzes(qData);
      setLoading(false);
    }
    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  const filteredNotes = activeFolderId === "all"
    ? notes
    : notes.filter((n) => n.folderId === activeFolderId);

  const filteredQuizzes = activeFolderId === "all"
    ? quizzes
    : quizzes.filter((q) => q.folderId === activeFolderId);

  const branchObj = DEFAULT_BRANCHES.find((b) => b.id === subject?.branchId);

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h1>Loading Subject...</h1>
        </div>
      </main>
    );
  }

  if (!subject) {
    return (
      <main>
        <Header />
        <div className="home-content" style={{ padding: "40px 20px", textAlign: "center" }}>
          <h2>Subject Not Found</h2>
          <p style={{ color: "#aebdd3", marginTop: "10px" }}>
            This subject may have been removed or does not exist.
          </p>
          <Link href="/courses" className="start-button" style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}>
            ← Back to Courses
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main>
      <Header />

      <div className="home-content">
        {/* Subject Header Banner */}
        <section className="welcome" style={{ paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#1687ff", marginBottom: "8px" }}>
            <Link href="/courses" style={{ color: "#aebdd3", textDecoration: "none" }}>
              Courses
            </Link>
            <span>›</span>
            <span>{branchObj?.name || subject.branchId}</span>
            <span>›</span>
            <span>Semester {subject.semester}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "10px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "#09233d",
                border: "1px solid rgba(80, 140, 190, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                flexShrink: 0,
              }}
            >
              {subject.icon || "📚"}
            </div>

            <div>
              <h1 style={{ fontSize: "24px", lineHeight: "1.2" }}>{subject.name}</h1>
              {subject.code && (
                <p style={{ color: "#aebdd3", fontSize: "13px", marginTop: "4px" }}>
                  Course Code: {subject.code}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Type Filter: Notes vs Quizzes */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            margin: "15px 20px 0",
            borderBottom: "1px solid rgba(80, 140, 190, 0.25)",
            paddingBottom: "10px",
          }}
        >
          <button
            onClick={() => setActiveTypeTab("notes")}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "none",
              background: activeTypeTab === "notes" ? "#1687ff" : "#09233d",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            📚 Study Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTypeTab("quizzes")}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "none",
              background: activeTypeTab === "quizzes" ? "#1687ff" : "#09233d",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            🎯 Practice Quizzes ({quizzes.length})
          </button>
        </div>

        {/* Folders / Units Pills Filter */}
        {folders.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              margin: "15px 20px 0",
              overflowX: "auto",
              paddingBottom: "6px",
            }}
          >
            <button
              onClick={() => setActiveFolderId("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "14px",
                border: activeFolderId === "all" ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                background: activeFolderId === "all" ? "rgba(22, 135, 255, 0.2)" : "#09233d",
                color: activeFolderId === "all" ? "#1687ff" : "#aebdd3",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              All Folders
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolderId(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "14px",
                  border: activeFolderId === f.id ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                  background: activeFolderId === f.id ? "rgba(22, 135, 255, 0.2)" : "#09233d",
                  color: activeFolderId === f.id ? "#1687ff" : "#aebdd3",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📁 {f.title}
              </button>
            ))}
          </div>
        )}

        {/* NOTES SECTION */}
        {activeTypeTab === "notes" && (
          <div style={{ margin: "20px 20px 0" }}>
            {filteredNotes.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "#09233d",
                  borderRadius: "18px",
                  border: "1px dashed rgba(80, 140, 190, 0.3)",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📖</div>
                <h3>No notes uploaded in this folder yet</h3>
                <p style={{ color: "#aebdd3", fontSize: "14px", marginTop: "6px" }}>
                  Notes, Drive PDFs, or HTML lecture content will appear here once published by the Admin.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredNotes.map((note) => {
                  const folder = folders.find((f) => f.id === note.folderId);
                  return (
                    <div
                      key={note.id}
                      style={{
                        background: "#09233d",
                        border: "1px solid rgba(80, 140, 190, 0.25)",
                        borderRadius: "16px",
                        padding: "16px 18px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background:
                                  note.contentType === "drive_link"
                                    ? "rgba(32, 185, 120, 0.2)"
                                    : note.contentType === "pdf_url"
                                    ? "rgba(255, 145, 56, 0.2)"
                                    : "rgba(136, 72, 232, 0.2)",
                                color:
                                  note.contentType === "drive_link"
                                    ? "#20b978"
                                    : note.contentType === "pdf_url"
                                    ? "#ff9138"
                                    : "#a855f7",
                              }}
                            >
                              {note.contentType === "drive_link"
                                ? "Google Drive PDF"
                                : note.contentType === "pdf_url"
                                ? "PDF Document"
                                : "HTML Notes"}
                            </span>
                            {folder && (
                              <span style={{ fontSize: "12px", color: "#aebdd3" }}>
                                📁 {folder.title}
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: "17px", marginTop: "8px", fontWeight: "700" }}>
                            {note.title}
                          </h3>

                          {note.description && (
                            <p style={{ color: "#aebdd3", fontSize: "13px", marginTop: "4px" }}>
                              {note.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => setPreviewNote(note)}
                          style={{
                            padding: "8px 16px",
                            background: "#1687ff",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          Open & Read →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* QUIZZES SECTION */}
        {activeTypeTab === "quizzes" && (
          <div style={{ margin: "20px 20px 0" }}>
            {filteredQuizzes.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "#09233d",
                  borderRadius: "18px",
                  border: "1px dashed rgba(80, 140, 190, 0.3)",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎯</div>
                <h3>No practice quizzes available yet</h3>
                <p style={{ color: "#aebdd3", fontSize: "14px", marginTop: "6px" }}>
                  Interactive quizzes will appear here once published by the Admin.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      background: "#09233d",
                      border: "1px solid rgba(80, 140, 190, 0.25)",
                      borderRadius: "16px",
                      padding: "16px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#1687ff", fontWeight: "700" }}>
                          🎯 Interactive Quiz
                        </span>
                      </div>
                      <h3 style={{ fontSize: "17px", marginTop: "4px", fontWeight: "700" }}>
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p style={{ color: "#aebdd3", fontSize: "13px", marginTop: "4px" }}>
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setPreviewQuiz(quiz)}
                      style={{
                        padding: "8px 16px",
                        background: "#20b978",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Start Quiz →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Note Reader / Preview */}
        {previewNote && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(2, 13, 28, 0.88)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setPreviewNote(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "850px",
                maxHeight: "90vh",
                background: "#09233d",
                borderRadius: "20px",
                border: "1px solid rgba(80, 140, 190, 0.35)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reader Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(80, 140, 190, 0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#061a2e",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0 }}>
                    {previewNote.title}
                  </h3>
                  <small style={{ color: "#aebdd3" }}>
                    {previewNote.contentType === "drive_link"
                      ? "Google Drive Document"
                      : previewNote.contentType === "pdf_url"
                      ? "PDF Document"
                      : "HTML Notes"}
                  </small>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {previewNote.contentType !== "html" && (
                    <a
                      href={previewNote.content}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "6px 12px",
                        background: "#1687ff",
                        color: "white",
                        borderRadius: "8px",
                        fontSize: "12px",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      Open in New Tab ↗
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewNote(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#aebdd3",
                      fontSize: "22px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Reader Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {previewNote.contentType === "html" ? (
                  <div
                    style={{
                      background: "#061a2e",
                      padding: "24px",
                      borderRadius: "14px",
                      border: "1px solid rgba(80, 140, 190, 0.2)",
                      color: "#e2e8f0",
                      lineHeight: "1.7",
                    }}
                    dangerouslySetInnerHTML={{ __html: previewNote.content }}
                  />
                ) : (
                  <iframe
                    src={previewNote.content}
                    title={previewNote.title}
                    style={{
                      width: "100%",
                      height: "70vh",
                      border: "none",
                      borderRadius: "12px",
                      background: "#ffffff",
                    }}
                    allow="autoplay"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Quiz Player */}
        {previewQuiz && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(2, 13, 28, 0.88)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setPreviewQuiz(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "750px",
                maxHeight: "90vh",
                background: "#09233d",
                borderRadius: "20px",
                border: "1px solid rgba(80, 140, 190, 0.35)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(80, 140, 190, 0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#061a2e",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0 }}>
                    🎯 {previewQuiz.title}
                  </h3>
                  {previewQuiz.description && (
                    <small style={{ color: "#aebdd3" }}>{previewQuiz.description}</small>
                  )}
                </div>

                <button
                  onClick={() => setPreviewQuiz(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#aebdd3",
                    fontSize: "22px",
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                <div
                  style={{
                    background: "#061a2e",
                    padding: "24px",
                    borderRadius: "14px",
                    border: "1px solid rgba(80, 140, 190, 0.2)",
                    color: "#e2e8f0",
                    lineHeight: "1.7",
                  }}
                  dangerouslySetInnerHTML={{ __html: previewQuiz.htmlContent }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
