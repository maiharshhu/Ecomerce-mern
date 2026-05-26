import { useState } from "react";
import { useNavigate } from "react-router";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [form, setForm] = useState({
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
      const credentials = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      const tokenResult = await credentials.user.getIdTokenResult(true);
      const role = tokenResult.claims.role || "user";

      localStorage.setItem("userId", credentials.user.uid);
      localStorage.setItem("role", role);

      setMsg("Login successfully");
      // redirect to homepage
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setMsg(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!form.email) {
      setMsg("Enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, form.email);
      setMsg("Password reset link sent. Check your inbox.");
    } catch (err) {
      setMsg(err.message || "Unable to send reset email.");
    }
  };

  return (
    <div className="app-page flex items-center justify-center">
      <div className="surface-card w-full max-w-sm p-8">
        <h2 className="section-title mb-6 text-center text-2xl font-bold">
          Login to Your Account
        </h2>
        {msg && (
          <div className="alert-box alert-error mb-4 text-center font-medium">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="enter email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            required
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}
