import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../api/axios";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/products/${id}`);
        if (active) {
          setProduct(res.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load product details.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProduct();
    }

    return () => {
      active = false;
    };
  }, [id]);

  const ensureLoggedIn = () => {
    if (!userId) {
      alert("Please Log In to your account");
      navigate("/login");
      return false;
    }
    return true;
  };

  const addToCart = async (redirectToCheckout) => {
    if (!ensureLoggedIn()) return;

    if (redirectToCheckout) {
      setIsBuying(true);
    } else {
      setIsAdding(true);
    }

    try {
      await api.post("/cart/add", { userId, productId: id });
      window.dispatchEvent(new Event("cartUpdated"));

      if (redirectToCheckout) {
        navigate("/checkout-address");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add product to cart.");
    } finally {
      setIsAdding(false);
      setIsBuying(false);
    }
  };

  if (!id || error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {error || "Product not found."}
          </h2>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm ring-1 ring-gray-200">
          Loading product details...
        </div>
      </div>
    );
  }

  const isOutOfStock = typeof product?.stock === "number" && product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to products
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex h-90 items-center justify-center rounded-xl bg-gray-50 p-6">
              <img
                src={product?.image}
                alt={product?.title}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                {product?.category || "Uncategorized"}
              </span>
              {typeof product?.stock === "number" ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isOutOfStock
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {product?.title}
            </h1>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {product?.description ||
                "No description available for this product yet."}
            </p>

            <div className="mt-6">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-3xl font-bold text-gray-900">
                ${Number(product?.price ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isOutOfStock || isAdding}
                onClick={() => addToCart(false)}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isAdding ? "Adding..." : "Add to cart"}
              </button>
              <button
                type="button"
                disabled={isOutOfStock || isBuying}
                onClick={() => addToCart(true)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isBuying ? "Processing..." : "Buy now"}
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Free delivery within 3-5 business days. Secure payment and easy
              returns included.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
