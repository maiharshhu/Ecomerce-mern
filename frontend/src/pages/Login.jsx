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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to Your Account
        </h2>
        {msg && (
          <div className="mb-4 text-center text-sm text-red-600 font-medium">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}
