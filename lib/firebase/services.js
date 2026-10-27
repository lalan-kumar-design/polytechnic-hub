import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export const DEFAULT_BRANCHES = [
  { id: "civil", name: "Civil Engineering", image: "/images/civil.webp", icon: "🏗️" },
  { id: "electrical", name: "Electrical Engineering", image: "/images/electrical.webp", icon: "⚡" },
  { id: "mechanical", name: "Mechanical Engineering", image: "/images/mechanical.webp", icon: "⚙️" },
  { id: "computer-science", name: "Computer Science Engineering", image: "/images/computer-science.png", icon: "💻" },
  { id: "electronics", name: "Electronics Engineering", image: "/images/electronics.png", icon: "📡" },
];

export const INITIAL_DEFAULT_SUBJECTS = [
  {
    id: "sub_math_1",
    name: "Applied Mathematics - I",
    code: "2001101",
    icon: "📐",
    branchId: "civil",
    semester: 1,
  },
  {
    id: "sub_phys_1",
    name: "Applied Physics - I",
    code: "2001102",
    icon: "🔬",
    branchId: "civil",
    semester: 1,
  },
  {
    id: "sub_chem_1",
    name: "Applied Chemistry",
    code: "2001103",
    icon: "🧪",
    branchId: "civil",
    semester: 1,
  },
  {
    id: "sub_comm_1",
    name: "Communication Skills",
    code: "2001104",
    icon: "🗣️",
    branchId: "civil",
    semester: 1,
  },
  {
    id: "sub_cse_prog",
    name: "Programming in C",
    code: "2001201",
    icon: "💻",
    branchId: "computer-science",
    semester: 1,
  },
  {
    id: "sub_elec_cir",
    name: "Basic Electrical Engineering",
    code: "2001105",
    icon: "⚡",
    branchId: "electrical",
    semester: 1,
  },
  {
    id: "sub_mech_eng",
    name: "Engineering Mechanics",
    code: "2001106",
    icon: "⚙️",
    branchId: "mechanical",
    semester: 1,
  },
];

export const INITIAL_DEFAULT_FOLDERS = [
  {
    id: "folder_unit1",
    subjectId: "sub_math_1",
    title: "Unit 1: Algebra & Trigonometry",
    order: 1,
  },
  {
    id: "folder_unit2",
    subjectId: "sub_math_1",
    title: "Unit 2: Differential Calculus",
    order: 2,
  },
  {
    id: "folder_pyq",
    subjectId: "sub_math_1",
    title: "Previous Year Questions (PYQ)",
    order: 3,
  },
];

export const INITIAL_DEFAULT_NOTES = [
  {
    id: "note_sample_html",
    subjectId: "sub_math_1",
    folderId: "folder_unit1",
    title: "Algebra & Matrices Key Formulas & Concepts",
    contentType: "html",
    content: `
      <h2>Unit 1: Algebra & Matrix Formulations</h2>
      <p>Welcome to Applied Mathematics notes for Polytechnic Engineering. Review the key formulas below:</p>
      <br/>
      <h3>1. Determinants Properties:</h3>
      <ul>
        <li>The value of a determinant remains unaltered if rows and columns are interchanged: |A| = |A<sup>T</sup>|.</li>
        <li>If any two rows (or columns) are identical, the determinant value is zero.</li>
        <li>Multiplying all elements of a row by scalar <em>k</em> multiplies the value of determinant by <em>k</em>.</li>
      </ul>
      <br/>
      <h3>2. Cramer's Rule for Linear Systems:</h3>
      <p>Given <em>AX = B</em>, x = D<sub>x</sub> / D, y = D<sub>y</sub> / D, z = D<sub>z</sub> / D (provided D ≠ 0).</p>
      <br/>
      <div style="padding: 12px; background: rgba(22,135,255,0.15); border-left: 4px solid #1687ff; border-radius: 6px;">
        <strong>Exam Tip:</strong> Always verify determinant minors and cofactors step-by-step to avoid negative sign errors.
      </div>
    `,
    description: "Formulas, theorems, and definitions with examples",
  },
  {
    id: "note_sample_drive",
    subjectId: "sub_math_1",
    folderId: "folder_pyq",
    title: "2023 SBTE Polytechnic Board Exam Paper",
    contentType: "drive_link",
    content: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    description: "Complete solved previous year examination paper",
  },
];

