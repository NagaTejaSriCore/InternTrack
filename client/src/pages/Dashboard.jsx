import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatsCards from '../components/StatsCards';
import ApplicationModal from '../components/ApplicationModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import FollowUpModal from '../components/FollowUpModal';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  Sparkles,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  X
} from 'lucide-react';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500';
    case 'Interview':
      return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500';
    case 'Offer':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 focus:ring-slate-500';
  }
};

const Dashboard = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // AI follow-up state (Phase 4)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTargetApp, setAiTargetApp] = useState(null);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Helper to trigger toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const res = await api.get('/api/applications/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err.message);
    }
  };

  // Fetch applications list with search and filter
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/api/applications', { params });
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Debounce search slightly for responsive typing
    const timer = setTimeout(() => {
      fetchApplications();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  // Handle Save (Add or Update)
  const handleSaveApplication = async (formData) => {
    if (editingApp) {
      const res = await api.put(`/api/applications/${editingApp._id}`, formData);
      setApplications((prev) =>
        prev.map((item) => (item._id === editingApp._id ? res.data : item))
      );
      showToast(`Updated application for ${res.data.company}`);
    } else {
      const res = await api.post('/api/applications', formData);
      setApplications((prev) => [res.data, ...prev]);
      showToast(`Added application for ${res.data.company}`);
    }
    fetchStats();
  };

  // Handle inline status update from dropdown
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/api/applications/${appId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((item) => (item._id === appId ? res.data : item))
      );
      fetchStats();
      showToast(`Status updated to "${newStatus}" for ${res.data.company}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Handle Delete Application
  const handleDeleteApplication = async () => {
    if (!appToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/api/applications/${appToDelete._id}`);
      setApplications((prev) => prev.filter((item) => item._id !== appToDelete._id));
      setIsDeleteOpen(false);
      setAppToDelete(null);
      fetchStats();
      showToast(`Removed application for ${appToDelete.company}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete application', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (app) => {
    setAppToDelete(app);
    setIsDeleteOpen(true);
  };

  // AI follow-up generator handler
  const openAiModal = (app) => {
    setAiTargetApp(app);
    setAiDraft('');
    setIsAiModalOpen(true);
    generateAiFollowUp(app);
  };

  const generateAiFollowUp = async (app) => {
    const target = app || aiTargetApp;
    if (!target || !target.company || !target.role) {
      showToast('Company and role are required to generate follow-up message', 'error');
      return;
    }

    try {
      setAiLoading(true);
      const res = await api.post('/api/ai/followup', {
        company: target.company,
        role: target.role,
        status: target.status
      });
      setAiDraft(res.data.message);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not draft message. Check AI API key.', 'error');
      // Helpful fallback draft if AI endpoint is not enabled yet
      setAiDraft(
        `Dear Hiring Team at ${target.company},\n\nI hope this email finds you well. I am following up on my application for the ${target.role} position. I remain extremely interested in the opportunity and would love to know if there are any updates regarding my candidacy.\n\nThank you for your time and consideration!\n\nBest regards,\n${user?.name || 'Applicant'}`
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Applications Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your internship pipeline, interviews, and offers.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Stats Cards Section */}
      <StatsCards
        stats={stats}
        selectedStatus={statusFilter}
        onSelectStatus={(status) => setStatusFilter((prev) => (prev === status ? '' : status || ''))}
      />

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or role (e.g. Google, Frontend)..."
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {(statusFilter || search) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Applications Content: Table & Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          {search || statusFilter ? (
            <>
              <h3 className="text-base font-bold text-slate-800 mb-1">No matching applications</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                We couldn't find any applications matching your search or status filter.
              </p>
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                }}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-slate-800 mb-1">No applications tracked yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                Start tracking your internship applications to stay organized throughout recruiting season!
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Your First Application
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Company & Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Applied</th>
                  <th className="py-3.5 px-4">Notes & Link</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Company & Role */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{app.company}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{app.role}</div>
                    </td>

                    {/* Inline Status Dropdown */}
                    <td className="py-4 px-4">
                      <div className="inline-block relative">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 transition-all cursor-pointer ${getStatusBadgeStyle(
                            app.status
                          )}`}
                          title="Change status inline"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Date Applied */}
                    <td className="py-4 px-4 text-slate-600 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {app.dateApplied
                            ? new Date(app.dateApplied).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Notes & Link */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {app.link && (
                          <a
                            href={app.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium flex-shrink-0"
                            title="Open application posting"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Link</span>
                          </a>
                        )}
                        {app.notes && (
                          <span
                            className="text-xs text-slate-500 truncate"
                            title={app.notes}
                          >
                            {app.notes}
                          </span>
                        )}
                        {!app.link && !app.notes && (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* AI Follow-up action */}
                        <button
                          onClick={() => openAiModal(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Generate AI Follow-up Message"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                        </button>

                        {/* Edit action */}
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit application"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete action */}
                        <button
                          onClick={() => openDeleteModal(app)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApplication}
        initialData={editingApp}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAppToDelete(null);
        }}
        onConfirm={handleDeleteApplication}
        application={appToDelete}
        deleting={deleting}
      />

      {/* AI Follow-Up Generator Modal (Phase 4) */}
      <FollowUpModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiTargetApp(null);
        }}
        application={aiTargetApp}
        onGenerate={generateAiFollowUp}
        emailDraft={aiDraft}
        loading={aiLoading}
      />
    </div>
  );
};

export default Dashboard;
