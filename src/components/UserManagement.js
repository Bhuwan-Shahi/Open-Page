'use client'

import { useState } from 'react';

export default function UserManagement({ users, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'email':
          return a.email.localeCompare(b.email);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'totalOrders':
          return b.totalOrders - a.totalOrders;
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `NPR 0.00`;
    }
    return `NPR ${Number(amount).toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <p className="text-gray-600 text-sm">View and manage all registered users</p>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Users</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            >
              <option value="createdAt">Date Joined</option>
              <option value="email">Email</option>
              <option value="name">Name</option>
              <option value="totalSpent">Total Spent</option>
              <option value="totalOrders">Total Orders</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Order
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>Total: {user.totalOrders}</div>
                    <div className="text-xs text-gray-500">
                      Completed: {user.completedOrders}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">
                    {formatCurrency(user.totalSpent)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.lastOrderDate ? formatDate(user.lastOrderDate) : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No users have registered yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
