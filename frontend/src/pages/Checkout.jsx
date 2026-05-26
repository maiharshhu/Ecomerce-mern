import { useState, useEffect } from "react";
import api from "../api/axios.js";
import { Link, useLocation, useNavigate } from "react-router";

export default function Checkout() {
  const userId = localStorage.getItem("userId");
  const [address, setAddress] = useState([]);
  const [cart, setCart] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    api
      .get(`/cart/${userId}`)
      .then((res) => setCart(res.data || { items: [] }));
    api.get(`/address/${userId}`).then((res) => {
      const addresses = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.addresses)
          ? res.data.addresses
          : [];
      setAddress(addresses);
      const preferredAddressId = location.state?.selectedAddressId;
      if (
        preferredAddressId &&
        addresses.some((addr) => addr._id === preferredAddressId)
      ) {
        setSelectedAddressId(preferredAddressId);
      } else if (addresses.length > 0) {
        setSelectedAddressId(addresses[0]._id);
      }
    });
  }, [userId, navigate, location.state?.selectedAddressId]);

  const total = (cart?.items || []).reduce(
    (sum, i) => sum + i.quantity * i.productId.price,
    0,
  );

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }

    try {
      const res = await api.post("/order/place", {
        userId,
        address: selectedAddress,
      });
      navigate(`/order-success/${res.data.orderId}`);
    } catch (error) {
      alert(
        "Error placing order: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const effectiveSelectedAddressId = selectedAddressId || address[0]?._id || "";
  const selectedAddress = address.find(
    (addr) => addr._id === effectiveSelectedAddressId,
  );

  return (
    <div className="app-page">
      <div className="page-shell surface-card p-6 sm:p-8">
        <h1 className="section-title mb-5 text-2xl font-bold">Checkout</h1>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="font-semibold text-slate-900">Select Address</h2>
            {address.length > 0 ? (
              <Link
                to="/checkout-address"
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                + Add New Address
              </Link>
            ) : null}
          </div>

          {address.length === 0 ? (
            <div className="soft-panel border-dashed p-5">
              <p className="text-slate-700 font-medium mb-1">
                No address found
              </p>
              <p className="text-slate-600 text-sm mb-4">
                You need at least one delivery address to continue checkout.
              </p>
              <Link
                to="/checkout-address"
                className="btn-primary inline-flex px-4 py-2 text-sm"
              >
                Create New Address
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {address.map((addr) => {
                const isSelected = effectiveSelectedAddressId === addr._id;
                return (
                  <label
                    key={addr._id}
                    htmlFor={`addr-${addr._id}`}
                    className={`block cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id={`addr-${addr._id}`}
                        type="radio"
                        name="selectedAddress"
                        value={addr._id}
                        checked={effectiveSelectedAddressId === addr._id}
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
          )}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h2 className="font-semibold text-slate-900 mb-2">Order Summary</h2>
          <p className="text-slate-700 mb-4">Total Amount: ${total}</p>
          <button
            disabled={!selectedAddress || (cart?.items || []).length === 0}
            className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={placeOrder}
          >
            Place Order (COD)
          </button>
          {!selectedAddress && address.length > 0 ? (
            <p className="mt-2 text-sm text-red-600">
              Please select an address to place your order.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
