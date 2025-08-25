"use client";
import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import { FiSearch, FiXCircle } from "react-icons/fi";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const UserManagement: React.FC = () => {
  const [filters, setFilters] = useState({ school: "", role: "", search: "" });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({ school: "", role: "", search: "" });
  };

  const users = [
    {
      name: "Alice Johnson",
      email: "alice@sunrise.edu",
      school: "Sunrise Public School",
      role: "Admin",
    },
    {
      name: "Brian Smith",
      email: "brian@greenvalley.edu",
      school: "Green Valley High",
      role: "Teacher",
    },
    {
      name: "Catherine Lee",
      email: "cathy@riverdale.edu",
      school: "Riverdale Academy",
      role: "Student",
    },
  ];

  const filteredUsers = users.filter((u) => {
    return (
      (filters.school ? u.school === filters.school : true) &&
      (filters.role ? u.role === filters.role : true) &&
      (filters.search
        ? u.name.toLowerCase().includes(filters.search.toLowerCase())
        : true)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-6 bg-bg min-h-screen font-poppins text-text">
      {/* Header */}
      <h2 className="text-2xl font-bold">User Management</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-xl shadow">
        <FormControl className="w-[200px]">
          <InputLabel id="school-label">School</InputLabel>
          <Select
            labelId="school-label"
            name="school"
            value={filters.school}
            onChange={handleChange}
          >
            <MenuItem value="">All Schools</MenuItem>
            <MenuItem value="Sunrise Public School">Sunrise Public School</MenuItem>
            <MenuItem value="Green Valley High">Green Valley High</MenuItem>
            <MenuItem value="Riverdale Academy">Riverdale Academy</MenuItem>
          </Select>
        </FormControl>

        <FormControl className="w-[200px]">
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={filters.role}
            onChange={handleChange}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Teacher">Teacher</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
          </Select>
        </FormControl>

        <div className="flex items-center border border-muted rounded-lg bg-bg px-2 w-full md:w-auto">
          <FiSearch className="text-muted" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by name..."
            className="p-2 bg-transparent focus:outline-none w-full"
          />
        </div>

        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary hover:text-bg transition cursor-pointer"
        >
          <FiXCircle /> Clear Filters
        </button>
      </div>

      {/* Users Table */}
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
            {filteredUsers.map((user, idx) => (
              <tr
                key={idx}
                className="border-t border-muted hover:bg-muted/50"
              >
                <td className="p-3 flex items-center gap-2">
                  <FaUser className="text-primary" />
                  <span className="font-semibold">{user.name}</span>
                </td>
                <td className="p-3 text-sm text-muted">{user.email}</td>
                <td className="p-3 text-sm">{user.school}</td>
                <td className="p-3 text-sm">{user.role}</td>
                <td className="p-3 flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-muted hover:bg-primary hover:text-bg text-sm cursor-pointer">
                    View Details
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-primary text-bg hover:opacity-90 text-sm cursor-pointer">
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
