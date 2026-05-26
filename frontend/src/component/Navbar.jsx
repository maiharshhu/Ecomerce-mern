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

      setUserId(user.uid);
      setRole(nextRole);
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("role", nextRole);
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
    <nav className="flex justify-between p-4 shadow">
      <Link to="/" className="font-bold text-xl">
        QuikShopee
      </Link>

      <div className="flex gap-4 items-center">
        <Link to="/cart" className="relative text-xl">
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {!userId ? (
          <>
            <Link to="/login" className="text-lg">
              Login
            </Link>
            <Link to="/signup" className="text-lg">
              Signup
            </Link>
          </>
        ) : (
          <>
            {role === "admin" || role === "superadmin" ? (
              <Link to="/admin/products" className="text-lg">
                Admin
              </Link>
            ) : null}
            {role === "superadmin" ? (
              <Link to="/admin/users" className="text-lg">
                Users
              </Link>
            ) : null}
            <button onClick={logout} className="text-lg">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
