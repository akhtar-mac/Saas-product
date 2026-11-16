import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api-base';

export default function CrmFranchiseManagePartnersOrders() {
  const { staffUser, staffToken } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecords, setShowRecords] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/crm/franchise-partners-orders`, {
        headers: {
          Authorization: `Bearer ${staffToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRecords = (value: number) => {
    setShowRecords(value);
    setCurrentPage(1);
  };

  const handleNameClick = (order: any) => {
    setSelectedOrder(order);
    setShowTaskModal(true);
  };

  const handleServiceClick = (order: any) => {
    // Navigate to service details page
    navigate(
      `/crm/franchise-single-service-fm?service_id=${order.cp_title}&customer_id=${order.customer_id}`
    );
  };

  const handleStatusClick = (order: any) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact?.includes(searchTerm) ||
      order.added_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / showRecords);
  const startIndex = (currentPage - 1) * showRecords;
  const endIndex = startIndex + showRecords;
  const displayedOrders = filteredOrders.slice(startIndex, endIndex);

  const getCpTypeLabel = (cpType: number) => {
    switch (cpType) {
      case 1:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Basic</span>;
      case 2:
        return (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">Standard</span>
        );
      case 3:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Premium</span>
        );
      case 4:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Diamond</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">-</span>;
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
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Manage Partners Orders</h1>

      {/* Search and Filter */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, contact, added by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Show</span>
          <select
            value={showRecords}
            onChange={(e) => handleShowRecords(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={filteredOrders.length}>All ({filteredOrders.length})</option>
          </select>
          <span className="text-sm text-slate-600">entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1E3A8A] text-white">
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Name
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Contact
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Category
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Service
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Type
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                EMI Total
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                EMI Paid
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Pay Now
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Added By
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Due Date
              </th>
              <th className="py-3 px-4 text-left uppercase tracking-wider text-xs font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map((order, index) => (
              <tr
                key={order.orderID}
                className={`border-b border-slate-200 hover:bg-slate-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <td
                  className="py-3 px-4 font-medium text-blue-600 cursor-pointer hover:underline"
                  onClick={() => handleNameClick(order)}
                >
                  {order.name}
                </td>
                <td className="py-3 px-4">{order.contact}</td>
                <td className="py-3 px-4">{order.category_name}</td>
                <td
                  className="py-3 px-4 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => handleServiceClick(order)}
                >
                  {order.service_name}
                </td>
                <td className="py-3 px-4">{getCpTypeLabel(order.cp_type)}</td>
                <td className="py-3 px-4">Rs. {order.emi_total_amount || 0}</td>
                <td className="py-3 px-4 text-green-600">Rs. {order.emi_paid_amount || 0}</td>
                <td className="py-3 px-4">
                  {order.emi_unpaid_amount > 0 ? (
                    <a
                      href={order.link_url || '#'}
                      target="_blank"
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                    >
                      Pay Rs - {order.emi_unpaid_amount}
                    </a>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      No Due
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">{order.added_by_name}</td>
                <td className="py-3 px-4">
                  {order.emi_due_date ? String(order.emi_due_date).split('T')[0] : '—'}
                </td>
                <td className="py-3 px-4">
                  {order.is_approve === 0 && (
                    <span
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs cursor-pointer hover:bg-yellow-200"
                      onClick={() => handleStatusClick(order)}
                    >
                      Pending
                    </span>
                  )}
                  {order.is_approve === 1 && (
                    <span
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs cursor-pointer hover:bg-green-200"
                      onClick={() => handleStatusClick(order)}
                    >
                      Approved
                    </span>
                  )}
                  {order.is_approve === 2 && (
                    <span
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs cursor-pointer hover:bg-red-200"
                      onClick={() => handleStatusClick(order)}
                    >
                      Rejected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-slate-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{' '}
          {filteredOrders.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Work Timeline Modal with Tabs */}
      {showTaskModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Customer Details - {selectedOrder.name}</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'chat'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Direct Chat
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'timeline'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Work Timeline
                </button>
                <button
                  onClick={() => setActiveTab('price')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'price'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Service Price
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'chat' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Direct Chat</h3>
                  <div className="bg-slate-100 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                    <p className="text-slate-500 text-center">Chat messages will be loaded here</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type Message ..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Send
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Work Timeline</h3>
                  <div className="mb-4">
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                      <option>Select Task</option>
                      <option>Income Tax Return (Salary Income)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-2 border-slate-300 pl-4">
                      <div className="text-sm text-slate-500">2026-08-24</div>
                      <div className="font-medium">ITR FILED</div>
                      <div className="text-xs text-green-600">INVOICED</div>
                      <div className="text-xs text-slate-500">by Sameer Sayd</div>
                    </div>
                    <div className="border-l-2 border-slate-300 pl-4">
                      <div className="text-sm text-slate-500">2026-08-10</div>
                      <div className="font-medium">WIP</div>
                      <div className="text-xs text-blue-600">WORK IN PROGRESS</div>
                      <div className="text-xs text-slate-500">by Sameer Sayd</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'price' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Service Price</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-medium">Rs. {selectedOrder.emi_total_amount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Paid Amount:</span>
                      <span className="font-medium text-green-600">
                        Rs. {selectedOrder.emi_paid_amount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Unpaid Amount:</span>
                      <span className="font-medium text-red-600">
                        Rs. {selectedOrder.emi_unpaid_amount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Next Due Date:</span>
                      <span className="font-medium">
                        {selectedOrder.emi_due_date
                          ? String(selectedOrder.emi_due_date).split('T')[0]
                          : '—'}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="mb-2">
                        <label className="block text-sm text-slate-600 mb-1">Paid Amount</label>
                        <input
                          type="text"
                          placeholder="Enter paid amount"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm text-slate-600 mb-1">Unpaid Amount</label>
                        <input
                          type="text"
                          placeholder="Enter unpaid amount"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm text-slate-600 mb-1">
                          Payment Screenshot
                        </label>
                        <input
                          type="file"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Approval Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payment Details - {selectedOrder.name}</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="text-slate-600">
              <p>Order ID: {selectedOrder.orderID}</p>
              <p>Total Amount: Rs. {selectedOrder.emi_total_amount || 0}</p>
              <p>Paid Amount: Rs. {selectedOrder.emi_paid_amount || 0}</p>
              <p>Unpaid Amount: Rs. {selectedOrder.emi_unpaid_amount || 0}</p>
              <p>
                Status:{' '}
                {selectedOrder.is_approve === 0
                  ? 'Pending'
                  : selectedOrder.is_approve === 1
                    ? 'Approved'
                    : 'Rejected'}
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Payment approval form will be loaded here (API endpoint pending)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
