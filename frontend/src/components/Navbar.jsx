import { Link, useLocation } from "react-router-dom";
import { clearAdminToken } from "../lib/auth";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header>
      <div>
        <Link className="brand-link" to="/" aria-label="Sargam Sarees home">
          <span className="site-logo-frame">
            <img className="site-logo" src="/shop_logo.jpeg" alt="Sargam Sarees" />
          </span>
        </Link>

        <nav>
          <Link className={!isAdmin ? "active" : ""} to="/">
            Home
          </Link>
          <Link className={isAdmin ? "active" : ""} to="/admin/login">
            Admin
          </Link>
          {!isAdmin ? <CartDrawer /> : null}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                clearAdminToken();
                window.location.href = "/admin/login";
              }}
              className="logout-button"
            >
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

