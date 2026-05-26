import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router";

const presetCategories = ["Laptops", "Mobiles", "Tablets"];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin" || role === "superadmin";
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

  const allowedFields = [
    "title",
    "description",
    "price",
    "category",
    "image",
    "stock",
  ];

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/products`);
        const product = res.data.find((p) => p._id === id);
        if (product) {
          setForm(product);
          if (presetCategories.includes(product.category)) {
            setCategoryChoice(product.category);
            setCustomCategory("");
          } else {
            setCategoryChoice("Other");
            setCustomCategory(product.category ?? "");
          }
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      }
    })();
  }, [id, isAdmin, navigate]);

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

    await api.put(`/products/update/${id}`, form);
    alert("Products update successfully");
    navigate("/admin/products");
  };

  return (
    <div className="app-page">
      <div className="page-shell surface-card max-w-lg p-6">
        <h2 className="section-title mb-6 text-2xl font-bold">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {allowedFields.map((key) =>
            key === "category" ? (
              <div key={key} className="space-y-2">
                <select
                  value={categoryChoice}
                  onChange={handleCategoryChange}
                  className="select-field"
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
                  />
                )}
              </div>
            ) : (
              <input
                key={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={key}
                className="input-field"
              />
            ),
          )}
          <button type="submit" className="btn-primary w-full">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}
