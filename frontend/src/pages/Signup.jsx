import { useState } from "react";
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSubmitting(true);

    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );

      if (form.name) {
        await updateProfile(credentials.user, { displayName: form.name });
      }

      const tokenResult = await credentials.user.getIdTokenResult(true);
      const role = tokenResult.claims.role || "user";
      const nextRole =
        role === "superadmin" ||
        form.email.trim().toLowerCase() ===
          (import.meta.env.VITE_SUPERADMIN_EMAIL || "").trim().toLowerCase()
          ? "superadmin"
          : role;

      localStorage.setItem("userId", credentials.user.uid);
      localStorage.setItem("role", nextRole);

      setMsg("Signup successful. Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setMsg(err.message || "An Error occured");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center">
      <div className="surface-card w-full max-w-sm p-8">
        <h2 className="section-title mb-6 text-center text-2xl font-bold">
          Create Account
        </h2>

        {msg && (
          <div className="alert-box alert-success mb-4 text-center font-medium">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            name="name"
            placeholder="Enter Name"
            value={form.name}
            onChange={handleChange}
            required
            className="input-field"
          />

          <input
            name="email"
            type="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
            required
            className="input-field"
          />

          <input
            name="password"
            type="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            required
            className="input-field"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
