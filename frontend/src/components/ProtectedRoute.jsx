import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const getSuperAdminEmail = () =>
  normalizeEmail(import.meta.env.VITE_SUPERADMIN_EMAIL);

export function ProtectedRoute({
  children,
  requiredRole = "admin",
  requiredSuperAdminOnly = false,
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setRole(null);
          setLoading(false);
          navigate("/login");
          return;
        }

        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const superAdminEmail = getSuperAdminEmail();
        const userEmail = normalizeEmail(firebaseUser.email);

        // Determine the effective role
        let effectiveRole = tokenResult.claims.role || "user";
        if (superAdminEmail && userEmail === superAdminEmail) {
          effectiveRole = "superadmin";
        }

        setUser(firebaseUser);
        setRole(effectiveRole);
        setLoading(false);

        // Check authorization
        if (requiredSuperAdminOnly && effectiveRole !== "superadmin") {
          navigate("/");
          return;
        }

        if (
          requiredRole === "admin" &&
          effectiveRole !== "admin" &&
          effectiveRole !== "superadmin"
        ) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
        setRole(null);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, requiredRole, requiredSuperAdminOnly]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="alert-box alert-info">Loading...</div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  if (requiredSuperAdminOnly && role !== "superadmin") {
    return null;
  }

  if (requiredRole === "admin" && role !== "admin" && role !== "superadmin") {
    return null;
  }

  return children;
}

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const superAdminEmail = getSuperAdminEmail();
        const userEmail = normalizeEmail(firebaseUser.email);

        let effectiveRole = tokenResult.claims.role || "user";
        if (superAdminEmail && userEmail === superAdminEmail) {
          effectiveRole = "superadmin";
        }

        setUser(firebaseUser);
        setRole(effectiveRole);
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, role, loading };
}