export const INITIAL_DEFAULT_QUIZZES = [
  {
    id: "quiz_sample_1",
    subjectId: "sub_math_1",
    folderId: "folder_unit1",
    title: "Matrices & Determinants Quick Self-Test",
    description: "10 Objective Questions • Practice for Board Exams",
    htmlContent: `
      <div style="font-family: sans-serif;">
        <h2 style="color: #1687ff; margin-bottom: 12px;">Applied Mathematics Quiz</h2>
        <p style="color: #aebdd3; margin-bottom: 20px;">Test your grasp of core Unit 1 matrix principles:</p>

        <div style="background: rgba(9,35,61,0.7); border: 1px solid rgba(80,140,190,0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #ffffff;">Q1: What is the determinant of a 2x2 identity matrix?</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="cursor: pointer; color: #d0dbea;"><input type="radio" name="q1" value="0"/> A) 0</label>
            <label style="cursor: pointer; color: #20b978; font-weight: 600;"><input type="radio" name="q1" value="1"/> B) 1 (Correct)</label>
            <label style="cursor: pointer; color: #d0dbea;"><input type="radio" name="q1" value="-1"/> C) -1</label>
            <label style="cursor: pointer; color: #d0dbea;"><input type="radio" name="q1" value="2"/> D) 2</label>
          </div>
        </div>

        <div style="background: rgba(9,35,61,0.7); border: 1px solid rgba(80,140,190,0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #ffffff;">Q2: If two rows of matrix A are equal, what is |A|?</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="cursor: pointer; color: #20b978; font-weight: 600;"><input type="radio" name="q2" value="0"/> A) 0 (Correct)</label>
            <label style="cursor: pointer; color: #d0dbea;"><input type="radio" name="q2" value="1"/> B) 1</label>
            <label style="cursor: pointer; color: #d0dbea;"><input type="radio" name="q2" value="Undefined"/> C) Undefined</label>
            <label style="cursor: pointer; color: #d0dbea;"><input type="radio" name="q2" value="Infinity"/> D) Infinity</label>
          </div>
        </div>
      </div>
    `,
  },
];

// Helper to convert Google Drive link to preview URL
export function formatDriveLink(url) {
  if (!url) return "";
  const trimmed = url.trim();
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) {
    return `https://drive.google.com/file/d/${matchFile[1]}/preview`;
  }
  const matchId = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://drive.google.com/file/d/${matchId[1]}/preview`;
  }
  return trimmed;
}

// Local storage fallback helpers
function getLocalFallback(key, defaultData = []) {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(`polyhub_${key}`);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(`polyhub_${key}`, JSON.stringify(defaultData));
    return defaultData;
  } catch {
    return defaultData;
  }
}

