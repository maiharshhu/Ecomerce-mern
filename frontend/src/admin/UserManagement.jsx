import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";

export default function UserManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isSuperAdmin = role === "superadmin";
  const currentUserId = localStorage.getItem("userId");

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

  const setUserRole = async (uid, nextRole) => {
    setUpdatingId(uid);
    try {
      const res = await api.patch(`/admin/users/${uid}/role`, {
        role: nextRole,
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.uid === uid
            ? { ...user, role: res.data.user?.role || nextRole }
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
    <div className="app-page">
      <div className="page-shell surface-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="section-title text-2xl font-bold">
              User Management
            </h1>
            <p className="section-subtitle text-sm">
              Promote or remove admin access. Only super admin can change roles.
            </p>
          </div>
        </div>

        {error ? (
          <div className="alert-box alert-error mt-4">{error}</div>
        ) : null}

        {loading ? (
          <div className="alert-box alert-info mt-6">Loading users...</div>
        ) : (
          <div className="table-card mt-6">
            <table className="w-full table-auto border-collapse text-left">
              <thead className="table-head text-sm">
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
                  const isDemotable = user.role === "admin";
                  const isCurrentUser = user.uid === currentUserId;
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
                        <div className="flex flex-wrap gap-2">
                          {isPromotable ? (
                            <button
                              type="button"
                              disabled={updatingId === user.uid}
                              onClick={() => setUserRole(user.uid, "admin")}
                              className="btn-primary px-3 py-1.5 text-xs disabled:cursor-not-allowed"
                            >
                              {updatingId === user.uid
                                ? "Updating..."
                                : "Make admin"}
                            </button>
                          ) : null}

                          {isDemotable ? (
                            <button
                              type="button"
                              disabled={
                                updatingId === user.uid || isCurrentUser
                              }
                              onClick={() => setUserRole(user.uid, "user")}
                              className="btn-ghost px-3 py-1.5 text-xs disabled:cursor-not-allowed"
                            >
                              {updatingId === user.uid
                                ? "Updating..."
                                : "Remove admin"}
                            </button>
                          ) : null}

                          {user.role === "superadmin" ? (
                            <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                              Protected
                            </span>
                          ) : null}
                        </div>
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
