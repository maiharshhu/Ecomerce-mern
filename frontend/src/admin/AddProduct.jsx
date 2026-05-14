import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router";

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
  const [categoryChoice, setCategoryChoice] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

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
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(form).map((key) =>
          key === "category" ? (
            <div key={key} className="space-y-2">
              <select
                value={categoryChoice}
                onChange={handleCategoryChange}
                className="w-full p-2 border border-gray-300 rounded"
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
                  className="w-full p-2 border border-gray-300 rounded"
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
              className="w-full p-2 border border-gray-300 rounded"
              required={key === "title" || key === "price"}
            />
          ),
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
