import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const presetCategories = ["Laptops", "Mobiles", "Tablets"];

export default function Addproduct() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });
  const [role, setRole] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [categoryChoice, setCategoryChoice] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole("");
        setAuthReady(true);
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
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (role !== "admin" && role !== "superadmin") {
      navigate("/");
    }
  }, [authReady, role, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryChoice(value);

    if (value === "Other") {
      setForm({
        ...form,
        category: customCategory,
      });
      return;
    }

    setCustomCategory("");
    setForm({
      ...form,
      category: value,
    });
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setForm({
      ...form,
      category: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg("");

    try {
      await api.post("/products/add", form);
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error adding Product:", err);
      setMsg(err.response?.data?.message || "Unable to add product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="page-shell surface-card max-w-lg p-6">
        <h2 className="section-title mb-6 text-2xl font-bold">
          Add New Product
        </h2>
        {msg && <p className="alert-box alert-error mb-3">{msg}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {Object.keys(form).map((key) =>
            key === "category" ? (
              <div key={key} className="space-y-2">
                <select
                  value={categoryChoice}
                  onChange={handleCategoryChange}
                  className="select-field"
                  required
                >
                  <option value="">Select Category</option>
                  {presetCategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>

                {categoryChoice === "Other" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter new category"
                    className="input-field"
                    required
                  />
                )}
              </div>
            ) : (
              <input
                key={key}
                name={key}
                type={key === "price" || key === "stock" ? "number" : "text"}
                value={form[key]}
                onChange={handleChange}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                className="input-field"
                required={key === "title" || key === "price"}
              />
            ),
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
