import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiUser,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiMessageSquare
} from 'react-icons/fi/index.esm.js';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, searchQuery, filterStatus, filterCategory, filterPriority]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      const ticketsQuery = query(
        collection(db, "supportTickets"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(ticketsQuery);
      const ticketsData = [];
      
      querySnapshot.forEach((doc) => {
        ticketsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        });
      });
      
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filterCategory);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }

    setFilteredTickets(filtered);
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, "supportTickets", ticketId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date() }
          : ticket
      ));
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Failed to update ticket status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-blue-100 text-blue-800', icon: FiAlertCircle, label: 'Open' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: FiRefreshCw, label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: FiXCircle, label: 'Closed' }
    };
    
    const badge = badges[status] || badges.open;
    const Icon = badge.icon;
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color} items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority] || colors.medium}`}>
        {priority?.toUpperCase()}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      technical: 'Technical Issue',
      billing: 'Billing & Payments',
      course: 'Course Content',
      account: 'Account & Profile',
      assignment: 'Assignments & Quizzes',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    };
  };

  const stats = getTicketStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiMessageSquare className="text-indigo-600" />
            Support Tickets
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and respond to student support requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FiMessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <FiRefreshCw className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="course">Course</option>
              <option value="account">Account</option>
              <option value="assignment">Assignment</option>
              <option value="other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No support tickets found</p>
            {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                  setFilterPriority('all');
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiUser className="w-4 h-4" />
                        <span>{ticket.userName || 'Unknown'}</span>
                        <span>•</span>
                        <FiMail className="w-4 h-4" />
                        <span>{ticket.userEmail}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                      }}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center text-xs text-gray-500">
                    <FiClock className="w-3 h-3 mr-1" />
                    Created: {ticket.createdAt?.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Ticket Detail */}
            <div className="lg:sticky lg:top-4">
              {selectedTicket ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Ticket Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <p className="mt-1 text-gray-900">{selectedTicket.subject}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(selectedTicket.status)}
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                          disabled={updating}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <p className="mt-1 text-gray-900">{getCategoryLabel(selectedTicket.category)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Student Information</label>
                      <div className="mt-1 space-y-1">
                        <p className="text-gray-900 flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          {selectedTicket.userName || 'Unknown'}
                        </p>
                        <p className="text-gray-900 flex items-center gap-2">
                          <FiMail className="w-4 h-4" />
                          {selectedTicket.userEmail}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <p className="mt-1 text-sm text-gray-600">
                          {selectedTicket.createdAt?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="mt-1 text-sm text-gray-600">
                          {selectedTicket.updatedAt?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-700">Ticket ID</label>
                      <p className="mt-1 text-xs text-gray-500 font-mono">{selectedTicket.id}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <FiEye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
