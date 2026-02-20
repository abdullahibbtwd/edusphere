import React from "react";
import { FaSchool } from "react-icons/fa";
import { MdCancel, MdCheckCircle, MdOutlineAutorenew } from "react-icons/md";
import { FiPlusCircle, FiSend, FiRefreshCcw,FiEye } from "react-icons/fi";

const SchoolSubscriptionManagement = () => {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 bg-bg min-h-screen font-poppins text-text">
      {/* Left Section - Schools Management */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Header + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-semibold">Schools Management</h2>
          <input
            type="text"
            placeholder="Search schools by name, admin email..."
            className="w-full md:w-1/2 p-2 rounded-lg border border-muted bg-surface text-text outline-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Schools Table */}
        <div className="overflow-x-auto rounded-xl shadow bg-surface">
          <table className="w-full border-collapse">
            <thead className="bg-bg">
              <tr className="text-left font-normal text-text text-sm">
                <th className="p-3">Logo</th>
                <th className="p-3">School Name</th>
                <th className="p-3">Current Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Sunrise Public School",
                  plan: "Premium",
                  status: "Active",
                  expiry: "Dec 30, 2025",
                  planColor: "bg-primary text-bg",
                  statusColor: "bg-success text-bg",
                },
                {
                  name: "Green Valley High",
                  plan: "Standard",
                  status: "Active",
                  expiry: "Oct 14, 2025",
                  planColor: "bg-primary-400 text-bg",
                  statusColor: "bg-success text-bg",
                },
                {
                  name: "Riverdale Academy",
                  plan: "Basic",
                  status: "Inactive",
                  expiry: "Expired: Jun 02, 2025",
                  planColor: "bg-blue-600 text-bg",
                  statusColor: "bg-red-600 text-bg",
                },
                {
                  name: "Horizon International",
                  plan: "Premium",
                  status: "Active",
                  expiry: "Aug 05, 2025",
                  planColor: "bg-green-600 text-bg",
                  statusColor: "bg-success text-bg",
                },
              ].map((school, idx) => (
                <tr
                  key={idx}
                  className="border-t border-muted hover:bg-muted/50"
                >
                  <td className="p-3">
                    <FaSchool className="text-primary text-xl" />
                  </td>
                  <td className="p-3 font-normal">{school.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-normal ${school.planColor}`}
                    >
                      {school.plan}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full  ${school.statusColor}`}
                    >
                      {school.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted">{school.expiry}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button className="px-3 py-1 cursor-pointer rounded-lg bg-bg hover:bg-primary hover:text-bg transition text-sm">
                      View Details
                    </button>
                    <button className="flex cursor-pointer items-center  gap-1 px-3 py-1 rounded-lg bg-red-600 text-bg hover:opacity-90 transition text-sm">
                      <MdCancel /> Cancel
                    </button>
                    <button className="flex cursor-pointer items-center bg-bg gap-1 px-3 py-1 rounded-lg hover:opacity-90 transition text-sm">
                      <MdOutlineAutorenew /> Renew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subscription Management */}
        <div className="bg-surface p-5 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Subscription Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-surface">
                <tr className="text-left text-sm">
                  <th className="p-3">Plan</th>
                  <th className="p-3">Schools</th>
                  <th className="p-3">Subscribers</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    plan: "Basic",
                    schools: "Riverdale Academy, Oakwood Primary",
                    subscribers: "2 schools",
                  },
                  {
                    plan: "Standard",
                    schools: "Green Valley High, Lakeside School",
                    subscribers: "2 schools",
                  },
                  {
                    plan: "Premium",
                    schools: "Sunrise Public School, Horizon International",
                    subscribers: "2 schools",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="border-t border-muted hover:bg-muted/50">
                    <td className="p-3 ">{row.plan}</td>
                    <td className="p-3 text-sm">{row.schools}</td>
                    <td className="p-3 text-sm">{row.subscribers}</td>
                    <td className="p-3 flex gap-2">
                      <button className="px-3 py-2 rounded-lg bg-primary text-bg hover:opacity-90 text-sm">
                        Upgrade
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-bg border-2 border-gray-300  text-text hover:opacity-90 text-sm">
                        Downgrade
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-red-600 text-bg hover:opacity-90 text-sm">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Pending Approvals */}
        <div className="bg-surface p-5 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4">Pending Approvals</h3>
          {[
            { name: "Silver Oak School", date: "Jul 18, 2025" },
            { name: "Bluebell High", date: "Jul 20, 2025" },
            { name: "Evergreen Public", date: "Jul 22, 2025" },
          ].map((school, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b border-muted py-3"
            >
              <div>
                <p className="font-semibold">{school.name}</p>
                <p className="text-sm text-muted">Registered: {school.date}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-muted text-text hover:opacity-90">
                  <FiEye />
                </button>
                <button className="p-2 rounded-lg bg-success text-bg hover:opacity-90">
                  <MdCheckCircle />
                </button>
                <button className="p-2 rounded-lg bg-red-600 text-bg hover:opacity-90">
                  <MdCancel />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface p-5 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-bg hover:opacity-90">
              <FiPlusCircle /> Create School
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cta text-bg hover:opacity-90">
              <FiSend /> Send Bulk Notifications
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary hover:text-bg">
              <FiRefreshCcw /> Manage Renewals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSubscriptionManagement;