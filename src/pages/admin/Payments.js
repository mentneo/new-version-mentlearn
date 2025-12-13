import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import AdminNavbar from '../../components/admin/AdminNavbar.js';
import { FaSearch, FaDownload, FaCheckCircle, FaTimesCircle, FaClock, FaFilter } from 'react-icons/fa';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch all payments
      const paymentsQuery = query(
        collection(db, 'payments'),
        orderBy('createdAt', 'desc'),
        limit(500)
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = [];
      
      let totalRevenue = 0;
      let successful = 0;
      let failed = 0;
      let pending = 0;
      
      for (const paymentDoc of paymentsSnapshot.docs) {
        const payment = paymentDoc.data();
        
        // Get user details
        let userName = 'Unknown User';
        let userEmail = 'N/A';
        if (payment.userId) {
          try {
            const userDoc = await getDocs(query(
              collection(db, 'users'),
              where('__name__', '==', payment.userId),
              limit(1)
            ));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              userName = userData.displayName || userData.name || userData.email || 'Unknown';
              userEmail = userData.email || 'N/A';
            }
          } catch (err) {
            console.log('Could not fetch user:', err);
          }
        }
        
        // Get course details
        let courseName = 'Unknown Course';
        if (payment.courseId) {
          try {
            const courseDoc = await getDocs(query(
              collection(db, 'courses'),
              where('__name__', '==', payment.courseId),
              limit(1)
            ));
            if (!courseDoc.empty) {
              const courseData = courseDoc.docs[0].data();
              courseName = courseData.title || 'Unknown Course';
            }
          } catch (err) {
            console.log('Could not fetch course:', err);
          }
        }
        
        const status = payment.status || 'pending';
        
        if (status === 'success' || status === 'captured') {
          successful++;
          totalRevenue += (payment.amount || 0) / 100;
        } else if (status === 'failed') {
          failed++;
        } else {
          pending++;
        }
        
        paymentsData.push({
          id: paymentDoc.id,
          orderId: payment.orderId || 'N/A',
          paymentId: payment.paymentId || 'N/A',
          razorpayOrderId: payment.razorpayOrderId || payment.orderId || 'N/A',
          userName,
          userEmail,
          courseName,
          amount: (payment.amount || 0) / 100,
          status: status,
          createdAt: payment.createdAt?.toDate() || payment.timestamp?.toDate() || new Date(),
          method: payment.method || 'razorpay',
          userId: payment.userId,
          courseId: payment.courseId
        });
      }
      
      setPayments(paymentsData);
      setStats({
        total: paymentsData.length,
        successful,
        failed,
        pending,
        totalRevenue
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { bg: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Success' },
      captured: { bg: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Captured' },
      failed: { bg: 'bg-red-100 text-red-800', icon: FaTimesCircle, label: 'Failed' },
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: FaClock, label: 'Pending' },
      created: { bg: 'bg-blue-100 text-blue-800', icon: FaClock, label: 'Created' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg}`}>
        <Icon className="text-xs" />
        {config.label}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = payment.createdAt;
      const now = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = paymentDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = paymentDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = paymentDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ['Order ID', 'Payment ID', 'User Name', 'User Email', 'Course', 'Amount (₹)', 'Status', 'Date'];
    const rows = filteredPayments.map(p => [
      p.orderId,
      p.paymentId,
      p.userName,
      p.userEmail,
      p.courseName,
      p.amount,
      p.status,
      p.createdAt.toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Transactions</h1>
          <p className="mt-2 text-gray-600">View and manage all payment transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Payments</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Successful</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{stats.successful}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Failed</div>
            <div className="mt-2 text-3xl font-bold text-red-600">{stats.failed}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, email, course, order ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="captured">Captured</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredPayments.length} of {payments.length} transactions
            </p>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{payment.orderId}</div>
                          <div className="text-gray-500 text-xs">
                            Payment: {payment.paymentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{payment.userName}</div>
                          <div className="text-gray-500">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{payment.courseName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{payment.createdAt.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {payment.createdAt.toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
