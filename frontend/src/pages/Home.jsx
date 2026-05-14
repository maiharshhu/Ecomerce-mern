import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const res = await api.get("/products");
        const uniqueCategories = Array.from(
          new Set(
            (res.data ?? [])
              .map((product) => product.category?.trim())
              .filter(Boolean),
          ),
        ).sort((first, second) => first.localeCompare(second));

        if (active) {
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const res = await api.get(
          `/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`,
        );

        if (active) {
          setProducts(res.data ?? []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [search, category]);

  const addToCart = async (productId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please Log In to your account");
      return;
    }

    const res = await api.post(`/cart/add`, { userId, productId });

    const total = res.data.cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0,
    );

    localStorage.setItem("cartCount", total);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const hasResults = products.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl bg-white px-6 py-8 text-center shadow-sm ring-1 ring-gray-200 sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Featured Collection
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Find what your store needs
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
            Search products, filter by category, and add items to cart from one
            clean centered view.
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 md:grid-cols-[minmax(0,1fr)_220px] md:p-6">
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Categories</option>
            {categories.length > 0 ? (
              categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            ) : (
              <>
                <option value="Laptops">Laptops</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Tablets">Tablets</option>
              </>
            )}
          </select>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm ring-1 ring-gray-200">
            Loading products...
          </div>
        ) : hasResults ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Link to={`/product/${product._id}`} className="block">
                  <div className="flex h-64 items-center justify-center bg-gray-50 p-6">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <Link to={`/product/${product._id}`}>
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {product.title}
                      </h2>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.category}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-xl font-bold text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => addToCart(product._id)}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              No products found
            </h2>
            <p className="mt-2 text-gray-600">
              Try a different search term or clear the category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
