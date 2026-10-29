import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  MessageSquare,
  X,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface InternalTask {
  id: number;
  taskName: string;
  addedBy: string;
  assignedTo: string;
  assignedToId: number;
  createdAt: string;
  status: number;
  comments: TaskComment[];
}

interface TaskComment {
  id: number;
  comment: string;
  status: number;
  username: string;
  createdAt: string;
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Not Started',
  2: 'Work In Progress',
  3: 'Pending From Client',
  4: 'Invoiced',
  5: 'Completed',
  6: 'Return Back',
  7: 'Cancel',
  8: 'Payment Pending',
};

const STATUS_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-blue-100 text-blue-700',
  5: 'bg-green-100 text-green-700',
  6: 'bg-purple-100 text-purple-700',
  7: 'bg-gray-100 text-gray-700',
  8: 'bg-pink-100 text-pink-700',
};

export default function CrmInternalTasksPage() {
  const { staffUser, staffToken } = useAuthStore();
  const [tasks, setTasks] = useState<InternalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InternalTask | null>(null);

  // Form states
  const [newTaskName, setNewTaskName] = useState('');
  const [newAssignTo, setNewAssignTo] = useState('');
  const [editStatus, setEditStatus] = useState(1);
  const [editComment, setEditComment] = useState('');

  // Users dropdown
  const [users, setUsers] = useState<{ id: number; name: string; role: string }[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        };
        const res = await fetch(`${API_BASE}/v1/crm/users`, { headers: authHeaders });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mappedUsers = data.data.map((u: any) => ({
            id: u.id,
            name: u.name || u.username,
            role: u.role_name || 'Staff',
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [staffToken]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setLoading(true);
    // TODO: Replace with actual API call
    // fetch(`${API_BASE}/v1/crm/internal-tasks`)
    //   .then(res => res.json())
    //   .then(data => setTasks(data.data || []))
    //   .finally(() => setLoading(false));

    // Mock data for now
    setTimeout(() => {
      setTasks([
        {
          id: 1,
          taskName: 'Review customer documents',
          addedBy: 'Admin',
          assignedTo: 'Operations Employee',
          assignedToId: 8,
          createdAt: '2026-09-20',
          status: 2,
          comments: [
            {
              id: 1,
              comment: 'Started working on document review',
              status: 2,
              username: 'Operations Employee',
              createdAt: '2026-09-20 10:30:00',
            },
          ],
        },
        {
          id: 2,
          taskName: 'Follow up with pending clients',
          addedBy: 'Sales Manager',
          assignedTo: 'Operations Employee',
          assignedToId: 8,
          createdAt: '2026-09-19',
          status: 1,
          comments: [],
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleCreateTask = () => {
    if (!newTaskName || !newAssignTo) {
      alert('Please fill all fields');
      return;
    }

    // TODO: Replace with actual API call
    const newTask: InternalTask = {
      id: Date.now(),
      taskName: newTaskName,
      addedBy: 'Current User',
      assignedTo: users.find((u) => u.id === Number(newAssignTo))?.name || 'Unknown',
      assignedToId: Number(newAssignTo),
      createdAt: new Date().toISOString().split('T')[0],
      status: 1,
      comments: [],
    };

    setTasks([newTask, ...tasks]);
    setCreateModalOpen(false);
    setNewTaskName('');
    setNewAssignTo('');
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;

    // TODO: Replace with actual API call
    const updatedTasks = tasks.map((t) => {
      if (t.id === selectedTask.id) {
        const updatedTask = { ...t, status: editStatus };
        if (editComment.trim()) {
          updatedTask.comments = [
            ...t.comments,
            {
              id: Date.now(),
              comment: editComment,
              status: editStatus,
              username: 'Current User',
              createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            },
          ];
        }
        return updatedTask;
      }
      return t;
    });

    setTasks(updatedTasks);
    setEditModalOpen(false);
    setEditComment('');
    setSelectedTask(null);
  };

  const handleDeleteTask = (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    // TODO: Replace with actual API call
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tasks.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(tasks.map((t) => t.id)));
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const openEditModal = (task: InternalTask) => {
    setSelectedTask(task);
    setEditStatus(task.status);
    setEditComment('');
    setEditModalOpen(true);
  };

  const openTimelineModal = (task: InternalTask) => {
    setSelectedTask(task);
    setTimelineModalOpen(true);
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#FAF9F5] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">Internal Tasks</h1>
          <p className="text-sm text-slate-500">Manage internal team tasks and follow-ups</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B365D] text-white rounded-lg hover:bg-[#00A896] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1B365D] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={selectedIds.size === tasks.length && tasks.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Task Name</th>
              <th className="px-4 py-3 text-left font-semibold">Added By</th>
              <th className="px-4 py-3 text-left font-semibold">Assigned To</th>
              <th className="px-4 py-3 text-left font-semibold">Created At</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.id)}
                      onChange={() => toggleSelect(task.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{task.taskName}</td>
                  <td className="px-4 py-3 text-slate-600">{task.addedBy}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openTimelineModal(task)}
                      className="text-[#00A896] hover:underline font-medium"
                    >
                      {task.assignedTo}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.createdAt}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1B365D]">Create New Task</h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                <select
                  value={newAssignTo}
                  onChange={(e) => setNewAssignTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                >
                  <option value="">-- Select User --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Task Name / Description
                </label>
                <textarea
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  rows={3}
                  placeholder="Enter task details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>
              <button
                onClick={handleCreateTask}
                className="w-full py-2 bg-[#1B365D] text-white rounded-lg hover:bg-[#00A896] transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1B365D]">Update Task</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Comment</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={2}
                  placeholder="Add comment..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>
              <button
                onClick={handleUpdateTask}
                className="w-full py-2 bg-[#1B365D] text-white rounded-lg hover:bg-[#00A896] transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Timeline Modal */}
      {timelineModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1B365D]">Task Comment Timeline</h2>
              <button
                onClick={() => setTimelineModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedTask.comments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  No comments available for this task.
                </p>
              ) : (
                selectedTask.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-slate-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[comment.status]}`}
                      >
                        {STATUS_LABELS[comment.status]}
                      </span>
                      <span className="text-sm text-slate-600">{comment.username}</span>
                    </div>
                    <p className="text-sm text-slate-700">{comment.comment}</p>
                    <p className="text-xs text-slate-400 mt-1">{comment.createdAt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
