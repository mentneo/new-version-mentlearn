import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { 
  FiHelpCircle, 
  FiMessageCircle, 
  FiMail, 
  FiPhone, 
  FiBook, 
  FiLifeBuoy,
  FiSend,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAlertCircle,
  FiVideo,
  FiFileText
} from 'react-icons/fi/index.js';

export default function LearnIQSupport() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  
  // Support ticket form
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
    email: currentUser?.email || ''
  });

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I enroll in a course?',
      answer: 'Navigate to the Courses page, browse available courses, and click "Enroll Now" on any course that interests you. Some courses are free, while others require payment.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I access my enrolled courses?',
      answer: 'Go to your Dashboard and you\'ll see all your enrolled courses. Click on any course card to access the course content, lessons, and materials.'
    },
    {
      id: 3,
      category: 'Assignments',
      question: 'How do I submit an assignment?',
      answer: 'Go to the Assignments page, click on the assignment you want to submit, then click "Submit Assignment". You can upload files or enter text depending on the assignment requirements.'
    },
    {
      id: 4,
      category: 'Assignments',
      question: 'Can I resubmit an assignment?',
      answer: 'If your mentor allows resubmissions, you can resubmit an assignment before the due date. Check with your mentor for specific policies.'
    },
    {
      id: 5,
      category: 'Quizzes',
      question: 'How do quizzes work?',
      answer: 'Your mentor will assign quizzes which appear in your Quizzes page. Click "Take Quiz" to start, answer all questions, and submit. You\'ll receive your score immediately for multiple-choice questions.'
    },
    {
      id: 6,
      category: 'Quizzes',
      question: 'Can I retake a quiz?',
      answer: 'Quiz retake policies depend on your mentor\'s settings. Contact your mentor if you need to retake a quiz.'
    },
    {
      id: 7,
      category: 'Progress',
      question: 'How is my progress tracked?',
      answer: 'Your progress is automatically tracked based on completed lessons, submitted assignments, quiz scores, and study time. View your detailed progress on the Progress page.'
    },
    {
      id: 8,
      category: 'Progress',
      question: 'How do I earn certificates?',
      answer: 'Complete all course requirements including lessons, assignments, and quizzes with passing grades. Once you meet the criteria, a certificate will be automatically generated.'
    },
    {
      id: 9,
      category: 'Technical',
      question: 'What browsers are supported?',
      answer: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox.'
    },
    {
      id: 10,
      category: 'Technical',
      question: 'Why can\'t I access video lessons?',
      answer: 'Ensure you have a stable internet connection and that your browser allows video playback. Try clearing your browser cache or using a different browser.'
    },
    {
      id: 11,
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page, click the "Edit Profile" button, update your information, and click "Save Changes".'
    },
    {
      id: 12,
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security, click "Change Password", enter your current password and new password, then click "Update Password".'
    },
    {
      id: 13,
      category: 'Payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, debit cards, and various online payment methods through our secure payment gateway.'
    },
    {
      id: 14,
      category: 'Payments',
      question: 'Can I get a refund?',
      answer: 'Refund policies vary by course. Generally, you can request a refund within 7 days of purchase if you haven\'t completed more than 25% of the course. Contact support for assistance.'
    },
    {
      id: 15,
      category: 'Communication',
      question: 'How do I contact my mentor?',
      answer: 'You can send messages to your mentor through the Notifications page, or check if your mentor has provided contact information in the course materials.'
    }
  ];

  // Filter FAQs by search query
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group FAQs by category
  const faqsByCategory = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, "supportTickets"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Student',
        ...ticketForm,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setTicketSubmitted(true);
      setTicketForm({
        subject: '',
        category: 'technical',
        priority: 'medium',
        description: '',
        email: currentUser?.email || ''
      });
      
      setTimeout(() => setTicketSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit support ticket. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiLifeBuoy className="text-indigo-600" />
                Help & Support
              </h1>
              <p className="mt-2 text-gray-600">
                Find answers to common questions or contact our support team
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'faq', label: 'FAQ', icon: FiHelpCircle },
                { id: 'contact', label: 'Contact Support', icon: FiMessageCircle },
                { id: 'resources', label: 'Resources', icon: FiBook }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-6">
              {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiHelpCircle className="text-indigo-600" />
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {categoryFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {expandedFaq === faq.id ? (
                            <FiChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaq === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 pb-3 text-gray-600"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No results found for "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-2">Try different keywords or contact support</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Quick Contact Cards */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-3">official@mentneo.com</p>
                <a
                  href="mailto:official@mentneo.com"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Send Email
                </a>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPhone className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-3">+91 82146476</p>
                <a
                  href="tel:+9182146476"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Call Now
                </a>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-3">Available 9 AM - 6 PM EST</p>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Start Chat
                </button>
              </div>
            </div>

            {/* Support Ticket Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiSend className="text-indigo-600" />
                Submit a Support Ticket
              </h2>

              {ticketSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  <span>Support ticket submitted successfully! We'll respond within 24 hours.</span>
                </motion.div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="course">Course Content</option>
                      <option value="account">Account & Profile</option>
                      <option value="assignment">Assignments & Quizzes</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <FiSend />
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Resource Cards */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FiBook className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Guide</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete guide to using all features of the platform
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Read Guide →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FiVideo className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-4">
                Step-by-step video guides for common tasks
              </p>
              <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Watch Videos →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FiFileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Technical documentation and API references
              </p>
              <a href="#" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View Docs →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <FiHelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600 mb-4">
                Quick start guide for new students
              </p>
              <a href="#" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                Get Started →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check platform status and known issues
              </p>
              <a href="#" className="text-red-600 hover:text-red-700 text-sm font-medium">
                View Status →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <FiMessageCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Forum</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with other students and mentors
              </p>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Visit Forum →
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
