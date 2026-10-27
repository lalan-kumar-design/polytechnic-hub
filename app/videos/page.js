"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import {
  DEFAULT_BRANCHES,
  getSubjects,
  getVideos,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "../../lib/firebase/services";

export default function VideosPage() {
  const [branches] = useState(DEFAULT_BRANCHES);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isLandscapeFullscreen, setIsLandscapeFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const playerContainerRef = useRef(null);

  // Load videos and subjects
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const bParam = selectedBranch === "all" ? null : selectedBranch;
      const sParam = selectedSemester === "all" ? null : Number(selectedSemester);

      const [vList, subList] = await Promise.all([
        getVideos(bParam, sParam),
        getSubjects(bParam, sParam),
      ]);

      setVideos(vList);
      setSubjects(subList);

      // Auto-select first video if none is active
      if (vList.length > 0 && !activeVideo) {
        setActiveVideo(vList[0]);
      }
      setLoading(false);
    }

    loadData();
  }, [selectedBranch, selectedSemester]);

  // Handle Fullscreen Exit by user (via Esc, back swipe, or device button)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs && isLandscapeFullscreen) {
        // Unlock orientation cleanly and restore normal portrait view
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        } catch (e) {
          console.warn("Unlock error:", e);
        }
        setIsLandscapeFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (e) {}
    };
  }, [isLandscapeFullscreen]);

  // =================== ENTER LANDSCAPE FULLSCREEN ===================
  const enterLandscape = async () => {
    setIsLandscapeFullscreen(true);

    // 1. Enter native fullscreen
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }

    // 2. Lock screen orientation to landscape
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch (err) {
      console.warn("Screen orientation lock (permission or limitation):", err);
    }
  };

  // =================== EXIT LANDSCAPE FULLSCREEN ===================
  const exitLandscape = async () => {
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

    setIsLandscapeFullscreen(false);
  };

  const handleSelectVideo = (video) => {
    setActiveVideo(video);
    // Smooth scroll up to the top player
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeSubject = activeVideo ? subjects.find((s) => s.id === activeVideo.subjectId) : null;
  const activeBranch = activeVideo ? branches.find((b) => b.id === activeVideo.branchId) : null;

  return (
    <main style={{ minHeight: "100vh", background: "#020d1c" }}>
      {/* If in landscape fullscreen: absolutely NO header or bottom nav visible */}
      {!isLandscapeFullscreen && <Header />}

      <div className="home-content">
        {/* ========================================================= */}
        {/* TOP VIDEO PLAYER SECTION (PORTRAIT DEFAULT)               */}
        {/* ========================================================= */}
        {activeVideo && (
          <section
            ref={playerContainerRef}
            style={
              isLandscapeFullscreen
                ? {
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 999999,
                    background: "#000000",
                    margin: 0,
                    padding: 0,
                    overflow: "hidden",
                  }
                : {
                    margin: "12px 16px 20px",
                  }
            }
          >
            {/* If Landscape Fullscreen: Minimalist Floating Exit Pill Only */}
            {isLandscapeFullscreen ? (
              <div
                style={{
                  position: "fixed",
                  top: "14px",
                  right: "16px",
                  zIndex: 1000000,
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={exitLandscape}
                  style={{
                    background: "rgba(220, 38, 38, 0.9)",
                    backdropFilter: "blur(6px)",
                    color: "#ffffff",
                    border: "none",
                    padding: "7px 16px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Exit Fullscreen Landscape"
                >
                  <span>✕</span>
                  <span>Exit Landscape</span>
                </button>
              </div>
            ) : null}

            {/* Video Iframe Container */}
            <div
              style={
                isLandscapeFullscreen
                  ? {
                      position: "absolute",
                      inset: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "#000000",
                    }
                  : {
                      width: "100%",
                      aspectRatio: "16 / 9",
                      background: "#000000",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid rgba(80, 140, 190, 0.3)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      position: "relative",
                    }
              }
            >
              <iframe
                src={getYouTubeEmbedUrl(activeVideo.youtubeUrl, true)}
                title={activeVideo.title}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Portrait Details Bar Below Video with [ ] Landscape Button */}
            {!isLandscapeFullscreen && (
              <div
                style={{
                  background: "#09233d",
                  borderRadius: "16px",
                  border: "1px solid rgba(80, 140, 190, 0.25)",
                  padding: "16px 18px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "240px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {activeBranch && (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: "rgba(22, 135, 255, 0.2)",
                            color: "#1687ff",
                          }}
                        >
                          {activeBranch.icon} {activeBranch.name}
                        </span>
                      )}
                      {activeVideo.semester && (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: "rgba(32, 185, 120, 0.2)",
                            color: "#20b978",
                          }}
                        >
                          Semester {activeVideo.semester}
                        </span>
                      )}
                      {activeSubject && (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: "rgba(136, 72, 232, 0.2)",
                            color: "#a855f7",
                          }}
                        >
                          {activeSubject.icon} {activeSubject.name}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: "18px", fontWeight: "700", lineHeight: "1.3" }}>
                      {activeVideo.title}
                    </h2>

                    {activeVideo.description && (
                      <p style={{ color: "#aebdd3", fontSize: "13px", marginTop: "6px", lineHeight: "1.5" }}>
                        {activeVideo.description}
                      </p>
                    )}
                  </div>

                  {/* Landscape Fullscreen Button [ ] */}
                  <button
                    onClick={enterLandscape}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#1687ff",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "14px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(22, 135, 255, 0.35)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    title="Switch to Fullscreen Landscape"
                  >
                    <span style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "1px" }}>[ ]</span>
                    <span>Landscape</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* FILTER BAR & ALL VIDEO LECTURES LIST                      */}
        {/* ========================================================= */}
        {!isLandscapeFullscreen && (
          <div style={{ margin: "10px 16px 25px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800" }}>
                🎥 Video Lectures & Classes
              </h2>
              <p style={{ color: "#aebdd3", fontSize: "13px", marginTop: "4px" }}>
                Select branch and semester to browse recorded video classes
              </p>
            </div>

            {/* Branch Pills Filter */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "10px",
                marginBottom: "12px",
              }}
            >
              <button
                onClick={() => setSelectedBranch("all")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: selectedBranch === "all" ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                  background: selectedBranch === "all" ? "#1687ff" : "#09233d",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                All Branches
              </button>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: selectedBranch === b.id ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                    background: selectedBranch === b.id ? "#1687ff" : "#09233d",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.icon} {b.name}
                </button>
              ))}
            </div>

            {/* Semester Filter */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => setSelectedSemester("all")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: selectedSemester === "all" ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                  background: selectedSemester === "all" ? "#1687ff" : "#09233d",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                All Semesters
              </button>
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(String(sem))}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: selectedSemester === String(sem) ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                    background: selectedSemester === String(sem) ? "#1687ff" : "#09233d",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Sem {sem}
                </button>
              ))}
            </div>

            {/* Video Cards Grid */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div className="loading-spinner" style={{ margin: "0 auto 15px" }}></div>
                <p style={{ color: "#aebdd3" }}>Loading lectures...</p>
              </div>
            ) : videos.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  background: "#09233d",
                  borderRadius: "20px",
                  border: "1px dashed rgba(80, 140, 190, 0.3)",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎥</div>
                <h3 style={{ fontSize: "18px" }}>No video lectures found</h3>
                <p style={{ color: "#aebdd3", fontSize: "13px", marginTop: "6px" }}>
                  The Admin can add YouTube video links directly from the Admin Portal.
                </p>
                <Link
                  href="/admin"
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    padding: "8px 18px",
                    background: "#1687ff",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  Open Admin Portal →
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {videos.map((vid) => {
                  const isCurrent = activeVideo?.id === vid.id;
                  const vSubject = subjects.find((s) => s.id === vid.subjectId);
                  const vBranch = branches.find((b) => b.id === vid.branchId);

                  return (
                    <div
                      key={vid.id}
                      onClick={() => handleSelectVideo(vid)}
                      style={{
                        background: isCurrent ? "rgba(22, 135, 255, 0.12)" : "#09233d",
                        border: isCurrent ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.25)",
                        borderRadius: "18px",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, border-color 0.2s ease",
                      }}
                      className="branch-card"
                    >
                      {/* Thumbnail with duration badge */}
                      <div style={{ position: "relative", width: "100%", height: "160px", background: "#061a2e" }}>
                        <img
                          src={getYouTubeThumbnailUrl(vid.youtubeUrl)}
                          alt={vid.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        {/* Play Icon Overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: isCurrent ? "#20b978" : "#1687ff",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                            }}
                          >
                            ▶
                          </div>
                        </div>

                        {vid.duration && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: "8px",
                              right: "8px",
                              background: "rgba(0, 0, 0, 0.8)",
                              color: "#ffffff",
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: "600",
                            }}
                          >
                            ⏱ {vid.duration}
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                          {vBranch && (
                            <span style={{ fontSize: "11px", color: "#1687ff", fontWeight: "700" }}>
                              {vBranch.name.split(" ")[0]}
                            </span>
                          )}
                          {vid.semester && (
                            <span style={{ fontSize: "11px", color: "#20b978", fontWeight: "600" }}>
                              • Sem {vid.semester}
                            </span>
                          )}
                          {vSubject && (
                            <span style={{ fontSize: "11px", color: "#aebdd3" }}>
                              • {vSubject.name}
                            </span>
                          )}
                        </div>

                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            lineHeight: "1.35",
                            color: isCurrent ? "#1687ff" : "#ffffff",
                          }}
                        >
                          {vid.title}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "12px",
                            paddingTop: "10px",
                            borderTop: "1px solid rgba(80, 140, 190, 0.15)",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: isCurrent ? "#20b978" : "#1687ff", fontWeight: "700" }}>
                            {isCurrent ? "● Now Playing" : "▶ Watch Lecture"}
                          </span>

                          <span style={{ fontSize: "12px", color: "#aebdd3" }}>
                            [ ] Landscape Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {!isLandscapeFullscreen && <BottomNav />}
    </main>
  );
}
