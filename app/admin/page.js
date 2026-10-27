"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "../../lib/firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  DEFAULT_BRANCHES,
  getSubjects,
  addSubject,
  deleteSubject,
  getFolders,
  addFolder,
  deleteFolder,
  getNotes,
  addNote,
  deleteNote,
  getQuizzes,
  addQuiz,
  deleteQuiz,
  formatDriveLink,
} from "../../lib/firebase/services";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState("subjects");

  // Selection states
  const [selectedBranch, setSelectedBranch] = useState("civil");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Form states for creating items
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", icon: "📚" });
  const [folderForm, setFolderForm] = useState({ title: "", order: 1 });
  const [noteForm, setNoteForm] = useState({
    title: "",
    contentType: "drive_link", // 'drive_link' | 'pdf_url' | 'html'
    content: "",
    description: "",
  });
  const [quizForm, setQuizForm] = useState({
    title: "",
    htmlContent: "",
    description: "",
  });

  const [actionMessage, setActionMessage] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch subjects when branch or semester changes
  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user, selectedBranch, selectedSemester]);

  // Fetch folders and notes when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      loadFoldersAndNotes(selectedSubjectId);
    } else {
      setFolders([]);
      setNotes([]);
      setQuizzes([]);
      setSelectedFolderId("");
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    setLoadingData(true);
    const list = await getSubjects(selectedBranch, selectedSemester);
    setSubjects(list);
    if (list.length > 0) {
      if (!list.find((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(list[0].id);
      }
    } else {
      setSelectedSubjectId("");
    }
    setLoadingData(false);
  };

  const loadFoldersAndNotes = async (subjId) => {
    setLoadingData(true);
    const [fList, nList, qList] = await Promise.all([
      getFolders(subjId),
      getNotes(subjId),
      getQuizzes(subjId),
    ]);
    setFolders(fList);
    setNotes(nList);
    setQuizzes(qList);
    if (fList.length > 0 && !selectedFolderId) {
      setSelectedFolderId(fList[0].id);
    }
    setLoadingData(false);
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setAuthError("Invalid email or password. If this is your first time, switch to 'Setup Initial Admin'.");
      } else if (err.code === "auth/email-already-in-use") {
        setAuthError("This email is already registered. Please click 'Login with Existing Admin'.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters.");
      } else {
        setAuthError(err.message || "Authentication failed.");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Subject Handlers
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    setActionMessage("Saving subject...");
    const created = await addSubject({
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim(),
      icon: subjectForm.icon || "📚",
      branchId: selectedBranch,
      semester: Number(selectedSemester),
    });

    setSubjectForm({ name: "", code: "", icon: "📚" });
    setActionMessage("Subject added successfully!");
    setTimeout(() => setActionMessage(""), 3000);
    await loadSubjects();
    setSelectedSubjectId(created.id);
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    setActionMessage("Deleting subject...");
    await deleteSubject(id);
    await loadSubjects();
    setActionMessage("Subject deleted.");
    setTimeout(() => setActionMessage(""), 3000);
  };

  // Folder Handlers
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !folderForm.title.trim()) return;

    setActionMessage("Creating folder...");
    const created = await addFolder({
      title: folderForm.title.trim(),
      order: Number(folderForm.order || folders.length + 1),
      subjectId: selectedSubjectId,
    });

    setFolderForm({ title: "", order: folders.length + 2 });
    setActionMessage("Folder created successfully!");
    setTimeout(() => setActionMessage(""), 3000);
    await loadFoldersAndNotes(selectedSubjectId);
    setSelectedFolderId(created.id);
  };

  const handleDeleteFolder = async (id) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;
    await deleteFolder(id);
    await loadFoldersAndNotes(selectedSubjectId);
  };

  // Note Handlers
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !noteForm.title.trim() || !noteForm.content.trim()) return;

    setActionMessage("Adding note...");
    let processedContent = noteForm.content.trim();
    if (noteForm.contentType === "drive_link") {
      processedContent = formatDriveLink(processedContent);
    }

    await addNote({
      title: noteForm.title.trim(),
      contentType: noteForm.contentType,
      content: processedContent,
      description: noteForm.description.trim(),
      subjectId: selectedSubjectId,
      folderId: selectedFolderId || "",
    });

    setNoteForm({
      title: "",
      contentType: "drive_link",
      content: "",
      description: "",
    });
    setActionMessage("Note published successfully!");
    setTimeout(() => setActionMessage(""), 3000);
    await loadFoldersAndNotes(selectedSubjectId);
  };

  const handleDeleteNote = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    await deleteNote(id);
    await loadFoldersAndNotes(selectedSubjectId);
  };

  // Quiz Handlers
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !quizForm.title.trim() || !quizForm.htmlContent.trim()) return;

    setActionMessage("Adding quiz...");
    await addQuiz({
      title: quizForm.title.trim(),
      htmlContent: quizForm.htmlContent.trim(),
      description: quizForm.description.trim(),
      subjectId: selectedSubjectId,
      folderId: selectedFolderId || "",
    });

    setQuizForm({ title: "", htmlContent: "", description: "" });
    setActionMessage("Quiz published successfully!");
    setTimeout(() => setActionMessage(""), 3000);
    await loadFoldersAndNotes(selectedSubjectId);
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    await deleteQuiz(id);
    await loadFoldersAndNotes(selectedSubjectId);
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <main className="loading-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h1>Connecting to Firebase...</h1>
        </div>
      </main>
    );
  }

  // 2. Unauthenticated: Login / Initial Admin Setup Screen
  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-box" style={{ maxWidth: "460px" }}>
          <div className="auth-logo">
            🎓
          </div>

          <h1>Polytechnic Hub Admin</h1>
          <p className="auth-subtitle">
            {isRegisterMode
              ? "Create Initial Admin Account (Firebase Auth)"
              : "Sign in with your Firebase Admin credentials"}
          </p>

          <form onSubmit={handleAuthSubmit}>
            <div className="auth-field">
              <label>Admin Email</label>
              <input
                type="email"
                placeholder="admin@polytechnichub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {authError && <p className="auth-error">{authError}</p>}

            <button
              type="submit"
              className="auth-button"
              disabled={authSubmitting}
            >
              {authSubmitting
                ? "Processing..."
                : isRegisterMode
                ? "Register Admin Account"
                : "Login to Admin Portal"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#1687ff",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {isRegisterMode
                ? "Already have an admin account? Login"
                : "First time? Setup Initial Admin Account"}
            </button>
          </div>

          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(80, 140, 190, 0.2)", textAlign: "center" }}>
            <Link href="/" style={{ color: "#aebdd3", fontSize: "13px", textDecoration: "none" }}>
              ← Return to Student App
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated: Full Admin Dashboard
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <main style={{ minHeight: "100vh", background: "#020d1c", paddingBottom: "60px" }}>
      {/* Top Admin Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "#061a2e",
          borderBottom: "1px solid rgba(80, 140, 190, 0.25)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🎓</span>
          <div>
            <h2 style={{ fontSize: "18px", margin: 0, fontWeight: "800" }}>
              POLYTECHNIC <span>ADMIN</span>
            </h2>
            <span style={{ fontSize: "12px", color: "#20b978" }}>
              ● Logged in as: {user.email}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              padding: "7px 14px",
              background: "rgba(22, 135, 255, 0.15)",
              border: "1px solid #1687ff",
              color: "#1687ff",
              borderRadius: "8px",
              fontSize: "13px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            View Student App ↗
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 14px",
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          style={{
            background: "rgba(32, 185, 120, 0.9)",
            color: "#ffffff",
            padding: "10px 20px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {actionMessage}
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "25px auto", padding: "0 20px" }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            borderBottom: "1px solid rgba(80, 140, 190, 0.25)",
            paddingBottom: "12px",
            overflowX: "auto",
            marginBottom: "25px",
          }}
        >
          {[
            { id: "subjects", label: "1. Manage Subjects", icon: "📚" },
            { id: "folders", label: "2. Folders & Units", icon: "📁" },
            { id: "notes", label: "3. Upload Notes (HTML / PDF / Drive)", icon: "📝" },
            { id: "quizzes", label: "4. Add Quizzes (HTML)", icon: "🎯" },
            { id: "overview", label: "5. Content Overview", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === tab.id ? "#1687ff" : "#09233d",
                color: activeTab === tab.id ? "#ffffff" : "#aebdd3",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.2s ease",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Filter Bar: Branch & Semester */}
        <div
          style={{
            background: "#09233d",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid rgba(80, 140, 190, 0.25)",
            marginBottom: "25px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#aebdd3", marginBottom: "6px", fontWeight: "600" }}>
              Select Engineering Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#061a2e",
                color: "white",
                border: "1px solid rgba(80, 140, 190, 0.3)",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            >
              {DEFAULT_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#aebdd3", marginBottom: "6px", fontWeight: "600" }}>
              Select Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#061a2e",
                color: "white",
                border: "1px solid rgba(80, 140, 190, 0.3)",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#aebdd3", marginBottom: "6px", fontWeight: "600" }}>
              Active Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#061a2e",
                color: "white",
                border: "1px solid rgba(80, 140, 190, 0.3)",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            >
              {subjects.length === 0 ? (
                <option value="">No subjects created yet</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon || "📚"} {s.name} {s.code ? `(${s.code})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* TAB 1: SUBJECTS */}
        {activeTab === "subjects" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {/* Create Subject Card */}
            <div
              style={{
                background: "#09233d",
                padding: "24px",
                borderRadius: "20px",
                border: "1px solid rgba(80, 140, 190, 0.25)",
              }}
            >
              <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>➕ Add New Subject</h3>
              <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "20px" }}>
                Add a subject to Semester {selectedSemester} for{" "}
                {DEFAULT_BRANCHES.find((b) => b.id === selectedBranch)?.name}
              </p>

              <form onSubmit={handleCreateSubject}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Applied Physics - I"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#061a2e",
                      color: "white",
                      border: "1px solid rgba(80, 140, 190, 0.3)",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2001102"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#061a2e",
                      color: "white",
                      border: "1px solid rgba(80, 140, 190, 0.3)",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                    Subject Emoji Icon
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["📚", "📐", "🔬", "💻", "⚡", "⚙️", "🏗️", "🧪", "📡"].map((ico) => (
                      <button
                        type="button"
                        key={ico}
                        onClick={() => setSubjectForm({ ...subjectForm, icon: ico })}
                        style={{
                          fontSize: "20px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: subjectForm.icon === ico ? "#1687ff" : "#061a2e",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          cursor: "pointer",
                        }}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#1687ff",
                    color: "white",
                    fontWeight: "700",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Save Subject
                </button>
              </form>
            </div>

            {/* List Current Subjects */}
            <div
              style={{
                background: "#09233d",
                padding: "24px",
                borderRadius: "20px",
                border: "1px solid rgba(80, 140, 190, 0.25)",
              }}
            >
              <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                📋 Existing Subjects ({subjects.length})
              </h3>
              <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "16px" }}>
                Branch: {DEFAULT_BRANCHES.find((b) => b.id === selectedBranch)?.name} | Sem {selectedSemester}
              </p>

              {subjects.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#aebdd3" }}>
                  No subjects added yet for this branch and semester.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {subjects.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: "14px 16px",
                        background: selectedSubjectId === s.id ? "rgba(22, 135, 255, 0.15)" : "#061a2e",
                        border: selectedSubjectId === s.id ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        onClick={() => setSelectedSubjectId(s.id)}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        <div style={{ fontWeight: "700", fontSize: "15px" }}>
                          {s.icon || "📚"} {s.name}
                        </div>
                        {s.code && (
                          <div style={{ fontSize: "12px", color: "#aebdd3", marginTop: "3px" }}>
                            Code: {s.code}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setSelectedSubjectId(s.id);
                            setActiveTab("folders");
                          }}
                          style={{
                            padding: "6px 10px",
                            background: "#1687ff",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Manage Folders
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(s.id)}
                          style={{
                            padding: "6px 10px",
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FOLDERS / UNITS */}
        {activeTab === "folders" && (
          <div>
            {!selectedSubjectId ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#09233d", borderRadius: "20px" }}>
                <p style={{ color: "#aebdd3" }}>Please select or create a subject first from the filter bar above.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                {/* Create Folder Form */}
                <div
                  style={{
                    background: "#09233d",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(80, 140, 190, 0.25)",
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>📁 Create Folder / Unit</h3>
                  <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "20px" }}>
                    Subject: <strong>{activeSubject?.name}</strong>
                  </p>

                  <form onSubmit={handleCreateFolder}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Folder / Unit Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Unit 1: Matrices & Determinants"
                        value={folderForm.title}
                        onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Order / Unit Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={folderForm.order}
                        onChange={(e) => setFolderForm({ ...folderForm, order: Number(e.target.value) })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#1687ff",
                        color: "white",
                        fontWeight: "700",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Create Folder
                    </button>
                  </form>
                </div>

                {/* List Folders */}
                <div
                  style={{
                    background: "#09233d",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(80, 140, 190, 0.25)",
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    📂 Folders in {activeSubject?.name} ({folders.length})
                  </h3>
                  <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "16px" }}>
                    Click a folder to select it for uploading notes
                  </p>

                  {folders.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#aebdd3" }}>
                      No folders created yet in this subject. Create Unit 1 or PYQ folders above!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {folders.map((f) => (
                        <div
                          key={f.id}
                          style={{
                            padding: "14px 16px",
                            background: selectedFolderId === f.id ? "rgba(22, 135, 255, 0.15)" : "#061a2e",
                            border: selectedFolderId === f.id ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                            borderRadius: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            onClick={() => setSelectedFolderId(f.id)}
                            style={{ cursor: "pointer", flex: 1 }}
                          >
                            <span style={{ fontWeight: "700", fontSize: "15px" }}>
                              📁 {f.title}
                            </span>
                            <span style={{ marginLeft: "10px", fontSize: "12px", color: "#aebdd3" }}>
                              (Order #{f.order})
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => {
                                setSelectedFolderId(f.id);
                                setActiveTab("notes");
                              }}
                              style={{
                                padding: "6px 10px",
                                background: "#1687ff",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Add Notes
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(f.id)}
                              style={{
                                padding: "6px 10px",
                                background: "rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTES (HTML / PDF / DRIVE) */}
        {activeTab === "notes" && (
          <div>
            {!selectedSubjectId ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#09233d", borderRadius: "20px" }}>
                <p style={{ color: "#aebdd3" }}>Please select or create a subject first from the filter bar above.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
                {/* Note Form */}
                <div
                  style={{
                    background: "#09233d",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(80, 140, 190, 0.25)",
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>📝 Upload / Add Notes</h3>
                  <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "18px" }}>
                    Subject: <strong>{activeSubject?.name}</strong>
                  </p>

                  <form onSubmit={handleCreateNote}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Assign to Folder / Unit (Optional)
                      </label>
                      <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">General (No folder)</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            📁 {f.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Note Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Complete Handwritten Chapter 1 Notes"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Select Note Format *
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {[
                          { id: "drive_link", label: "Google Drive", icon: "🌐" },
                          { id: "pdf_url", label: "PDF URL", icon: "📄" },
                          { id: "html", label: "Raw HTML", icon: "💻" },
                        ].map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setNoteForm({ ...noteForm, contentType: m.id })}
                            style={{
                              padding: "10px 6px",
                              borderRadius: "8px",
                              border: noteForm.contentType === m.id ? "1px solid #1687ff" : "1px solid rgba(80, 140, 190, 0.2)",
                              background: noteForm.contentType === m.id ? "#1687ff" : "#061a2e",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            <div>{m.icon}</div>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        {noteForm.contentType === "drive_link"
                          ? "Google Drive Link (Sharing URL) *"
                          : noteForm.contentType === "pdf_url"
                          ? "Direct PDF URL Link *"
                          : "Paste HTML Content *"}
                      </label>

                      {noteForm.contentType === "html" ? (
                        <textarea
                          rows={8}
                          placeholder="<h2>Unit 1 Notes</h2><p>Definitions and key concepts...</p>"
                          value={noteForm.content}
                          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            background: "#061a2e",
                            color: "white",
                            border: "1px solid rgba(80, 140, 190, 0.3)",
                            borderRadius: "10px",
                            fontFamily: "monospace",
                            fontSize: "13px",
                          }}
                        />
                      ) : (
                        <input
                          type="url"
                          placeholder={
                            noteForm.contentType === "drive_link"
                              ? "https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
                              : "https://example.com/notes.pdf"
                          }
                          value={noteForm.content}
                          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            background: "#061a2e",
                            color: "white",
                            border: "1px solid rgba(80, 140, 190, 0.3)",
                            borderRadius: "10px",
                            fontSize: "13px",
                          }}
                        />
                      )}
                      <small style={{ color: "#aebdd3", fontSize: "11px", marginTop: "4px", display: "block" }}>
                        {noteForm.contentType === "drive_link" &&
                          "Tip: Make sure the file access in Google Drive is set to 'Anyone with the link can view'."}
                      </small>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Description / Short Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Prepared by Prof. Kumar, covers all numericals"
                        value={noteForm.description}
                        onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                          fontSize: "13px",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#1687ff",
                        color: "white",
                        fontWeight: "700",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Publish Note to Firebase
                    </button>
                  </form>
                </div>

                {/* Current Notes List */}
                <div
                  style={{
                    background: "#09233d",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(80, 140, 190, 0.25)",
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    📄 Published Notes ({notes.length})
                  </h3>
                  <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "16px" }}>
                    Subject: {activeSubject?.name}
                  </p>

                  {notes.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#aebdd3" }}>
                      No notes published yet for this subject. Fill out the form to add notes!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {notes.map((n) => {
                        const folder = folders.find((f) => f.id === n.folderId);
                        return (
                          <div
                            key={n.id}
                            style={{
                              padding: "14px 16px",
                              background: "#061a2e",
                              border: "1px solid rgba(80, 140, 190, 0.2)",
                              borderRadius: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ flex: 1, marginRight: "10px" }}>
                              <div style={{ fontWeight: "700", fontSize: "14px" }}>
                                {n.contentType === "drive_link" ? "🌐 Drive: " : n.contentType === "pdf_url" ? "📄 PDF: " : "💻 HTML: "}
                                {n.title}
                              </div>
                              <div style={{ fontSize: "12px", color: "#aebdd3", marginTop: "3px" }}>
                                {folder ? `📁 ${folder.title}` : "📂 General"}
                                {n.description ? ` • ${n.description}` : ""}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteNote(n.id)}
                              style={{
                                padding: "6px 10px",
                                background: "rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUIZZES (HTML) */}
        {activeTab === "quizzes" && (
          <div>
            {!selectedSubjectId ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#09233d", borderRadius: "20px" }}>
                <p style={{ color: "#aebdd3" }}>Please select or create a subject first from the filter bar above.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
                {/* Add Quiz Form */}
                <div
                  style={{
                    background: "#09233d",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(80, 140, 190, 0.25)",
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>🎯 Add Quiz (HTML)</h3>
                  <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "18px" }}>
                    Subject: <strong>{activeSubject?.name}</strong>
                  </p>

                  <form onSubmit={handleCreateQuiz}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Assign to Folder / Unit (Optional)
                      </label>
                      <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">General (No folder)</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            📁 {f.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Quiz Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 1 Practice MCQ Test"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Quiz HTML Code *
                      </label>
                      <textarea
                        rows={8}
                        placeholder="<div class='quiz-card'><h3>Question 1: What is Newton's Second Law?</h3><ul><li>A: F=ma</li><li>B: E=mc²</li></ul></div>"
                        value={quizForm.htmlContent}
                        onChange={(e) => setQuizForm({ ...quizForm, htmlContent: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                          fontFamily: "monospace",
                          fontSize: "13px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 Questions • 20 Minutes • Passing 60%"
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "#061a2e",
                          color: "white",
                          border: "1px solid rgba(80, 140, 190, 0.3)",
                          borderRadius: "10px",
                          fontSize: "13px",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#1687ff",
                        color: "white",
                        fontWeight: "700",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Publish Quiz to Firebase
                    </button>
                  </form>
                </div>

                {/* Current Quizzes List */}
                <div
                  style={{
                    background: "#09233d",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(80, 140, 190, 0.25)",
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    🎯 Published Quizzes ({quizzes.length})
                  </h3>
                  <p style={{ color: "#aebdd3", fontSize: "13px", marginBottom: "16px" }}>
                    Subject: {activeSubject?.name}
                  </p>

                  {quizzes.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#aebdd3" }}>
                      No quizzes added yet for this subject.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {quizzes.map((q) => {
                        const folder = folders.find((f) => f.id === q.folderId);
                        return (
                          <div
                            key={q.id}
                            style={{
                              padding: "14px 16px",
                              background: "#061a2e",
                              border: "1px solid rgba(80, 140, 190, 0.2)",
                              borderRadius: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ flex: 1, marginRight: "10px" }}>
                              <div style={{ fontWeight: "700", fontSize: "14px" }}>
                                🎯 {q.title}
                              </div>
                              <div style={{ fontSize: "12px", color: "#aebdd3", marginTop: "3px" }}>
                                {folder ? `📁 ${folder.title}` : "📂 General"}
                                {q.description ? ` • ${q.description}` : ""}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteQuiz(q.id)}
                              style={{
                                padding: "6px 10px",
                                background: "rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: OVERVIEW / STATS */}
        {activeTab === "overview" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div style={{ background: "#09233d", padding: "20px", borderRadius: "16px", border: "1px solid rgba(80, 140, 190, 0.25)" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📚</div>
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{subjects.length}</div>
                <div style={{ color: "#aebdd3", fontSize: "13px" }}>Subjects in current Branch/Sem</div>
              </div>

              <div style={{ background: "#09233d", padding: "20px", borderRadius: "16px", border: "1px solid rgba(80, 140, 190, 0.25)" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{folders.length}</div>
                <div style={{ color: "#aebdd3", fontSize: "13px" }}>Units / Folders in active Subject</div>
              </div>

              <div style={{ background: "#09233d", padding: "20px", borderRadius: "16px", border: "1px solid rgba(80, 140, 190, 0.25)" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📝</div>
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{notes.length}</div>
                <div style={{ color: "#aebdd3", fontSize: "13px" }}>Notes in active Subject</div>
              </div>

              <div style={{ background: "#09233d", padding: "20px", borderRadius: "16px", border: "1px solid rgba(80, 140, 190, 0.25)" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎯</div>
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{quizzes.length}</div>
                <div style={{ color: "#aebdd3", fontSize: "13px" }}>Quizzes in active Subject</div>
              </div>
            </div>

            <div style={{ background: "#09233d", padding: "24px", borderRadius: "20px", border: "1px solid rgba(80, 140, 190, 0.25)" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Quick Tips for Admin</h3>
              <ul style={{ color: "#d0dbea", lineHeight: 1.8, fontSize: "14px", paddingLeft: "20px" }}>
                <li>
                  <strong>Google Drive PDFs:</strong> Simply copy the "Anyone with the link" sharing link from Google Drive. Polytechnic Hub automatically converts it to an embeddable preview reader.
                </li>
                <li>
                  <strong>Raw HTML Notes:</strong> You can write or paste complete styled HTML notes including formulas, tables, headings, and images.
                </li>
                <li>
                  <strong>Folders/Units:</strong> Categorize content by Unit 1, Unit 2, PYQ 2024, or Assignment Solutions.
                </li>
                <li>
                  <strong>Live Synchronization:</strong> Everything added in this portal is instantly visible to students in the Polytechnic Hub app!
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
