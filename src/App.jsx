
import React,  { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
function BackButton({ to = "/", label = "BACK" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="back-button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(to);
        }
      }}
    >
      ← {label}
    </button>
  );
}
import {
  ArrowRight, BookOpen, CalendarDays, CarFront, Check, ChevronDown,
  Film, Globe2, LogIn, LogOut, Menu, Phone, Plane, ShieldCheck,
  Users, UserRound, X
} from "lucide-react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db, firebaseConfigured } from "./firebase";
import { EVENTS, UNITS, formatDate, getEvent } from "./data";

const SHARED_PASSCODE = "NOSgathering";

function PasscodeGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("gatheringPlaceUnlocked") === "yes"
  );
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (passcode === SHARED_PASSCODE) {
      sessionStorage.setItem("gatheringPlaceUnlocked", "yes");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect passcode. Please try again.");
      setPasscode("");
    }
  }

  if (unlocked) {
    return children;
  }

  return (
    <div className="passcode-page">
      <form className="passcode-card" onSubmit={handleSubmit}>
        <img
          className="check-logo"
          src="/assets/logo.jpg"
          alt="Gathering Place"
        />

        <h1>Welcome</h1>
        <p>Enter the passcode to continue.</p>

        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter passcode"
          autoComplete="current-password"
          required
        />

        {error && <p className="passcode-error">{error}</p>}

        <button type="submit" className="primary-btn">
          ENTER
        </button>
      </form>
    </div>
  );
}

const iconMap = {
  car: CarFront,
  film: Film,
  book: BookOpen,
  plane: Plane,
  globe: Globe2,
  users: Users,
};

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <Link className="brand" to="/" onClick={() => setOpen(false)}>
        <img src="/assets/logo.jpg" alt="" />
      </Link>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <X size={22}/> : <Menu size={22}/>}
      </button>
      <nav className={`nav ${open ? "nav-open" : ""}`}>
        <Link className="nav-active" to="/" onClick={() => setOpen(false)}>CHECK IN</Link>
        <Link to="/admin" onClick={() => setOpen(false)}>ADMIN</Link>
      </nav>
    </header>
  );
}

function EventCard({ event }) {
  const Icon = iconMap[event.icon] || Users;
  return (
    <article className="event-card">
      <div className="event-image-wrap">
        <img className="event-image" src={event.image} alt="" />
        <span className="event-badge">{event.badge}</span>
      </div>
      <div className="event-body">
        <div className="icon-box"><Icon size={31} strokeWidth={1.8}/></div>
        <h2>{event.title}</h2>
        <div className="event-subtitle">{event.subtitle}</div>
        <p>{event.description}</p>
        <Link className="check-link" to={`/check-in/${event.id}`}>
          CHECK IN NOW <ArrowRight size={24}/>
        </Link>
      </div>
    </article>
  );
}

function Home() {
  return (
    <>
      <Header />
      <main className="home">
        <section className="hero-grid">
          <div className="stake-pill"><span></span>OBANTOKO ABEOKUTA NIGERIA STAKE</div>
          <h1>The Gathering<br/>Place</h1>
          <p className="hero-copy">
            A dedicated space for strengthening faith, fostering unity, and developing
            self-reliance among Young Single Adults.
          </p>
        </section>

        <section className="events">
          {EVENTS.map(event => <EventCard event={event} key={event.id} />)}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand"><img src="/assets/logo.jpg" alt=""/><b>Gathering Place</b></div>
        <p>Facilitating connection and community through faith and modern technology.</p>
        <div className="footer-links"><span>PRIVACY</span><span>SAFETY</span><span>SUPPORT</span></div>
        <small>© 2026 OBANTOKO ABEOKUTA NIGERIA <i></i><i></i> STAKE</small>
      </footer>
    </>
  );
}

function CheckIn() {
  const { eventId } = useParams();
  const event = getEvent(eventId);
  const navigate = useNavigate();
  const [unit, setUnit] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
  () => String(event.date ?? "").slice(0, 10)
);
  const [skills,setSkills]=useState([]);
  const isSkillsEvent = event.title
  .toLowerCase ()
  .includes ("skills acquisition");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const ready = unit && name.trim().length > 2 && phone.trim().length >= 7 && (!isSkillsEvent || skills.length >0);

