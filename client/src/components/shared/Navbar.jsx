import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const links = [
    user?.role === "citizen" && { to: "/submit", label: "Submit complaint" },
    user?.role === "citizen" && { to: "/my-complaints", label: "My complaints" },
    user?.role === "admin" && { to: "/admin", label: "Admin dashboard" },
    user?.role === "worker" && { to: "/worker", label: "My tasks" },
  ].filter(Boolean);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link to="/" className="mr-2 flex items-center gap-2 text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            ♻️
          </span>
          <span className="hidden font-semibold sm:inline">Smart Waste</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-400">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Register
              </Link>
            </>
          )}
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {menuOpen && links.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass} onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
