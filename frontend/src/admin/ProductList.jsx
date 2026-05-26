import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/");
    }
  }, [role, navigate]);

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
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product List</h2>
        <Link
          to="/admin/products/add"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Product
        </Link>
      </div>

      <form onSubmit={handleFilter} className="grid gap-3 md:grid-cols-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="Laptops">Laptops</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Tablets">Tablets</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-gray-900 text-white px-4 py-2 rounded"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 border border-gray-300 px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {loading && (
        <p className="mb-4 text-sm text-gray-600">Loading products...</p>
      )}

      <table className="w-full table-auto border-collapse border border-grey-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 px-4 py-2">Title</th>
            <th className="border border-gray-200 px-4 py-2">Price</th>
            <th className="border border-gray-200 px-4 py-2">Stock</th>
            <th className="border border-gray-200 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="text-center">
              <td className="border border-gray-200 px-4 py-2">
                {product.title}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {product.price}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {product.stock}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Link
                  to={`/admin/products/edit/${product._id}`}
                  className="text-blue-600 hover:underline mr-4"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deletedProduct(product._id)}
                  className="text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
