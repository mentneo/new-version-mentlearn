import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';
import { FaChevronDown, FaChevronUp, FaStar, FaRegStar } from 'react-icons/fa';

export default function InterviewPrep() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedQuestions, setSavedQuestions] = useState([]);

  useEffect(() => {
    async function fetchInterviewData() {
      try {
        // Fetch interview question categories
        const categoriesCollection = collection(db, "interviewCategories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCategories(categoriesData);
        
        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }
        
        // Fetch interview questions
        const questionsCollection = collection(db, "interviewQuestions");
        const questionsSnapshot = await getDocs(questionsCollection);
        const questionsData = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          saved: false
        }));
        
        setQuestions(questionsData);
        
        // Load saved questions from localStorage
        const saved = localStorage.getItem('savedInterviewQuestions');
        if (saved) {
          const savedIds = JSON.parse(saved);
          setSavedQuestions(savedIds);
          
          // Mark questions as saved
          const updatedQuestions = questionsData.map(question => ({
            ...question,
            saved: savedIds.includes(question.id)
          }));
          
          setQuestions(updatedQuestions);
        }
      } catch (err) {
        console.error("Error fetching interview data:", err);
        setError("Failed to load interview preparation data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchInterviewData();
  }, [currentUser]);

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const toggleSaveQuestion = (questionId) => {
    // Update the questions state
    setQuestions(questions.map(question => 
      question.id === questionId
        ? { ...question, saved: !question.saved }
        : question
    ));
    
    // Update saved questions list
    let updatedSaved;
    if (savedQuestions.includes(questionId)) {
      updatedSaved = savedQuestions.filter(id => id !== questionId);
    } else {
      updatedSaved = [...savedQuestions, questionId];
    }
    
    setSavedQuestions(updatedSaved);
    
    // Save to localStorage
    localStorage.setItem('savedInterviewQuestions', JSON.stringify(updatedSaved));
  };

  // Filter questions by active category
  const filteredQuestions = activeCategory === 'saved'
    ? questions.filter(q => q.saved)
    : questions.filter(q => q.categoryId === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading interview questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
          <p className="mt-2 text-gray-600">Practice with common interview questions to prepare for your next interview.</p>
          
          {/* Categories Navigation */}
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="flex flex-wrap border-b">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeCategory === category.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              <button
                onClick={() => handleCategoryChange('saved')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeCategory === 'saved'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Questions ({savedQuestions.length})
              </button>
            </div>
            
            {/* Questions List */}
            <div className="divide-y divide-gray-200">
              {filteredQuestions.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-500">
                  {activeCategory === 'saved'
                    ? "You haven't saved any questions yet."
                    : "No questions available for this category."
                  }
                </div>
              ) : (
                filteredQuestions.map(question => (
                  <div key={question.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
                        
                        {/* Expanded answer section */}
                        {expandedQuestions[question.id] && (
                          <div className="mt-4 bg-gray-50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Answer:</h4>
                            <div className="text-gray-600 text-sm whitespace-pre-line">
                              {question.answer}
                            </div>
                            
                            {question.tips && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Tips:</h4>
                                <ul className="list-disc list-inside text-gray-600 text-sm">
                                  {question.tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        <button
                          onClick={() => toggleSaveQuestion(question.id)}
                          className="mr-4 text-gray-400 hover:text-yellow-500"
                        >
                          {question.saved ? (
                            <FaStar className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <FaRegStar className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleQuestion(question.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {expandedQuestions[question.id] ? (
                            <FaChevronUp className="h-5 w-5" />
                          ) : (
                            <FaChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-4 flex">
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        {expandedQuestions[question.id] ? "Hide Answer" : "Show Answer"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Interview Tips Section */}
          <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Interview Tips</h2>
            </div>
            <div className="px-6 py-5">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Before the Interview</h3>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                    <li>Research the company thoroughly</li>
                    <li>Practice your answers to common questions</li>
                    <li>Prepare questions to ask the interviewer</li>
                    <li>Review your resume and be ready to discuss all aspects</li>
                    <li>Plan your outfit and get your documents ready</li>
                    <li>Check the interview location and plan your route</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">During the Interview</h3>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                    <li>Arrive 10-15 minutes early</li>
                    <li>Maintain good eye contact and body language</li>
                    <li>Use the STAR method for behavioral questions</li>
                    <li>Be concise and stay on topic</li>
                    <li>Show enthusiasm and interest in the role</li>
                    <li>Ask thoughtful questions when given the opportunity</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">The STAR Method</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600 text-sm mb-2">
                    Use the STAR method to structure your answers to behavioral questions:
                  </p>
                  <ul className="list-none text-gray-600 text-sm space-y-2">
                    <li><span className="font-medium">S</span>ituation: Describe the context or situation</li>
                    <li><span className="font-medium">T</span>ask: Explain the task or challenge you faced</li>
                    <li><span className="font-medium">A</span>ction: Detail the actions you took</li>
                    <li><span className="font-medium">R</span>esult: Share the outcomes of your actions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