async function submit(e) {
  e.preventDefault();

  if (!ready || loading) return;

  setError("");
  setLoading(true);

  const attendanceData = {
    eventId: event.id,
    eventTitle: event.title,
    date: attendanceDate,
    unit,
    fullName: name.trim(),
    phone: phone.trim(),
    skills: isSkillsEvent ? skills : [],
  };

  try {
    if (!firebaseConfigured) {
      const demo = JSON.parse(
        localStorage.getItem("demoAttendance") || "[]"
      );

      demo.push({
        ...attendanceData,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "demoAttendance",
        JSON.stringify(demo)
      );
    } else {
      await addDoc(collection(db, "attendance"), {
        ...attendanceData,
        createdAt: serverTimestamp(),
      });
    }

    setDone(true);
  } catch (err) {
    console.error(err);
    setError("We could not save your attendance. Please try again.");
  } finally {
    setLoading(false);
  }
}



  
  if (done) {
    return (
      <div className="check-page">
        <div className="success-card">
          <div className="success-icon"><Check size={48}/></div>
          <h1>Attendance Confirmed</h1>
          <p>Thank you, <b>{name}</b>. Your attendance for <b>{event.title}</b> has been recorded.</p>
          <button className="primary-btn" onClick={() => navigate("/")}>BACK TO GATHERING PLACE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="check-page">
     <BackButton to="/" label="BACK TO EVENTS" /> 
      <div className="check-card">
        <img className="check-logo" src="/assets/logo.jpg" alt="Gathering Place"/>
        <h1>{event.title}</h1>
        <div className="check-date">{formatDate(event.date).toUpperCase()}</div>
        <div className="progress-line"></div>

        <form onSubmit={submit}>
          
<label>DATE</label>

<div className="field">
  <CalendarDays size={20} />

  <input
    type="date"
    value={attendanceDate}
    onChange={(e) => {
      setAttendanceDate(e.target.value);
    }}
    required
  />
</div>

          <label>WARD / BRANCH</label>
          <div className="select-wrap">
            <UserRound/>
            <select value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="">Select your unit...</option>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
            <ChevronDown/>
          </div>

          <label>FULL NAME</label>
          <div className={`field ${!unit ? "disabled" : ""}`}>
            <UserRound/>
            <input disabled={!unit} value={name} onChange={e => setName(e.target.value)} placeholder={unit ? "Enter your full name" : "Select unit first"} />
          </div>

          <label>PHONE NUMBER</label>
          <div className={`field ${!unit ? "disabled" : ""}`}>
            <Phone/>
            <input disabled={!unit} value={phone} onChange={e => setPhone(e.target.value)} placeholder="080..." inputMode="tel" />
          </div>
          {isSkillsEvent && (
  <div className="skills-section">
    <label>SELECT YOUR SKILL</label>

    {[
      "Barbing",
      "ICT / Computer Training",
      "Catering",
      "Fashion Design",
      "Makeup",
      "Shoe Making",
      "Other",
    ].map((skill) => (
      <label key={skill} className="skill-option">
        <input
          type="checkbox"
          checked={skills.includes(skill)}
          onChange={(e) => {
            setSkills((previous) =>
              e.target.checked
                ? [...previous, skill]
                : previous.filter((item) => item !== skill)
            );
          }}
        />
        <span>{skill}</span>
      </label>
    ))}
  </div>
)}

          {error && <div className="form-error">{error}</div>}
          <button disabled={!ready || loading} className="confirm-btn">
            {loading ? "SAVING..." : "CONFIRM ATTENDANCE"} <span><Check size={21}/></span>
          </button>
        </form>
      </div>
    </div>
  );
}

function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  async function login(e) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Invalid admin login.");
    }
  }

  async function loadRows() {
    if (!db || !user) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "attendance"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      setRows(snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
    } catch (err) {
      console.error(err);
      setError("Could not load attendance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadRows();
  }, [user]);

  // Get available wards and skills from saved records
  const units = [...new Set(
    rows.map(r => r.unit).filter(Boolean)
  )].sort();

  const skillsList = [...new Set(
    rows.flatMap(r => Array.isArray(r.skills) ? r.skills : [])
  )].sort();

  // Apply both filters
  const filteredRows = rows.filter(r => {
    const matchesUnit =
      selectedUnit === "all" || r.unit === selectedUnit;

    const matchesSkill =
      selectedSkill === "all" ||
      (Array.isArray(r.skills) && r.skills.includes(selectedSkill));

    return matchesUnit && matchesSkill;
  });

  // Export only filtered records
  function exportCsv() {
    const header = [
      "Event",
      "Date",
      "Unit",
      "Full Name",
      "Phone",
      "Skills"
    ];

    const lines = filteredRows.map(r => [
      r.eventTitle,
      r.date,
      r.unit,
      r.fullName,
      r.phone,
      Array.isArray(r.skills) ? r.skills.join("; ") : ""
    ].map(v =>
      `"${String(v ?? "").replaceAll('"', '""')}"`
    ).join(","));

    const blob = new Blob(
      [[header.join(","), ...lines].join("\n")],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "filtered-attendance.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  if (!firebaseConfigured) {
    return (
      <div className="admin-page">
        <BackButton to="/" label="BACK TO HOME" />
        <div className="admin-card">
          <ShieldCheck size={45} />
          <h1>Admin Dashboard</h1>
          <p>Firebase is not configured yet.</p>
          <Link className="primary-btn inline" to="/">
            BACK TO CHECK IN
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-page">
        <form className="admin-card login-card" onSubmit={login}>
          <ShieldCheck size={45} />
          <h1>Admin Login</h1>
          <p>Sign in to view attendance records.</p>

          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Admin email"
            type="email"
            required
          />

          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
          />

          {error && <div className="form-error">{error}</div>}

          <button className="primary-btn">
            <LogIn size={18} /> SIGN IN
          </button>

          <Link to="/" className="back-link">
            ← Back to check in
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">

        <div className="admin-head">
          <div>
            <div className="admin-kicker">
              OBANTOKO ABEOKUTA NIGERIA STAKE
            </div>
            <h1>Attendance Dashboard</h1>
          </div>

          <div className="admin-actions">
            <button onClick={exportCsv} className="secondary-btn">
              EXPORT CSV
            </button>

            <button
              onClick={() => signOut(auth)}
              className="secondary-btn"
            >
              <LogOut size={17} /> LOG OUT
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats">
          <div>
            <b>{filteredRows.length}</b>
            <span>Matching check-ins</span>
          </div>
          <div>
            <b>{rows.length}</b>
            <span>Total check-ins</span>
          </div>
        </div>

        {/* Attendance filters */}
        <div className="attendance-filters">
          <div className="filter-heading">
            <h2>Filter Attendance</h2>

            <button
              type="button"
              className="reset-filters"
              onClick={() => {
                setSelectedUnit("all");
                setSelectedSkill("all");
              }}
            >
              RESET FILTERS
            </button>
          </div>

          <div className="filter-grid">
            <div>
              <label>WARD / BRANCH</label>
              <select
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
              >
                <option value="all">All Wards</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>SKILL</label>
              <select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
              >
                <option value="all">All Skills</option>
                {skillsList.map(skill => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="filter-result">
            Showing {filteredRows.length} of {rows.length} attendance records
          </p>
        </div>

        {/* Attendance table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Unit</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Skills</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map(r => (
                <tr key={r.id}>
                  <td>{r.eventTitle}</td>
                  <td>{r.date}</td>
                  <td>{r.unit}</td>
                  <td>{r.fullName}</td>
                  <td>{r.phone}</td>
                  <td>
                    {Array.isArray(r.skills) && r.skills.length
                      ? r.skills.join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredRows.length === 0 && (
            <div className="empty">
              No attendance records match these filters.
            </div>
          )}

          {loading && (
            <div className="empty">Loading…</div>
          )}
        </div>

      </div>
    </div>
  );
}
export default function App() {
  //console.log("firebase connected:", db);
  return (
  
  <PasscodeGate>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/check-in/:eventId" element={<CheckIn />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
  </PasscodeGate>
);
  
}
