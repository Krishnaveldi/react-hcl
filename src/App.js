import { useState, createContext, useContext } from "react";

// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const USERS = [
  { id: 1, username: "admin", password: "admin123", role: "Admin", email: "admin@gnitc.ac.in" },
  { id: 2, username: "veldi", password: "veldi123", role: "Student", email: "22wj1a66c5@gnitc.ac.in" },
];

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");

  const login = (username, password) => {
    const found = USERS.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      setLoginError("");
      return true;
    }
    setLoginError("Invalid credentials. Try admin/admin123 or veldi/veldi123");
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, loginError, setLoginError }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Protected Route ─────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="login" />;
  if (requiredRole && user.role !== requiredRole) return <Forbidden />;
  return children;
}

function Navigate({ to }) {
  // Simple navigation trigger via context
  const { setPage } = useRouterContext();
  useState(() => { setPage(to); }, []);
  return null;
}

// ─── Simple Router ────────────────────────────────────────────────────────────
const RouterContext = createContext(null);
const useRouterContext = () => useContext(RouterContext);

function Router({ children }) {
  const { user } = useAuth();
  const [page, setPage] = useState("login");

  // Auto redirect
  const currentPage = !user && page !== "login" ? "login" : page;

  return (
    <RouterContext.Provider value={{ page: currentPage, setPage }}>
      {children}
    </RouterContext.Provider>
  );
}