function setLocalFallback(key, data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`polyhub_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage error", e);
  }
}

// =================== SUBJECTS ===================
export async function getSubjects(branchId = null, semester = null) {
  let firestoreItems = [];
  try {
    const colRef = collection(db, "subjects");
    let q = query(colRef);
    if (branchId && semester) {
      q = query(colRef, where("branchId", "==", branchId), where("semester", "==", Number(semester)));
    } else if (branchId) {
      q = query(colRef, where("branchId", "==", branchId));
    } else if (semester) {
      q = query(colRef, where("semester", "==", Number(semester)));
    }
    const snap = await getDocs(q);
    firestoreItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Firestore getSubjects:", err.message);
  }

  const local = getLocalFallback("subjects", INITIAL_DEFAULT_SUBJECTS);
  const merged = [...firestoreItems];
  for (const item of local) {
    if (!merged.find((m) => m.id === item.id)) {
      if ((!branchId || item.branchId === branchId) && (!semester || Number(item.semester) === Number(semester))) {
        merged.push(item);
      }
    }
  }
  return merged;
}

export async function getSubjectById(subjectId) {
  try {
    const docRef = doc(db, "subjects", subjectId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (err) {
    console.warn("Firestore getSubjectById error:", err.message);
  }
  const local = getLocalFallback("subjects", INITIAL_DEFAULT_SUBJECTS);
  return local.find((s) => s.id === subjectId) || null;
}

export async function addSubject(subjectData) {
  const payload = {
    ...subjectData,
    semester: Number(subjectData.semester),
    createdAt: new Date().toISOString(),
  };

  let newId = `sub_${Date.now()}`;
  try {
    const colRef = collection(db, "subjects");
    const docRef = await addDoc(colRef, {
      ...payload,
      timestamp: serverTimestamp(),
    });
    newId = docRef.id;
  } catch (err) {
    console.warn("Firestore addSubject error, storing locally:", err.message);
  }

  const local = getLocalFallback("subjects", INITIAL_DEFAULT_SUBJECTS);
  local.push({ id: newId, ...payload });
  setLocalFallback("subjects", local);

  return { id: newId, ...payload };
}

export async function deleteSubject(subjectId) {
  try {
    await deleteDoc(doc(db, "subjects", subjectId));
  } catch (err) {
    console.warn("Firestore deleteSubject error:", err.message);
  }
  const local = getLocalFallback("subjects", INITIAL_DEFAULT_SUBJECTS).filter((s) => s.id !== subjectId);
  setLocalFallback("subjects", local);
}

// =================== FOLDERS / UNITS ===================
export async function getFolders(subjectId) {
  let firestoreItems = [];
  try {
    const colRef = collection(db, "folders");
    const q = query(colRef, where("subjectId", "==", subjectId));
    const snap = await getDocs(q);
    firestoreItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Firestore getFolders:", err.message);
  }

  const local = getLocalFallback("folders", INITIAL_DEFAULT_FOLDERS).filter((f) => f.subjectId === subjectId);
  const merged = [...firestoreItems];
  for (const item of local) {
    if (!merged.find((m) => m.id === item.id)) {
      merged.push(item);
    }
  }
  return merged.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function addFolder(folderData) {
  const payload = {
    ...folderData,
    order: Number(folderData.order || 1),
    createdAt: new Date().toISOString(),
  };

  let newId = `folder_${Date.now()}`;
  try {
    const colRef = collection(db, "folders");
    const docRef = await addDoc(colRef, {
      ...payload,
      timestamp: serverTimestamp(),
    });
    newId = docRef.id;
  } catch (err) {
    console.warn("Firestore addFolder error, storing locally:", err.message);
  }

  const local = getLocalFallback("folders", INITIAL_DEFAULT_FOLDERS);
  local.push({ id: newId, ...payload });
  setLocalFallback("folders", local);

  return { id: newId, ...payload };
}

export async function deleteFolder(folderId) {
  try {
    await deleteDoc(doc(db, "folders", folderId));
  } catch (err) {
    console.warn("Firestore deleteFolder error:", err.message);
  }
  const local = getLocalFallback("folders", INITIAL_DEFAULT_FOLDERS).filter((f) => f.id !== folderId);
  setLocalFallback("folders", local);
}

// =================== NOTES ===================
export async function getNotes(subjectId, folderId = null) {
  let firestoreItems = [];
  try {
    const colRef = collection(db, "notes");
    let q = query(colRef, where("subjectId", "==", subjectId));
    if (folderId) {
      q = query(colRef, where("subjectId", "==", subjectId), where("folderId", "==", folderId));
    }
    const snap = await getDocs(q);
    firestoreItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Firestore getNotes:", err.message);
  }

  const local = getLocalFallback("notes", INITIAL_DEFAULT_NOTES).filter((n) => {
    if (n.subjectId !== subjectId) return false;
    if (folderId && n.folderId !== folderId) return false;
    return true;
  });

  const merged = [...firestoreItems];
  for (const item of local) {
    if (!merged.find((m) => m.id === item.id)) {
      merged.push(item);
    }
  }
  return merged;
}

export async function addNote(noteData) {
  const payload = {
    ...noteData,
    createdAt: new Date().toISOString(),
  };

  let newId = `note_${Date.now()}`;
  try {
    const colRef = collection(db, "notes");
    const docRef = await addDoc(colRef, {
      ...payload,
      timestamp: serverTimestamp(),
    });
    newId = docRef.id;
  } catch (err) {
    console.warn("Firestore addNote error, storing locally:", err.message);
  }

  const local = getLocalFallback("notes", INITIAL_DEFAULT_NOTES);
  local.push({ id: newId, ...payload });
  setLocalFallback("notes", local);

  return { id: newId, ...payload };
}

export async function deleteNote(noteId) {
  try {
    await deleteDoc(doc(db, "notes", noteId));
  } catch (err) {
    console.warn("Firestore deleteNote error:", err.message);
  }
  const local = getLocalFallback("notes", INITIAL_DEFAULT_NOTES).filter((n) => n.id !== noteId);
  setLocalFallback("notes", local);
}

// =================== QUIZZES ===================
export async function getQuizzes(subjectId) {
  let firestoreItems = [];
  try {
    const colRef = collection(db, "quizzes");
    const q = query(colRef, where("subjectId", "==", subjectId));
    const snap = await getDocs(q);
    firestoreItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Firestore getQuizzes:", err.message);
  }

  const local = getLocalFallback("quizzes", INITIAL_DEFAULT_QUIZZES).filter((q) => q.subjectId === subjectId);
  const merged = [...firestoreItems];
  for (const item of local) {
    if (!merged.find((m) => m.id === item.id)) {
      merged.push(item);
    }
  }
  return merged;
}

export async function addQuiz(quizData) {
  const payload = {
    ...quizData,
    createdAt: new Date().toISOString(),
  };

  let newId = `quiz_${Date.now()}`;
  try {
    const colRef = collection(db, "quizzes");
    const docRef = await addDoc(colRef, {
      ...payload,
      timestamp: serverTimestamp(),
    });
    newId = docRef.id;
  } catch (err) {
    console.warn("Firestore addQuiz error, storing locally:", err.message);
  }

  const local = getLocalFallback("quizzes", INITIAL_DEFAULT_QUIZZES);
  local.push({ id: newId, ...payload });
  setLocalFallback("quizzes", local);

  return { id: newId, ...payload };
}

export async function deleteQuiz(quizId) {
  try {
    await deleteDoc(doc(db, "quizzes", quizId));
  } catch (err) {
    console.warn("Firestore deleteQuiz error:", err.message);
  }
  const local = getLocalFallback("quizzes", INITIAL_DEFAULT_QUIZZES).filter((q) => q.id !== quizId);
  setLocalFallback("quizzes", local);
}

// =================== YOUTUBE & VIDEO HELPERS ===================
export function parseYouTubeVideoId(url) {
  if (!url) return null;
  const str = url.trim();

  // Watch URL: youtube.com/watch?v=VIDEO_ID
  const watchMatch = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Shorts URL: youtube.com/shorts/VIDEO_ID
  const shortsMatch = str.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Live URL: youtube.com/live/VIDEO_ID
  const liveMatch = str.match(/youtube\.com\/live\/([^"&?\/\s]{11})/i);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  // Raw 11 char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;

  return null;
}

export function getYouTubeEmbedUrl(url, autoplay = false) {
  const id = parseYouTubeVideoId(url);
  if (!id) return url;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${autoplay ? "&autoplay=1" : ""}`;
}

