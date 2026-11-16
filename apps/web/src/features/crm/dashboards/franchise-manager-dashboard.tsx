import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

export default function FranchiseManagerDashboard() {
  const { staffUser, staffToken } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/crm/franchise-manager-dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${staffToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Franchise Manager Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800">Total Customers</h3>
          <p className="text-2xl font-bold text-green-900">{stats?.total_customers || 0}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800">Total Sales</h3>
          <p className="text-2xl font-bold text-blue-900">Rs. {stats?.total_sells || 0}</p>
        </div>
        <div className="bg-teal-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-teal-800">Collected Amount</h3>
          <p className="text-2xl font-bold text-teal-900">Rs. {stats?.collected_amount || 0}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-red-800">Uncollected Amount</h3>
          <p className="text-2xl font-bold text-red-900">Rs. {stats?.uncollected_amount || 0}</p>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800">Total Tasks</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats?.totalTasks || 0}</p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-orange-800">Not Started</h3>
          <p className="text-2xl font-bold text-orange-900">{stats?.notstarted || 0}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-800">WIP</h3>
          <p className="text-2xl font-bold text-purple-900">{stats?.wip || 0}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-pink-800">Pending From Client</h3>
          <p className="text-2xl font-bold text-pink-900">{stats?.pendingfromclient || 0}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800">Invoiced</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.invoiced || 0}</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-indigo-800">Payment Pending</h3>
          <p className="text-2xl font-bold text-indigo-900">{stats?.paymentpending || 0}</p>
        </div>
        <div className="bg-emerald-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-emerald-800">Completed</h3>
          <p className="text-2xl font-bold text-emerald-900">{stats?.completed || 0}</p>
        </div>
        <div className="bg-slate-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-800">Not Assign</h3>
          <p className="text-2xl font-bold text-slate-900">{stats?.notassign || 0}</p>
        </div>
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Service Status</h3>
          <div className="space-y-2">
            {stats?.recent_services?.length > 0 ? (
              stats.recent_services.map((service: any, idx: number) => (
                <div key={idx} className="p-2 bg-slate-50 rounded">
                  <p className="font-medium text-slate-700">{service.name}</p>
                  <p className="text-sm text-slate-600">{service.service_name}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {service.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No recent services</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Chatting</h3>
          <div className="space-y-2">
            {stats?.recent_chats?.length > 0 ? (
              stats.recent_chats.map((chat: any, idx: number) => (
                <div key={idx} className="p-2 bg-slate-50 rounded">
                  <p className="font-medium text-slate-700">{chat.customer_name}</p>
                  <p className="text-sm text-slate-600">{chat.chat_msg}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No recent chats</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Support Tickets</h3>
          <div className="space-y-2">
            {stats?.recent_tickets?.length > 0 ? (
              stats.recent_tickets.map((ticket: any, idx: number) => (
                <div key={idx} className="p-2 bg-slate-50 rounded">
                  <p className="font-medium text-slate-700">{ticket.name}</p>
                  <p className="text-sm text-slate-600">{ticket.ticket_msg}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      ticket.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ticket.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No recent tickets</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
