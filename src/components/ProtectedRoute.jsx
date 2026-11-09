import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API}/me`, {
          credentials: "include",
        });

        if (res.ok) {
          // /me returns the logged-in user's JWT payload ({username, role}).
          // Re-sync it into localStorage so the sidebar (Layout.jsx) always has
          // the role, even if this browser/origin never went through the login
          // form (new deployment, cleared storage, different frontend URL).
          try {
            const me = await res.json();
            if (me?.role) localStorage.setItem("role", me.role);
            if (me?.username) localStorage.setItem("username", me.username);
          } catch {
            /* ignore — auth itself still succeeded */
          }
        }

        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" />;

  return <>{children}</>;
}