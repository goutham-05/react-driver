import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTour } from "@oqlet/react-driver";

type Panel = "profile" | "notifications" | "security" | "billing" | null;

// ── Profile menu ──────────────────────────────────────────────────────────────
// Rendered via portal at document.body so driver.js can highlight it without
// any ancestor stacking context blocking the overlay cutout.

function ProfileDropdown({
  open,
  onSelect,
  anchorRef,
}: {
  open: boolean;
  onSelect: (panel: Panel) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [pos, setPos] = useState({ top: 60, right: 20 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      className="profile-dropdown"
      id="profile-dropdown"
      // zIndex 10001 — driver.js overlay is at 10000, so any portal that needs
      // to be highlighted or clicked during a tour must sit above it.
      style={{ position: "fixed", top: pos.top, right: pos.right, left: "auto", zIndex: 10001 }}
    >
      <div className="dropdown-header">
        <div className="avatar-lg">GP</div>
        <div>
          <div className="dropdown-name">Goutham P.</div>
          <div className="dropdown-email">goutham@example.com</div>
        </div>
      </div>
      <div className="dropdown-divider" />
      <button className="dropdown-item" id="menu-edit-profile"    onClick={() => onSelect("profile")}>
        <span className="menu-icon">👤</span> Edit profile
      </button>
      <button className="dropdown-item" id="menu-notifications"   onClick={() => onSelect("notifications")}>
        <span className="menu-icon">🔔</span> Notifications
      </button>
      <button className="dropdown-item" id="menu-security"        onClick={() => onSelect("security")}>
        <span className="menu-icon">🔒</span> Security &amp; privacy
      </button>
      <button className="dropdown-item" id="menu-billing"         onClick={() => onSelect("billing")}>
        <span className="menu-icon">💳</span> Billing
      </button>
      <div className="dropdown-divider" />
      <button className="dropdown-item danger" id="menu-logout">
        <span className="menu-icon">🚪</span> Sign out
      </button>
    </div>,
    document.body
  );
}

// ── Panel content ─────────────────────────────────────────────────────────────

function PanelContent({ panel }: { panel: Panel }) {
  if (!panel) return null;
  const panels: Record<NonNullable<Panel>, React.ReactNode> = {
    profile: (
      <div className="settings-panel" id="panel-profile">
        <h3 className="section-title">Edit profile</h3>
        <div className="form-row">
          <input className="form-input" defaultValue="Goutham" placeholder="First name" />
          <input className="form-input" defaultValue="Posannapeta" placeholder="Last name" />
        </div>
        <input className="form-input full" defaultValue="goutham@example.com" placeholder="Email" />
        <textarea className="form-input full" rows={3} placeholder="Bio — tell us about yourself…" />
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Save changes</button>
      </div>
    ),
    notifications: (
      <div className="settings-panel" id="panel-notifications">
        <h3 className="section-title">Notification preferences</h3>
        {[
          { id: "n1", label: "Product updates & new features", checked: true },
          { id: "n2", label: "Security alerts",                checked: true },
          { id: "n3", label: "Weekly digest",                  checked: false },
          { id: "n4", label: "Marketing emails",               checked: false },
        ].map((n) => (
          <label key={n.id} className="toggle-row">
            <span>{n.label}</span>
            <input type="checkbox" defaultChecked={n.checked} className="toggle-check" />
          </label>
        ))}
      </div>
    ),
    security: (
      <div className="settings-panel" id="panel-security">
        <h3 className="section-title">Security &amp; privacy</h3>
        <div className="security-row">
          <div>
            <div className="security-label">Password</div>
            <div className="security-sub">Last changed 30 days ago</div>
          </div>
          <button className="btn btn-secondary btn-sm">Change</button>
        </div>
        <div className="security-row">
          <div>
            <div className="security-label">Two-factor authentication</div>
            <div className="security-sub">Add an extra layer of security</div>
          </div>
          <button className="btn btn-primary btn-sm">Enable</button>
        </div>
        <div className="security-row">
          <div>
            <div className="security-label">Active sessions</div>
            <div className="security-sub">1 device currently signed in</div>
          </div>
          <button className="btn btn-secondary btn-sm">View</button>
        </div>
      </div>
    ),
    billing: (
      <div className="settings-panel" id="panel-billing">
        <h3 className="section-title">Billing</h3>
        <div className="plan-card">
          <div className="plan-name">Pro plan <span className="badge badge-blue">Active</span></div>
          <div className="plan-price">$12 / month</div>
          <div className="plan-renews">Renews on Jul 1, 2026</div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>Manage subscription</button>
      </div>
    ),
  };
  return panels[panel];
}

// ── Auth Tour Page ────────────────────────────────────────────────────────────

export default function AuthTourPage() {
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [activePanel,  setActivePanel]  = useState<Panel>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const openPanel = (panel: Panel) => {
    setMenuOpen(false);
    setActivePanel(panel);
  };

  const reset = () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
    setActivePanel(null);
  };

  const { start, isActive } = useTour({
    steps: [
      // ── Pre-auth ────────────────────────────────────────────────────────────
      {
        title: "Welcome! 👋",
        content: "Let's walk through signing up and exploring your new account. This tour takes about 1 minute.",
      },
      {
        target: "#auth-email",
        title: "Your email address",
        content: "Enter the email you'd like to register with. We'll never share it.",
        side: "bottom",
      },
      {
        target: "#auth-password",
        title: "Create a password",
        content: "Choose a strong password — at least 8 characters.",
        side: "bottom",
      },
      {
        target: "#auth-submit",
        title: "Create your account",
        content: "Hit the button and we'll get your account ready instantly.",
        side: "bottom",
        // Simulate signup — flip to logged-in state and wait for the
        // authenticated header to mount before moving to the next step.
        beforeNext: () => setIsLoggedIn(true),
      },

      // ── Post-auth ────────────────────────────────────────────────────────────
      // Each step owns its own departure cleanup via afterNext / afterPrev.
      // The library fires these only after driver.js's full animation completes
      // (inside onHighlighted on the destination), so it's always safe to
      // unmount the previous step's element there.

      // Step 5 — avatar
      {
        target: "#user-avatar",
        title: "You're in! 🎉",
        content: "Your account is ready. Hit Next and we'll open your profile menu.",
        side: "bottom",
        beforeNext: () => setMenuOpen(true),
      },

      // Step 6 — Edit profile item
      {
        target: "#menu-edit-profile",
        title: "Edit profile",
        content: "Keep your name, photo, and bio up to date. Click it or press Next to continue.",
        side: "right",
        advanceOn: "#menu-edit-profile",
        beforeNext: () => setActivePanel("profile"),
        afterNext:  () => setMenuOpen(false),
        afterPrev:  () => setMenuOpen(false),
      },

      // Step 7 — profile panel
      {
        target: "#panel-profile",
        title: "Profile settings",
        content: "All your personal details in one place. Changes save automatically.",
        side: "top",
        beforeNext: () => setMenuOpen(true),
        afterNext:  () => setActivePanel(null), // panel closes once notifications item (step 8) is shown
        beforePrev: () => setMenuOpen(true),
        afterPrev:  () => setActivePanel(null), // panel closes once edit profile item (step 6) is shown
      },

      // Step 8 — Notifications item
      {
        target: "#menu-notifications",
        title: "Notifications",
        content: "Control which alerts you receive. Click it or press Next to continue.",
        side: "right",
        advanceOn: "#menu-notifications",
        beforeNext: () => setActivePanel("notifications"),
        afterNext:  () => setMenuOpen(false),   // dropdown closes once panel (step 9) is shown
        beforePrev: () => setActivePanel("profile"),
        afterPrev:  () => setMenuOpen(false),   // dropdown closes once profile panel (step 7) is shown
      },

      // Step 9 — notifications panel
      {
        target: "#panel-notifications",
        title: "Notification preferences",
        content: "Toggle each category on or off. Security alerts are always on.",
        side: "top",
        beforePrev: () => setMenuOpen(true),
        afterPrev:  () => setActivePanel(null), // panel closes once notifications item (step 8) is shown
      },

      // Step 10 — all done (floating)
      {
        title: "All done! 🚀",
        content: "You've seen the key parts of your account. Explore at your own pace — everything is just a click away.",
        beforePrev: () => setActivePanel("notifications"),
      },
    ],
    waitForTarget: 3000,
    showProgress: true,
    onStart: reset,
    onFinish: () => { setMenuOpen(false); setActivePanel(null); },
    onSkip:   () => { setMenuOpen(false); setActivePanel(null); },
  });

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Auth &amp; Profile Tour</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {!isActive && (
            <button className="btn btn-primary" onClick={() => start()}>
              ▶ Start tour
            </button>
          )}
          {isLoggedIn && (
            <button className="btn btn-secondary btn-sm" onClick={reset}>
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Auth form (pre-login) ─────────────────────────────────────────── */}
      {!isLoggedIn && (
        <div className="auth-layout">
          <div className="auth-card" id="auth-form">
            <div className="auth-logo">⬡</div>
            <h3 className="auth-title">Create your account</h3>
            <p className="auth-sub">Start your free 14-day trial. No card required.</p>

            <div className="field-group">
              <label className="field-label">Email address</label>
              <input
                id="auth-email"
                className="form-input full"
                type="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                id="auth-password"
                className="form-input full"
                type="password"
                placeholder="8+ characters"
              />
            </div>

            <button
              id="auth-submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setIsLoggedIn(true)}
            >
              Create account →
            </button>

            <p className="auth-footer">
              Already have an account? <a href="#">Sign in</a>
            </p>
          </div>

          <div className="auth-features">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>What you get</h3>
            {[
              { icon: "⚡", title: "Instant setup",          sub: "Up and running in seconds" },
              { icon: "🔒", title: "Enterprise security",    sub: "SOC 2 Type II certified" },
              { icon: "📊", title: "Real-time analytics",    sub: "Insights at a glance" },
              { icon: "🤝", title: "Team collaboration",     sub: "Invite unlimited members" },
            ].map((f) => (
              <div key={f.title} className="feature-row">
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Authenticated view ───────────────────────────────────────────── */}
      {isLoggedIn && (
        <div className="auth-app">
          {/* App header */}
          <div className="app-header">
            <div className="app-nav">
              <span className="app-nav-item active">Dashboard</span>
              <span className="app-nav-item">Projects</span>
              <span className="app-nav-item">Team</span>
              <span className="app-nav-item">Reports</span>
            </div>
            <div className="app-header-right">
              <span className="notif-bell">🔔</span>
              <div className="avatar-wrapper">
                <button
                  id="user-avatar"
                  ref={avatarRef}
                  className="avatar-btn"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  GP
                </button>
                <ProfileDropdown open={menuOpen} onSelect={openPanel} anchorRef={avatarRef} />
              </div>
            </div>
          </div>

          {/* Dashboard body */}
          <div className="app-body">
            <div className="welcome-banner">
              <div>
                <div className="welcome-title">Welcome back, Goutham 👋</div>
                <div className="welcome-sub">Here's what's happening with your projects today.</div>
              </div>
            </div>

            <div className="dash-stats">
              {[
                { label: "Projects",  value: "12",    icon: "📁" },
                { label: "Tasks",     value: "48",    icon: "✅" },
                { label: "Team",      value: "6",     icon: "👥" },
                { label: "Uptime",    value: "99.9%", icon: "📈" },
              ].map((s) => (
                <div key={s.label} className="dash-stat">
                  <span className="dash-stat-icon">{s.icon}</span>
                  <div className="dash-stat-val">{s.value}</div>
                  <div className="dash-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Panel area */}
            {activePanel && (
              <div className="panel-area">
                <PanelContent panel={activePanel} />
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => setActivePanel(null)}
                >
                  ← Back to dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
