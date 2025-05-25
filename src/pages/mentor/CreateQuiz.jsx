import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';

export default function CreateQuiz() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState([{ 
    question: '', 
    options: ['', '', '', ''],
    correctAnswer: 0 
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creationSuccess, setCreationSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!quizTitle.trim()) {
      setError("Quiz title is required.");
      return;
    }
    
    const isValid = questions.every((q, qIndex) => {
      if (!q.question.trim()) {
        setError(`Question ${qIndex + 1} text is required.`);
        return false;
      }
      
      if (!q.options.every(option => option.trim())) {
        setError(`All options for question ${qIndex + 1} are required.`);
        return false;
      }
      
      return true;
    });
    
    if (!isValid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Format questions to prevent object rendering issues
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer
      }));
      
      // Add the quiz to Firestore with proper metadata
      const quizRef = await addDoc(collection(db, "quizzes"), {
        title: quizTitle,
        description: quizDescription,
        questions: formattedQuestions,
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: true,
        status: 'active',
        totalQuestions: formattedQuestions.length
      });
      
      console.log("Quiz created with ID:", quizRef.id);
      
      // Set success state and prepare for navigation
      setCreationSuccess(true);
      
      // Store info in session storage for the next page
      window.sessionStorage.setItem('quizCreated', 'true');
      window.sessionStorage.setItem('quizTitle', quizTitle);
      window.sessionStorage.setItem('quizId', quizRef.id);
      
      // Ask user if they want to assign the quiz right away
      setTimeout(() => {
        const assignNow = window.confirm(`Quiz "${quizTitle}" created successfully! Would you like to assign it to students now?`);
        
        if (assignNow) {
          // Use direct window navigation to ensure proper page reload
          window.location.href = `/mentor/assign-to-students?type=quiz&id=${quizRef.id}`;
        } else {
          // Navigate back to quizzes list with page reload for fresh data
          window.location.href = '/mentor/quizzes';
        }
      }, 100); // Small timeout to ensure Firebase operation completes
      
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
            <button
              type="button"
              onClick={() => window.location.href = '/mentor/quizzes'}
              className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Quizzes
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {creationSuccess && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Quiz created successfully! Redirecting...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="quizTitle" className="sr-only">Quiz Title</label>
                <input
                  id="quizTitle"
                  name="quizTitle"
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Quiz Title"
                />
              </div>
              <div>
                <label htmlFor="quizDescription" className="sr-only">Quiz Description</label>
                <textarea
                  id="quizDescription"
                  name="quizDescription"
                  rows="3"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Quiz Description"
                ></textarea>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add questions to your quiz. Each question requires at least two options.
                </p>
              </div>
              <div className="border-t border-gray-200">
                {questions.map((question, index) => (
                  <div key={index} className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Question {index + 1}
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[index].question = e.target.value;
                              setQuestions(newQuestions);
                            }}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter your question here"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Correct Answer
                        </label>
                        <div className="mt-1">
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[index].correctAnswer = parseInt(e.target.value);
                              setQuestions(newQuestions);
                            }}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            {question.options.map((_, optionIndex) => (
                              <option key={optionIndex} value={optionIndex}>
                                Option {optionIndex + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="mt-2 flex rounded-md shadow-sm">
                          <div className="flex-grow">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].options[optionIndex] = e.target.value;
                                setQuestions(newQuestions);
                              }}
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          </div>
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions[index].options.splice(optionIndex, 1);
                                setQuestions(newQuestions);
                              }}
                              className="ml-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = [...questions];
                          newQuestions.splice(index + 1, 0, { question: '', options: ['', '', '', ''], correctAnswer: 0 });
                          setQuestions(newQuestions);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => window.location.href = '/mentor/quizzes'}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || creationSuccess}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading || creationSuccess ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : creationSuccess ? 'Created!' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}