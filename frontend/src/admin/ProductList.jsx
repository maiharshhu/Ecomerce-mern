import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin" || role === "superadmin";
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const deletedProduct = async (id) => {
    try {
      await api.delete(`/products/delete/${id}`);
      alert("Product deleted Successfully!");
      const response = await api.get("/products", {
        params: {
          search,
          category,
        },
      });
      setProducts(response.data);
    } catch (err) {
      console.error("Error deleting products", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await api.get("/products", {
          params: {
            search,
            category,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error loading products", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, category]);

  const handleFilter = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await api.get("/products", {
        params: {
          search,
          category,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error filtering products", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setSearch("");
    setCategory("");

    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error resetting products", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page">
      <div className="page-shell">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="section-title text-2xl font-bold">Product List</h2>
          <Link to="/admin/products/add" className="btn-primary">
            Add New Product
          </Link>
        </div>

        <form
          onSubmit={handleFilter}
          className="soft-panel mb-6 grid gap-3 p-4 md:grid-cols-3"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title"
            className="input-field"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select-field"
          >
            <option value="">All Categories</option>
            <option value="Laptops">Laptops</option>
            <option value="Mobiles">Mobiles</option>
            <option value="Tablets">Tablets</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary flex-1">
              Filter
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-ghost flex-1"
            >
              Reset
            </button>
          </div>
        </form>

        {loading && (
          <p className="mb-4 text-sm text-slate-600">Loading products...</p>
        )}

        <table className="table-card w-full table-auto border-collapse">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-t border-slate-200 text-center"
              >
                <td className="px-4 py-3">{product.title}</td>
                <td className="px-4 py-3">{product.price}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/products/edit/${product._id}`}
                    className="mr-4 text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deletedProduct(product._id)}
                    className="btn-danger px-3 py-1.5 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
