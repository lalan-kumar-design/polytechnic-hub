"use client";

import { use, useEffect, useState, useRef } from "react";
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

  // Quiz security states
  const [quizTabViolations, setQuizTabViolations] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  // Load subject data
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

  // Handle Fullscreen Exit by user (via Esc key, Android gesture, or back button)
  // Ensures orientation is ALWAYS unlocked and no frozen/spinning state occurs
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFullscreen) {
        // Unlock orientation immediately
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        } catch (e) {
          console.warn("Orientation unlock error:", e);
        }

        // Close preview modals
        setPreviewNote(null);
        setPreviewQuiz(null);
        setShowSecurityWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      // Clean up on unmount
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (e) {}
    };
  }, []);

  // Quiz Security: Monitor tab switching and window blur
  useEffect(() => {
    if (!previewQuiz) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setQuizTabViolations((prev) => prev + 1);
        setShowSecurityWarning(true);
      }
    };

    const handleWindowBlur = () => {
      setQuizTabViolations((prev) => prev + 1);
      setShowSecurityWarning(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [previewQuiz]);

  // =================== NOTE FULLSCREEN + LANDSCAPE ===================
  const openNoteInFullscreenLandscape = async (note) => {
    setPreviewNote(note);

    // 1. Enter Fullscreen (user gesture context)
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen error (will continue in viewport):", err);
    }

    // 2. Lock Screen Orientation to Landscape
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch (err) {
      console.warn("Screen orientation lock (permission or browser limitation):", err);
    }
  };

  const closeNoteFullscreenLandscape = async () => {
    // 1. Unlock screen orientation first
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (err) {
      console.warn("Screen orientation unlock error:", err);
    }

    // 2. Exit fullscreen cleanly
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Exit fullscreen error:", err);
    }

    setPreviewNote(null);
  };

  // =================== QUIZ FULLSCREEN + SECURITY ===================
  const openQuizInFullscreen = async (quiz) => {
    setPreviewQuiz(quiz);
    setQuizTabViolations(0);
    setShowSecurityWarning(false);

    // Enter Fullscreen only (Natural orientation, not forced landscape)
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Quiz fullscreen error:", err);
    }
  };

  const closeQuizFullscreen = async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Exit quiz fullscreen error:", err);
    }
    setPreviewQuiz(null);
    setShowSecurityWarning(false);
  };

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
                          onClick={() => openNoteInFullscreenLandscape(note)}
                          style={{
                            padding: "9px 18px",
                            background: "#1687ff",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="Open Fullscreen Landscape"
                        >
                          <span>🔄</span>
                          <span>Open Fullscreen →</span>
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
                        <span style={{ fontSize: "11px", color: "#20b978", background: "rgba(32, 185, 120, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                          🔒 Fullscreen Mode
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
                      onClick={() => openQuizInFullscreen(quiz)}
                      style={{
                        padding: "9px 18px",
                        background: "#20b978",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>🔒</span>
                      <span>Start Quiz →</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* FULLSCREEN LANDSCAPE VIEWER FOR ALL NOTES (HTML, PDF, DRIVE)   */}
        {/* ============================================================== */}
        {previewNote && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "#020d1c",
              display: "flex",
              flexDirection: "column",
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {/* Top Toolbar in Landscape View */}
            <div
              style={{
                height: "56px",
                minHeight: "56px",
                background: "#061a2e",
                borderBottom: "1px solid rgba(80, 140, 190, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 18px",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                <span
                  style={{
                    background: "rgba(22, 135, 255, 0.2)",
                    color: "#1687ff",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔄 Landscape Reader
                </span>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#ffffff",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "50vw",
                  }}
                >
                  {previewNote.title}
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {previewNote.contentType !== "html" && (
                  <a
                    href={previewNote.content}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 12px",
                      background: "rgba(22, 135, 255, 0.2)",
                      border: "1px solid #1687ff",
                      color: "#1687ff",
                      borderRadius: "8px",
                      fontSize: "12px",
                      textDecoration: "none",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Open Link ↗
                  </a>
                )}

                <button
                  onClick={closeNoteFullscreenLandscape}
                  style={{
                    padding: "7px 16px",
                    background: "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                  title="Close Fullscreen Landscape"
                >
                  <span>✕</span>
                  <span>Exit</span>
                </button>
              </div>
            </div>

            {/* Note Body (Wide Landscape Mode) */}
            <div
              style={{
                flex: 1,
                width: "100%",
                height: "calc(100vh - 56px)",
                overflowY: "auto",
                background: "#020d1c",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {previewNote.contentType === "html" ? (
                <div
                  style={{
                    padding: "24px 32px",
                    maxWidth: "1200px",
                    width: "100%",
                    margin: "0 auto",
                    color: "#e2e8f0",
                    fontSize: "16px",
                    lineHeight: "1.8",
                  }}
                  dangerouslySetInnerHTML={{ __html: previewNote.content }}
                />
              ) : (
                <iframe
                  src={previewNote.content}
                  title={previewNote.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "#ffffff",
                    flex: 1,
                  }}
                  allow="autoplay; fullscreen"
                />
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FULLSCREEN SECURE TEST VIEWER FOR QUIZZES                       */}
        {/* ============================================================== */}
        {previewQuiz && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "#020d1c",
              display: "flex",
              flexDirection: "column",
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
            }}
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => {
              e.preventDefault();
              alert("Copying test questions is strictly prohibited.");
            }}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
          >
            {/* Top Security Header */}
            <div
              style={{
                height: "56px",
                minHeight: "56px",
                background: "#061a2e",
                borderBottom: "1px solid rgba(80, 140, 190, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 18px",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    background: "rgba(32, 185, 120, 0.2)",
                    color: "#20b978",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>🔒</span>
                  <span>Secure Test Mode</span>
                </span>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#ffffff",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "40vw",
                  }}
                >
                  {previewQuiz.title}
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {quizTabViolations > 0 && (
                  <span
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: "700",
                    }}
                  >
                    ⚠️ Tab Switch: {quizTabViolations}
                  </span>
                )}

                <button
                  onClick={closeQuizFullscreen}
                  style={{
                    padding: "7px 16px",
                    background: "#20b978",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Submit & Exit Quiz
                </button>
              </div>
            </div>

            {/* Security Notice Banner if student attempted to switch tabs */}
            {showSecurityWarning && (
              <div
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️ Warning: Tab switching or screen leaving is recorded! Please complete your quiz without navigating away.</span>
                <button
                  onClick={() => setShowSecurityWarning(false)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Quiz Body */}
            <div
              style={{
                flex: 1,
                width: "100%",
                height: "calc(100vh - 56px)",
                overflowY: "auto",
                background: "#020d1c",
                padding: "24px 20px 80px",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              <div
                style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  background: "#09233d",
                  borderRadius: "18px",
                  border: "1px solid rgba(80, 140, 190, 0.25)",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    color: "#e2e8f0",
                    fontSize: "15px",
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
