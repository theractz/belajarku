import { createId } from "./utils";

const KEYS = {
  users: "belajarku_users",
  materials: "belajarku_materials",
  results: "belajarku_quiz_results",
  activities: "belajarku_activities",
  session: "belajarku_session",
};

const LEGACY_KEYS = [
  "belajarku_questions",
  "belajarku_attempts",
  "belajarku_drafts",
];

const DB_KEYS = [...Object.values(KEYS), ...LEGACY_KEYS];
export const GENERATE_LIMIT_PER_DAY = 3;

export function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Gagal membaca localStorage key "${key}"`, error);
    return fallback;
  }
}

export function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Gagal menyimpan localStorage key "${key}"`, error);
  }
}

export function removeKey(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Gagal menghapus localStorage key "${key}"`, error);
  }
}

function dateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Users ────────────────────────────────────────────────────────────────

export function getUsers() {
  return readJSON(KEYS.users, []);
}

export function saveUsers(users) {
  writeJSON(KEYS.users, users);
}

export function getSession() {
  return readJSON(KEYS.session, null);
}

function setSession(userId) {
  writeJSON(KEYS.session, { user_id: userId, created_at: new Date().toISOString() });
}

export function clearSession() {
  removeKey(KEYS.session);
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return getUsers().find((u) => u.id === session.user_id) || null;
}

export function registerUser({ name, email, password }) {
  const users = getUsers();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!name || !email || !password) {
    return { error: "Semua kolom wajib diisi" };
  }
  if (users.some((u) => u.email === normalizedEmail)) {
    return { error: "Email sudah terdaftar" };
  }
  const user = {
    id: createId("u"),
    name: name.trim(),
    email: normalizedEmail,
    password,
    class_level: null,
    xp: 0,
    streak: 0,
    last_study_date: null,
    generate_count: 0,
    generate_date: null,
    created_at: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  setSession(user.id);
  return { user };
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) return { error: "Email tidak ditemukan" };
  if (user.password !== password) return { error: "Password salah" };
  setSession(user.id);
  return { user };
}

export function logoutUser() {
  clearSession();
}

export function updateUser(patch) {
  const current = getCurrentUser();
  if (!current) return null;
  const users = getUsers();
  const index = users.findIndex((u) => u.id === current.id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...patch };
  saveUsers(users);
  return users[index];
}

export function updateClassLevel(classLevel) {
  const value = Number(classLevel);
  if (![7, 8, 9].includes(value)) return null;
  return updateUser({ class_level: value });
}

export function addXp(amount) {
  const current = getCurrentUser();
  if (!current) return null;
  return updateUser({ xp: current.xp + amount });
}

// ─── XP & Streak ───────────────────────────────────────────────────────────

export function recordActivity({ type, title, xp = 0 }) {
  const current = getCurrentUser();
  if (!current) return null;
  const today = dateKey(new Date());
  const lastStudy = current.last_study_date ? dateKey(new Date(current.last_study_date)) : null;
  const yesterdayKey = dateKey(new Date(Date.now() - 86400000));

  let streak = current.streak || 0;
  if (lastStudy === today) {
    streak = streak === 0 ? 1 : streak;
  } else if (lastStudy === yesterdayKey) {
    streak += 1;
  } else {
    streak = 1;
  }

  const activities = readJSON(KEYS.activities, []);
  activities.unshift({
    id: createId("a"),
    user_id: current.id,
    type,
    title,
    xp,
    created_at: new Date().toISOString(),
  });
  writeJSON(KEYS.activities, activities.slice(0, 100));

  const users = getUsers();
  const index = users.findIndex((u) => u.id === current.id);
  if (index === -1) return null;
  users[index] = {
    ...users[index],
    streak,
    last_study_date: today,
    xp: users[index].xp + xp,
  };
  saveUsers(users);
  return users[index];
}

// ─── Generate quota (maks 3x / hari) ──────────────────────────────────────

export function getRemainingGenerates() {
  const current = getCurrentUser();
  if (!current) return 0;
  const today = dateKey(new Date());
  if (current.generate_date !== today) return GENERATE_LIMIT_PER_DAY;
  return Math.max(0, GENERATE_LIMIT_PER_DAY - (current.generate_count || 0));
}

export function consumeGenerate() {
  const current = getCurrentUser();
  if (!current) return { error: "Silakan login terlebih dahulu" };
  const today = dateKey(new Date());
  const remaining = getRemainingGenerates();
  if (remaining <= 0) {
    return { error: "Kamu sudah mencapai batas 3x generate hari ini. Coba lagi besok!" };
  }
  const count = current.generate_date === today ? current.generate_count + 1 : 1;
  updateUser({ generate_date: today, generate_count: count });
  return { remaining: GENERATE_LIMIT_PER_DAY - count };
}

// ─── Materials ────────────────────────────────────────────────────────────

export function getMaterials(userId) {
  return readJSON(KEYS.materials, [])
    .filter((m) => m.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function addMaterial({ file_name, extracted_text }) {
  const current = getCurrentUser();
  if (!current) return { error: "Silakan login terlebih dahulu" };
  const material = {
    id: createId("mat"),
    user_id: current.id,
    file_name,
    extracted_text,
    created_at: new Date().toISOString(),
  };
  const materials = readJSON(KEYS.materials, []);
  writeJSON(KEYS.materials, [...materials, material]);
  return { material };
}

export function deleteMaterial(materialId) {
  const materials = readJSON(KEYS.materials, []).filter((m) => m.id !== materialId);
  writeJSON(KEYS.materials, materials);
  const results = readJSON(KEYS.results, []).filter((r) => r.material_id !== materialId);
  writeJSON(KEYS.results, results);
}

// ─── Hasil Kuis (statistik) ───────────────────────────────────────────────

export function getResults(userId) {
  return readJSON(KEYS.results, [])
    .filter((r) => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function addResult({
  material_id,
  material_name,
  subject,
  type,
  total,
  correct,
  wrong,
  score,
  xp,
  wrong_questions,
}) {
  const current = getCurrentUser();
  if (!current) return { error: "Silakan login terlebih dahulu" };
  const result = {
    id: createId("r"),
    user_id: current.id,
    material_id: material_id || null,
    material_name: material_name || "Materi",
    subject: subject || null,
    type: type || "PG",
    total: Number(total) || 0,
    correct: Number(correct) || 0,
    wrong: Number(wrong) || 0,
    score: Number(score) || 0,
    xp: Number(xp) || 0,
    wrong_questions: Array.isArray(wrong_questions) ? wrong_questions : [],
    created_at: new Date().toISOString(),
  };
  const results = readJSON(KEYS.results, []);
  writeJSON(KEYS.results, [result, ...results]);
  return { result };
}

export function deleteResult(resultId) {
  const results = readJSON(KEYS.results, []).filter((r) => r.id !== resultId);
  writeJSON(KEYS.results, results);
}

// ─── Danger zone ─────────────────────────────────────────────────────────

export function resetAllData() {
  DB_KEYS.forEach((key) => removeKey(key));
}

// ─── Dashboard stats ──────────────────────────────────────────────────────

export function getDashboardStats(userId) {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return null;
  const results = getResults(userId);
  const materials = getMaterials(userId);
  const activities = readJSON(KEYS.activities, [])
    .filter((a) => a.user_id === userId)
    .slice(0, 8);

  const totalQuestions = results.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalCorrect = results.reduce((sum, r) => sum + (r.correct || 0), 0);
  const totalQuizzes = results.length;
  const averageScore =
    totalQuizzes > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / totalQuizzes)
      : 0;

  const today = dateKey(new Date());
  const questionsToday = results
    .filter((r) => dateKey(new Date(r.created_at)) === today)
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const last7Days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const count = results
      .filter((r) => dateKey(new Date(r.created_at)) === key)
      .reduce((sum, r) => sum + (r.total || 0), 0);
    last7Days.push({
      key,
      label: d.toLocaleDateString("id-ID", { weekday: "short" }),
      count,
    });
  }

  return {
    user,
    materialsCount: materials.length,
    totalQuizzes,
    totalQuestions,
    averageScore,
    questionsToday,
    accuracy:
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    last7Days,
    activities,
  };
}
