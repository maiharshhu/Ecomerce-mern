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
    return <div className="max-w-4xl mx-auto p-6">Loading cart...</div>;
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600">Please log in to view your cart.</p>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0,
  );
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="rounded border border-dashed p-6 text-gray-600">
          Your cart is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              className="flex flex-col gap-4 rounded border p-4 sm:flex-row sm:items-center sm:justify-between"
              key={item.productId._id}
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.productId.image}
                  alt={item.productId.title}
                  className="h-16 w-16 rounded object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.productId.title}
                  </h2>
                  <p className="text-gray-600">
                    ${item.productId.price.toFixed(2)} each
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded border px-2 py-1">
                  <button
                    onClick={() =>
                      updateQty(item.productId._id, item.quantity - 1)
                    }
                    className="px-2 py-1"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQty(item.productId._id, item.quantity + 1)
                    }
                    className="px-2 py-1"
                  >
                    +
                  </button>
                </div>

                <p className="min-w-24 text-right font-semibold">
                  ${(item.productId.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeItem(item.productId._id)}
                  className="text-sm font-medium text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4 text-right">
            <h2 className="text-xl font-semibold">
              Total: ${total.toFixed(2)}
            </h2>
          </div>
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={() => navigate("/checkout-address")}
          >
            Proceed to checkout
          </button>
        </div>
      )}
    </div>
  );
}
