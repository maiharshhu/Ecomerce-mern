import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";

export default function UserManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isSuperAdmin = role === "superadmin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/");
      return;
    }

    loadUsers();
  }, [isSuperAdmin, navigate, loadUsers]);

  const refreshList = async () => {
    await loadUsers();
  };

  const promoteToAdmin = async (uid) => {
    setUpdatingId(uid);
    try {
      const res = await api.patch(`/admin/users/${uid}/role`, {
        role: "admin",
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.uid === uid
            ? { ...user, role: res.data.user?.role || "admin" }
            : user,
        ),
      );
      await refreshList();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update role");
    } finally {
      setUpdatingId("");
    }
  };

  const roleBadge = (value) => {
    const base = "rounded-full px-3 py-1 text-xs font-semibold";
    if (value === "superadmin") return `${base} bg-purple-100 text-purple-700`;
    if (value === "admin") return `${base} bg-blue-100 text-blue-700`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              User Management
            </h1>
            <p className="text-sm text-slate-600">
              Promote users to admin. Only super admin can change roles.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Loading users...
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full table-auto border-collapse text-left">
              <thead className="bg-slate-100 text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isPromotable = user.role === "user";
                  return (
                    <tr key={user.uid} className="border-t border-slate-200">
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className={roleBadge(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={!isPromotable || updatingId === user.uid}
                          onClick={() => promoteToAdmin(user.uid)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {updatingId === user.uid
                            ? "Updating..."
                            : isPromotable
                              ? "Make admin"
                              : "No action"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
