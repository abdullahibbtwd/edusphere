"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaUser } from "react-icons/fa";
import { FiSearch, FiXCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FormControl, InputLabel, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from "@mui/material";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  imageUrl: string | null;
  schoolId: string | null;
  school: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const UserManagement: React.FC = () => {
  const [filters, setFilters] = useState({ school: "", role: "", search: "" });
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Role change modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  const roles = [
    { value: "USER", label: "User" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "SCHOOL_ADMIN", label: "School Admin" },
    { value: "TEACHER", label: "Teacher" },
    { value: "STUDENT", label: "Student" },
  ];

  // Fetch schools for filter
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch users when filters or page changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters.school, filters.role]);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);

    const timeout = setTimeout(() => {
      fetchUsers();
    }, 300);

    setSearchDebounce(timeout);

    return () => {
      if (searchDebounce) clearTimeout(searchDebounce);
    };
  }, [filters.search]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools/list');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.school) params.append('school', filters.school);
      if (filters.role) params.append('role', filters.role);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/users?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({ school: "", role: "", search: "" });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedUser(null);
    setNewRole("");
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Refresh users list
      await fetchUsers();
      closeRoleModal();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
      console.error('Error updating role:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatRole = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-bg min-h-screen font-poppins text-text">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="text-sm text-muted">
          Total Users: <span className="font-semibold text-primary">{pagination.totalCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-xl shadow">
        <FormControl className="w-[200px]" size="small">
          <InputLabel id="school-label">School</InputLabel>
          <Select
            labelId="school-label"
            name="school"
            value={filters.school}
            onChange={handleFilterChange}
            label="School"
          >
            <MenuItem value="">All Schools</MenuItem>
            {schools.map((school) => (
              <MenuItem key={school.id} value={school.id}>
                {school.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className="w-[200px]" size="small">
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            label="Role"
          >
            <MenuItem value="">All Roles</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="flex items-center border border-muted rounded-lg bg-bg px-2 w-full md:w-auto">
          <FiSearch className="text-muted" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name or email..."
            className="p-2 bg-transparent focus:outline-none w-full"
          />
        </div>

        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary hover:text-bg transition cursor-pointer"
        >
          <FiXCircle /> Clear
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <CircularProgress />
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="overflow-x-auto bg-surface rounded-xl shadow">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr className="text-left text-sm">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">School</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-muted hover:bg-muted/50"
                  >
                    <td className="p-3 flex items-center gap-2">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <FaUser className="text-primary text-xl" />
                      )}
                      <span className="font-semibold">{user.name || "N/A"}</span>
                    </td>
                    <td className="p-3 text-sm text-muted">{user.email}</td>
                    <td className="p-3 text-sm">{user.school?.name || "N/A"}</td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary font-medium">
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="px-3 py-1 rounded-lg bg-primary text-white hover:opacity-90 text-sm cursor-pointer"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex justify-between items-center bg-surface p-4 rounded-xl shadow">
          <div className="text-sm text-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
            {pagination.totalCount} users
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className={`p-2 rounded-lg ${pagination.hasPrevPage
                ? "bg-primary text-white hover:opacity-90 cursor-pointer"
                : "bg-muted text-muted cursor-not-allowed"
                }`}
            >
              <FiChevronLeft />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                )
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2 py-1">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg ${page === pagination.page
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-primary/20"
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`p-2 rounded-lg ${pagination.hasNextPage
                ? "bg-primary text-white hover:opacity-90 cursor-pointer"
                : "bg-muted text-muted cursor-not-allowed"
                }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      <Dialog open={roleModalOpen} onClose={closeRoleModal}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <div className="pt-2 min-w-[300px]">
            <p className="mb-4 text-sm text-gray-600">
              Change role for <strong>{selectedUser?.name || selectedUser?.email}</strong>
            </p>
            <FormControl fullWidth>
              <InputLabel id="new-role-label">New Role</InputLabel>
              <Select
                labelId="new-role-label"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                label="New Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRoleModal} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            variant="contained"
            disabled={updating || newRole === selectedUser?.role}
          >
            {updating ? <CircularProgress size={20} /> : "Update Role"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;
