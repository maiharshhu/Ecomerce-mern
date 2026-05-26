import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

export default function Cart() {
  const userId = localStorage.getItem("userId");
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    if (!userId) {
      setCart({ items: [] });
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/cart/${userId}`);
      setCart(res.data ?? { items: [] });
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const initializeCart = async () => {
      if (!userId) {
        if (active) {
          setCart({ items: [] });
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get(`/cart/${userId}`);
        if (active) {
          setCart(res.data ?? { items: [] });
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        if (active) {
          setCart({ items: [] });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeCart();

    return () => {
      active = false;
    };
  }, [userId]);

  const removeItem = async (productId) => {
    await api.post(`/cart/remove`, { userId, productId });
    await loadCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // update item quantity

  const updateQty = async (productId, quantity) => {
    if (quantity === 0) {
      await removeItem(productId);
      return;
    }
    await api.post(`/cart/update`, { userId, productId, quantity });
    await loadCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) {
    return <div className="app-page page-shell">Loading cart...</div>;
  }

  if (!userId) {
    return (
      <div className="app-page page-shell">
        <div className="surface-card p-6">
          <h1 className="section-title mb-4 text-2xl font-bold">Your Cart</h1>
          <p className="section-subtitle">Please log in to view your cart.</p>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0,
  );
  return (
    <div className="app-page">
      <div className="page-shell">
        <h1 className="section-title mb-6 text-2xl font-bold">Your Cart</h1>

        {items.length === 0 ? (
          <div className="soft-panel border-dashed p-6 text-slate-600">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={item.productId._id}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productId.image}
                    alt={item.productId.title}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.productId.title}
                    </h2>
                    <p className="text-slate-600">
                      ${item.productId.price.toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1">
                    <button
                      onClick={() =>
                        updateQty(item.productId._id, item.quantity - 1)
                      }
                      className="rounded-lg px-2 py-1 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.productId._id, item.quantity + 1)
                      }
                      className="rounded-lg px-2 py-1 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  <p className="min-w-24 text-right font-semibold text-slate-900">
                    ${(item.productId.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeItem(item.productId._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4 text-right">
              <h2 className="text-xl font-semibold text-slate-900">
                Total: ${total.toFixed(2)}
              </h2>
            </div>
            <button
              className="btn-primary w-full"
              onClick={() => navigate("/checkout-address")}
            >
              Proceed to checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