function Route({ path, element }) {
  const { page } = useRouterContext();
  return page === path ? element : null;
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function LoginPage() {
  const { login, loginError, setLoginError } = useAuth();
  const { setPage } = useRouterContext();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const ok = login(form.username, form.password);
    setLoading(false);
    if (ok) setPage("dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.loginCard}>
        {/* Header */}
        <div style={styles.loginHeader}>
          <div style={styles.logoBox}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
              <path d="M16 7L25 12V20L16 25L7 20V12L16 7Z" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="#0ea5e9"/>
            </svg>
          </div>
          <h1 style={styles.loginTitle}>SecureAuth</h1>
          <p style={styles.loginSubtitle}>GNITC · CSM Department</p>
          <div style={styles.badge}>22WJ1A66C5 · Veldi Sai Krishna</div>
        </div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input
                style={styles.input}
                placeholder="Enter username"
                value={form.username}
                onChange={e => { setForm({...form, username: e.target.value}); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                style={styles.input}
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={e => { setForm({...form, password: e.target.value}); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <button style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {loginError && (
            <div style={styles.errorBox}>
              ⚠️ {loginError}
            </div>
          )}

          <button
            style={{...styles.loginBtn, opacity: loading ? 0.7 : 1}}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span style={styles.spinner}>⟳</span> : null}
            {loading ? " Authenticating..." : "Sign In →"}
          </button>

          <div style={styles.hintBox}>
            <strong>Demo Credentials:</strong><br/>
            admin / admin123 &nbsp;|&nbsp; veldi / veldi123
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();
  const { setPage } = useRouterContext();
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "courses", label: "Courses", icon: "📚" },
    ...(user.role === "Admin" ? [{ id: "admin", label: "Admin Panel", icon: "🛡️" }] : []),
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    logout();
    setPage("login");
  };

  return (
    <div style={styles.dashLayout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sideHeader}>
          <div style={styles.sideLogoWrap}>
            <div style={styles.sideLogo}>S</div>
            <div>
              <div style={styles.sideLogoText}>SecureAuth</div>
              <div style={styles.sideLogoSub}>Protected App</div>
            </div>
          </div>
        </div>

        <div style={styles.userCard}>
          <div style={styles.avatar}>{user.username[0].toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user.username}</div>
            <div style={styles.userRole}>
              <span style={{...styles.rolePill, background: user.role === "Admin" ? "#fbbf24" : "#34d399"}}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {})}}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topbar}>
          <h2 style={styles.pageTitle}>{navItems.find(n => n.id === activeTab)?.label}</h2>
          <div style={styles.topbarRight}>
            <span style={styles.onlineBadge}>● Online</span>
            <span style={styles.topbarUser}>{user.email}</span>
          </div>
        </div>

        <div style={styles.content}>
          {activeTab === "overview" && <OverviewTab user={user} />}
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "courses" && <CoursesTab />}
          {activeTab === "admin" && user.role === "Admin" && <AdminTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab({ user }) {
  const stats = [
    { label: "Courses Enrolled", value: "6", icon: "📚", color: "#0ea5e9" },
    { label: "Assignments Done", value: "24", icon: "✅", color: "#10b981" },
    { label: "Attendance %", value: "91%", icon: "📊", color: "#f59e0b" },
    { label: "CGPA", value: "8.4", icon: "🎓", color: "#8b5cf6" },
  ];

  return (
    <div>
      <div style={styles.welcomeBanner}>
        <div>
          <h3 style={{margin: 0, fontSize: 22, color: "#fff"}}>Welcome back, {user.username}! 👋</h3>
          <p style={{margin: "4px 0 0", color: "#bae6fd", fontSize: 14}}>
            Logged in as <strong>{user.role}</strong> · {user.email}
          </p>
        </div>
        <div style={styles.welcomeDecor}>🔐</div>
      </div>

      <div style={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} style={{...styles.statCard, borderLeft: `4px solid ${s.color}`}}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.infoCard}>
        <h4 style={styles.cardTitle}>🔒 Authentication Features</h4>
        <ul style={styles.featureList}>
          {[
            "JWT-style Context-based Authentication",
            "Protected Routes with Role Checking",
            "Automatic Redirect on Unauthorized Access",
            "Session Persistence via Auth Context",
            "Role-based Access Control (RBAC)",
            "Secure Logout & Session Cleanup",
          ].map(f => (
            <li key={f} style={styles.featureItem}>
              <span style={{color: "#10b981"}}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  return (
    <div style={styles.infoCard}>
      <h4 style={styles.cardTitle}>👤 User Profile</h4>
      <div style={styles.profileGrid}>
        <div style={styles.profileAvatarBig}>{user.username[0].toUpperCase()}</div>
        <div style={styles.profileDetails}>
          {[
            ["Roll Number", "22WJ1A66C5"],
            ["Full Name", "Veldi Sai Krishna"],
            ["Branch", "CSM"],
            ["College", "GNITC"],
            ["Username", user.username],
            ["Email", user.email],
            ["Role", user.role],
            ["Status", "Active ●"],
          ].map(([k, v]) => (
            <div key={k} style={styles.profileRow}>
              <span style={styles.profileKey}>{k}</span>
              <span style={styles.profileVal}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoursesTab() {
  const courses = [
    { name: "Web Technologies", code: "CSM401", credits: 4, grade: "A+" },
    { name: "Machine Learning", code: "CSM402", credits: 3, grade: "A" },
    { name: "Cloud Computing", code: "CSM403", credits: 3, grade: "B+" },
    { name: "Data Structures", code: "CSM301", credits: 4, grade: "A+" },
    { name: "DBMS", code: "CSM302", credits: 3, grade: "A" },
    { name: "Operating Systems", code: "CSM303", credits: 4, grade: "B+" },
  ];
  return (
    <div style={styles.infoCard}>
      <h4 style={styles.cardTitle}>📚 Enrolled Courses</h4>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHead}>
            <th style={styles.th}>Course Name</th>
            <th style={styles.th}>Code</th>
            <th style={styles.th}>Credits</th>
            <th style={styles.th}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <tr key={c.code} style={{background: i % 2 === 0 ? "#f0f9ff" : "#fff"}}>
              <td style={styles.td}>{c.name}</td>
              <td style={styles.td}><code style={styles.code}>{c.code}</code></td>
              <td style={styles.td}>{c.credits}</td>
              <td style={styles.td}><span style={styles.gradePill}>{c.grade}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminTab() {
  const users = [
    { id: 1, name: "Admin User", role: "Admin", status: "Active" },
    { id: 2, name: "Veldi Sai Krishna", role: "Student", status: "Active" },
    { id: 3, name: "Student B", role: "Student", status: "Inactive" },
  ];
  return (
    <div style={styles.infoCard}>
      <h4 style={styles.cardTitle}>🛡️ Admin Panel — User Management</h4>
      <div style={styles.adminBanner}>
        🔐 This page is only visible to users with <strong>Admin</strong> role. Access denied for Students.
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHead}>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} style={{background: i % 2 === 0 ? "#fef3c7" : "#fff"}}>
              <td style={styles.td}>{u.id}</td>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>
                <span style={{...styles.rolePill, background: u.role === "Admin" ? "#fbbf24" : "#34d399"}}>
                  {u.role}
                </span>
              </td>
              <td style={styles.td}>
                <span style={{color: u.status === "Active" ? "#10b981" : "#ef4444"}}>
                  ● {u.status}
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.smallBtn}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsTab() {
  const { user } = useAuth();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);
  return (
    <div style={styles.infoCard}>
      <h4 style={styles.cardTitle}>⚙️ Settings</h4>
      {[
        { label: "Email Notifications", desc: "Receive alerts and announcements", val: notif, set: setNotif },
        { label: "Dark Mode", desc: "Toggle dark theme (coming soon)", val: dark, set: setDark },
      ].map(s => (
        <div key={s.label} style={styles.settingRow}>
          <div>
            <div style={styles.settingLabel}>{s.label}</div>
            <div style={styles.settingDesc}>{s.desc}</div>
          </div>
          <button
            style={{...styles.toggle, background: s.val ? "#0ea5e9" : "#d1d5db"}}
            onClick={() => s.set(!s.val)}
          >
            <div style={{...styles.toggleKnob, transform: s.val ? "translateX(20px)" : "translateX(2px)"}} />
          </button>
        </div>
      ))}
      <div style={{marginTop: 16, padding: "12px 16px", background: "#f0fdf4", borderRadius: 8, fontSize: 13, color: "#15803d"}}>
        ✅ Logged in as <strong>{user.username}</strong> ({user.role}) · Session Active
      </div>
    </div>
  );
}

function Forbidden() {
  const { setPage } = useRouterContext();
  return (
    <div style={styles.page}>
      <div style={{textAlign: "center", padding: 40}}>
        <div style={{fontSize: 64}}>🚫</div>
        <h2 style={{color: "#ef4444"}}>403 — Access Forbidden</h2>
        <p style={{color: "#6b7280"}}>You don't have permission to view this page.</p>
        <button style={styles.loginBtn} onClick={() => setPage("dashboard")}>
          Go Back
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

function AppRouter() {
  const { user } = useAuth();
  const [page, setPage] = useState(user ? "dashboard" : "login");

  return (
    <RouterContext.Provider value={{ page, setPage }}>
      <div style={styles.root}>
        <Route path="login" element={<LoginPage />} />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
      </div>
    </RouterContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: { fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#f0f9ff" },
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 60%, #38bdf8 100%)" },
  loginCard: { background: "#fff", borderRadius: 20, width: 400, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden" },
  loginHeader: { background: "linear-gradient(135deg, #0c4a6e, #0ea5e9)", padding: "32px 32px 24px", textAlign: "center" },
  logoBox: { display: "flex", justifyContent: "center", marginBottom: 12 },
  loginTitle: { margin: 0, fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: 1 },
  loginSubtitle: { margin: "4px 0 10px", color: "#bae6fd", fontSize: 13 },
  badge: { display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#e0f2fe", fontSize: 11, padding: "4px 12px", borderRadius: 20, backdropFilter: "blur(4px)" },
  form: { padding: 28 },
  fieldGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" },
  inputIcon: { padding: "0 12px", fontSize: 16, background: "#f8fafc" },
  input: { flex: 1, border: "none", outline: "none", padding: "11px 12px", fontSize: 14, color: "#1e293b", background: "transparent" },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: "0 12px", fontSize: 16 },
  errorBox: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 },
  loginBtn: { width: "100%", padding: "13px", background: "linear-gradient(90deg, #0284c7, #0ea5e9)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 },
  spinner: { display: "inline-block", animation: "spin 1s linear infinite" },
  hintBox: { marginTop: 16, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#0369a1", lineHeight: 1.6 },

  dashLayout: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 240, background: "#0c4a6e", display: "flex", flexDirection: "column", padding: "0 0 20px" },
  sideHeader: { padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  sideLogoWrap: { display: "flex", alignItems: "center", gap: 10 },
  sideLogo: { width: 36, height: 36, background: "#0ea5e9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 },
  sideLogoText: { color: "#fff", fontWeight: 700, fontSize: 15 },
  sideLogoSub: { color: "#7dd3fc", fontSize: 11 },
  userCard: { margin: 12, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: "50%", background: "#0ea5e9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 },
  userName: { color: "#fff", fontWeight: 600, fontSize: 14 },
  userRole: { marginTop: 2 },
  rolePill: { fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, color: "#fff" },
  nav: { flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2 },
  navItem: { width: "100%", padding: "10px 14px", background: "none", border: "none", borderRadius: 8, color: "#7dd3fc", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", gap: 10, alignItems: "center", transition: "all 0.15s" },
  navItemActive: { background: "#0ea5e9", color: "#fff", fontWeight: 600 },
  logoutBtn: { margin: "0 10px", padding: "10px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#fca5a5", fontSize: 13, cursor: "pointer" },

  main: { flex: 1, display: "flex", flexDirection: "column", background: "#f0f9ff" },
  topbar: { background: "#fff", padding: "14px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#0c4a6e" },
  topbarRight: { display: "flex", gap: 12, alignItems: "center" },
  onlineBadge: { color: "#10b981", fontSize: 12, fontWeight: 600 },
  topbarUser: { color: "#64748b", fontSize: 13 },
  content: { flex: 1, padding: "24px 28px", overflowY: "auto" },

  welcomeBanner: { background: "linear-gradient(90deg, #0c4a6e, #0ea5e9)", borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  welcomeDecor: { fontSize: 40 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 12, padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 800, color: "#0c4a6e" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 2 },

  infoCard: { background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  cardTitle: { margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0c4a6e", borderBottom: "2px solid #e0f2fe", paddingBottom: 10 },
  featureList: { listStyle: "none", padding: 0, margin: 0 },
  featureItem: { padding: "7px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#334155", display: "flex", gap: 8 },

  profileGrid: { display: "flex", gap: 24, alignItems: "flex-start" },
  profileAvatarBig: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #0c4a6e, #0ea5e9)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, flexShrink: 0 },
  profileDetails: { flex: 1 },
  profileRow: { display: "flex", padding: "8px 0", borderBottom: "1px solid #f1f5f9", gap: 12 },
  profileKey: { width: 130, fontSize: 13, color: "#64748b", fontWeight: 500 },
  profileVal: { fontSize: 13, color: "#1e293b", fontWeight: 600 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  tableHead: { background: "#0c4a6e" },
  th: { padding: "10px 14px", color: "#fff", textAlign: "left", fontSize: 12, fontWeight: 600, letterSpacing: 0.3 },
  td: { padding: "10px 14px", color: "#334155", borderBottom: "1px solid #f1f5f9" },
  code: { background: "#f0f9ff", color: "#0284c7", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 12 },
  gradePill: { background: "#dcfce7", color: "#15803d", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },

  adminBanner: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#92400e", marginBottom: 16 },
  smallBtn: { padding: "4px 12px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 },

  settingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f1f5f9" },
  settingLabel: { fontSize: 14, fontWeight: 600, color: "#1e293b" },
  settingDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 },
  toggleKnob: { width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, transition: "transform 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
};