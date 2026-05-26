import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import api from "../api/axios";
import { auth } from "../firebase";

export default function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId("");
        setRole("");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        setCartCount(0);
        return;
      }

      const tokenResult = await user.getIdTokenResult(true);
      const nextRole = tokenResult.claims.role || "user";
      const bootstrapSuperAdminEmail = (
        import.meta.env.VITE_SUPERADMIN_EMAIL || ""
      )
        .trim()
        .toLowerCase();
      const userEmail = (user.email || "").trim().toLowerCase();
      const effectiveRole =
        userEmail &&
        bootstrapSuperAdminEmail &&
        userEmail === bootstrapSuperAdminEmail
          ? "superadmin"
          : nextRole;

      setUserId(user.uid);
      setRole(effectiveRole);
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("role", effectiveRole);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      if (!userId) return setCartCount(0);

      const res = await api.get(`/cart/${userId}`);
      const total = (res.data?.items ?? []).reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      setCartCount(total);
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, [userId]);

  const logout = () => {
    localStorage.clear();
    setCartCount(0);
    signOut(auth).finally(() => navigate("/login"));
  };

  return (
    <nav className="surface-card mx-4 mt-4 flex items-center justify-between gap-4 px-4 py-3">
      <Link to="/" className="section-title text-xl font-bold">
        QuikShopee
      </Link>

      <div className="flex gap-4 items-center">
        <Link
          to="/cart"
          className="relative text-slate-700 hover:text-blue-700"
        >
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {cartCount}
            </span>
          )}
        </Link>

        {!userId ? (
          <>
            <Link to="/login" className="btn-ghost px-3 py-2 text-sm">
              Login
            </Link>
            <Link to="/signup" className="btn-primary px-3 py-2 text-sm">
              Signup
            </Link>
          </>
        ) : (
          <>
            {role === "admin" || role === "superadmin" ? (
              <Link
                to="/admin/products"
                className="btn-ghost px-3 py-2 text-sm"
              >
                Products
              </Link>
            ) : null}
            {role === "superadmin" ? (
              <Link to="/admin/users" className="btn-ghost px-3 py-2 text-sm">
                Admins
              </Link>
            ) : null}
            <button onClick={logout} className="btn-danger px-3 py-2 text-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