export function getYouTubeThumbnailUrl(url) {
  const id = parseYouTubeVideoId(url);
  if (!id) return "/images/videos.png";
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export const INITIAL_DEFAULT_VIDEOS = [
  {
    id: "vid_math_1",
    title: "Matrices & Determinants - Complete Concept & Formulas",
    youtubeUrl: "https://www.youtube.com/watch?v=3zL43Vq9R80",
    branchId: "civil",
    semester: 1,
    subjectId: "sub_math_1",
    description: "Full chapter lecture covering matrix types, inverse, and Cramer's rule for polytechnic exams.",
    duration: "45 mins",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vid_phys_1",
    title: "Units & Dimensions - Applied Physics Lecture 01",
    youtubeUrl: "https://www.youtube.com/watch?v=2pW2f0Q7H8E",
    branchId: "civil",
    semester: 1,
    subjectId: "sub_phys_1",
    description: "Fundamental units, dimensional formulas, and principle of homogeneity with solved numericals.",
    duration: "38 mins",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vid_cse_1",
    title: "C Programming Introduction - Flowcharts & Variables",
    youtubeUrl: "https://www.youtube.com/watch?v=irqBtwB68Q4",
    branchId: "computer-science",
    semester: 1,
    subjectId: "sub_cse_prog",
    description: "Complete introduction to C language basics, compilers, and first hello world program.",
    duration: "52 mins",
    createdAt: new Date().toISOString(),
  },
];

// =================== VIDEOS CRUD ===================
export async function getVideos(branchId = null, semester = null, subjectId = null) {
  let firestoreItems = [];
  try {
    const colRef = collection(db, "videos");
    let q = query(colRef);
    if (subjectId) {
      q = query(colRef, where("subjectId", "==", subjectId));
    } else if (branchId && semester) {
      q = query(colRef, where("branchId", "==", branchId), where("semester", "==", Number(semester)));
    } else if (branchId) {
      q = query(colRef, where("branchId", "==", branchId));
    } else if (semester) {
      q = query(colRef, where("semester", "==", Number(semester)));
    }
    const snap = await getDocs(q);
    firestoreItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Firestore getVideos:", err.message);
  }

  const local = getLocalFallback("videos", INITIAL_DEFAULT_VIDEOS);
  const merged = [...firestoreItems];
  for (const item of local) {
    if (!merged.find((m) => m.id === item.id)) {
      if (
        (!branchId || item.branchId === branchId) &&
        (!semester || Number(item.semester) === Number(semester)) &&
        (!subjectId || item.subjectId === subjectId)
      ) {
        merged.push(item);
      }
    }
  }
  return merged;
}

export async function addVideo(videoData) {
  const payload = {
    ...videoData,
    semester: Number(videoData.semester),
    createdAt: new Date().toISOString(),
  };

  let newId = `vid_${Date.now()}`;
  try {
    const colRef = collection(db, "videos");
    const docRef = await addDoc(colRef, {
      ...payload,
      timestamp: serverTimestamp(),
    });
    newId = docRef.id;
  } catch (err) {
    console.warn("Firestore addVideo error, storing locally:", err.message);
  }

  const local = getLocalFallback("videos", INITIAL_DEFAULT_VIDEOS);
  local.push({ id: newId, ...payload });
  setLocalFallback("videos", local);

  return { id: newId, ...payload };
}

export async function deleteVideo(videoId) {
  try {
    await deleteDoc(doc(db, "videos", videoId));
  } catch (err) {
    console.warn("Firestore deleteVideo error:", err.message);
  }
  const local = getLocalFallback("videos", INITIAL_DEFAULT_VIDEOS).filter((v) => v.id !== videoId);
  setLocalFallback("videos", local);
}
