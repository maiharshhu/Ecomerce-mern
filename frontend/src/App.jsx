import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import AddProduct from "./admin/AddProduct";
import EditProduct from "./admin/EditProduct";
import ProductList from "./admin/ProductList";
import UserManagement from "./admin/UserManagement";
import AdminDashboard from "./admin/AdminDashboard";
import Navbar from "./component/Navbar";
import Cart from "./pages/Cart";
import CheckoutAddress from "./pages/CheckoutAddress";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/cart", element: <Cart /> },
      { path: "/product/:id", element: <ProductDetails /> },

      // admin routes
      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/products",
        element: (
          <ProtectedRoute requiredRole="admin">
            <ProductList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/products/add",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AddProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/products/edit/:id",
        element: (
          <ProtectedRoute requiredRole="admin">
            <EditProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute requiredSuperAdminOnly>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      { path: "/checkout-address", element: <CheckoutAddress /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/order-success/:id", element: <OrderSuccess /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
