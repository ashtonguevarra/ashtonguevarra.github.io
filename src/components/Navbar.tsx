import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const sectionId = href.slice(2);
      // If we're on the home page, scroll to section
      if (location.pathname === "/") {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      // Otherwise navigate to home with hash
    }
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
      role="banner"
    >
      <nav
        className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16"
        aria-label="Primary navigation"
      >
        <Link
          to="/"
          className="font-heading text-xl font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          Ashton Guevarra
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              {link.href.startsWith("/#") ? (
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="text-sm font-medium text-secondary hover:text-foreground transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-secondary hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-250 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-background shadow-xl z-50 transition-transform duration-250 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <span className="font-heading text-lg font-semibold">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-foreground cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="flex flex-col gap-1 p-4" role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              {link.href.startsWith("/#") ? (
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="block px-4 py-3 text-base font-medium text-secondary hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors cursor-pointer ${
                    location.pathname === link.href
                      ? "text-foreground bg-muted"
                      : "text-secondary hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
}