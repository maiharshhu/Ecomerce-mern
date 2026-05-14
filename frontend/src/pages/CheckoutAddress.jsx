import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router";

export default function CheckoutAddress() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fieldLabels = {
    fullName: "Full Name",
    phone: "Phone Number",
    addressLine: "Address Line",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await api.post("/address/add", {
        ...form,
        userId,
      });
      navigate("/checkout", { replace: true });
    } catch {
      setError("Could not save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Delivery Address
        </h1>
        <p className="text-slate-600 mb-6">
          Add your shipping details to continue checkout.
        </p>

        <form onSubmit={saveAddress} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(form).map((key) => (
              <div
                className={key === "addressLine" ? "sm:col-span-2" : ""}
                key={key}
              >
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  {fieldLabels[key]}
                </label>
                <input
                  id={key}
                  type="text"
                  name={key}
                  value={form[key]}
                  placeholder={`Enter ${fieldLabels[key]}`}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition"
          >
            {isSaving ? "Saving..." : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}
