import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router";

export default function CheckoutAddress() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    let active = true;
    const loadAddresses = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/address/${userId}`);
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.addresses)
            ? res.data.addresses
            : [];
        if (active) {
          setAddresses(list);
          if (list.length > 0) {
            setSelectedAddressId(list[0]._id);
          }
        }
      } catch {
        if (active) {
          setAddresses([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      active = false;
    };
  }, [userId, navigate]);

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

        {isLoading ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Loading saved addresses...
          </div>
        ) : addresses.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Saved Addresses
              </h2>
              <button
                type="button"
                disabled={!selectedAddressId}
                onClick={() =>
                  navigate("/checkout", {
                    state: { selectedAddressId },
                  })
                }
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
              >
                Use Selected
              </button>
            </div>
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr._id;
                return (
                  <label
                    key={addr._id}
                    htmlFor={`saved-${addr._id}`}
                    className={`block cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id={`saved-${addr._id}`}
                        type="radio"
                        name="savedAddress"
                        value={addr._id}
                        checked={isSelected}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {addr.fullName}
                        </p>
                        <p className="text-slate-700 text-sm">{addr.phone}</p>
                        <p className="text-slate-600 text-sm">
                          {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                          {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            No saved address found. Add a new one below.
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Add New Address
          </h2>
          <p className="text-sm text-slate-600">
            Fill in the form if you want to add another delivery address.
          </p>
        </div>

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
