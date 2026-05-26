import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole("");
        setAuthReady(true);
        navigate("/login");
        return;
      }

      const tokenResult = await user.getIdTokenResult(true);
      const bootstrapSuperAdminEmail = (
        import.meta.env.VITE_SUPERADMIN_EMAIL || ""
      )
        .trim()
        .toLowerCase();
      const userEmail = (user.email || "").trim().toLowerCase();
      const nextRole =
        tokenResult.claims.role ||
        (bootstrapSuperAdminEmail && userEmail === bootstrapSuperAdminEmail
          ? "superadmin"
          : "user");

      setRole(nextRole);
      setAuthReady(true);

      if (nextRole !== "admin" && nextRole !== "superadmin") {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!authReady) {
    return (
      <div className="app-page">
        <div className="page-shell alert-box alert-info">
          Loading admin area...
        </div>
      </div>
    );
  }

  const isSuperAdmin = role === "superadmin";

  return (
    <div className="app-page">
      <div className="page-shell">
        <div className="surface-card p-6 sm:p-8">
          <p className="section-subtitle text-sm uppercase tracking-[0.2em]">
            Admin Console
          </p>
          <h1 className="section-title mt-2 text-3xl font-bold">
            Welcome, {isSuperAdmin ? "Super Admin" : "Admin"}
          </h1>
          <p className="section-subtitle mt-2 max-w-2xl">
            Use this area to manage products and, if you are the super admin,
            manage other admin accounts.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link
              to="/admin/products"
              className="soft-panel p-5 transition hover:-translate-y-0.5"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                Product Management
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Add, edit, and delete products.
              </p>
            </Link>

            {isSuperAdmin ? (
              <Link
                to="/admin/users"
                className="soft-panel p-5 transition hover:-translate-y-0.5"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  Admin Management
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Promote users to admin or remove admin access.
                </p>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
