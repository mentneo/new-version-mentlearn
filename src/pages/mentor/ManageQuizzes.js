import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaCheck, FaTimes } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';

export default function ManageQuizzes() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [expandedQuizzes, setExpandedQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Fetch quizzes and assigned students data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch quizzes created by this mentor
        const quizzesQuery = query(
          collection(db, "quizzes"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const quizDocs = await getDocs(quizzesQuery);
        const quizzesList = quizDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setQuizzes(quizzesList);
        
        // Fetch students assigned to this mentor
        const assignmentsQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentDocs = await getDocs(assignmentsQuery);
        const studentIds = assignmentDocs.docs.map(doc => doc.data().studentId);
        
        // Get student details
        const studentsData = [];
        for (const studentId of studentIds) {
          const studentDoc = await getDoc(doc(db, "users", studentId));
          if (studentDoc.exists()) {
            studentsData.push({
              id: studentDoc.id,
              ...studentDoc.data()
            });
          }
        }
        
        setAssignedStudents(studentsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load quiz data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  const toggleQuizExpand = (quizId) => {
    setExpandedQuizzes(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
    }));
  };

  const handleEditQuiz = (quiz) => {
    // Create a deep copy to avoid direct state mutation
    setEditingQuiz(JSON.parse(JSON.stringify(quiz)));
    setShowAddModal(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        setLoading(true);
        
        // Delete quiz document
        await deleteDoc(doc(db, "quizzes", quizId));
        
        // Update quizzes list
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        
        setSuccess("Quiz deleted successfully!");
      } catch (err) {
        console.error("Error deleting quiz:", err);
        setError("Failed to delete quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const initialValues = {
    title: '',
    description: '',
    timeLimit: 30, // in minutes
    passingScore: 70, // percentage
    assignedStudentIds: [],
    questions: [{
      question: '',
      type: 'single', // single or multiple
      answers: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ]
    }]
  };

  // Define validation schema
  const quizSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    timeLimit: Yup.number().required('Time limit is required').min(1, 'Time limit must be at least 1 minute'),
    passingScore: Yup.number().required('Passing score is required').min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100'),
    assignedStudentIds: Yup.array().min(1, 'Please select at least one student'),
    questions: Yup.array().of(
      Yup.object().shape({
        question: Yup.string().required('Question text is required'),
        type: Yup.string().required('Question type is required'),
        answers: Yup.array().of(
          Yup.object().shape({
            text: Yup.string().required('Answer text is required'),
            isCorrect: Yup.boolean()
          })
        ).test('has-correct-answer', 'At least one answer must be marked as correct', function(answers) {
          return answers && answers.some(answer => answer.isCorrect);
        })
      })
    ).min(1, 'Quiz must have at least one question')
  });

  const handleSubmitQuiz = async (values, { resetForm, setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      // Process questions to ensure proper structure
      const processedQuestions = values.questions.map(q => ({
        question: q.question,
        type: q.type,
        answers: q.answers.map(a => ({
          id: String(a.id), // Ensure ID is a string
          text: a.text,
          isCorrect: Boolean(a.isCorrect) // Ensure isCorrect is boolean
        }))
      }));
      
      const quizData = {
        title: values.title,
        description: values.description,
        timeLimit: Number(values.timeLimit),
        passingScore: Number(values.passingScore),
        mentorId: currentUser.uid,
        assignedStudentIds: values.assignedStudentIds,
        questions: processedQuestions,
        updatedAt: serverTimestamp()
      };
      
      if (editingQuiz) {
        // Update existing quiz
        await updateDoc(doc(db, "quizzes", editingQuiz.id), quizData);
        
        // Update quizzes list
        setQuizzes(quizzes.map(quiz => 
          quiz.id === editingQuiz.id ? { ...quizData, id: quiz.id } : quiz
        ));
        
        setSuccess("Quiz updated successfully!");
      } else {
        // Add createdAt for new quizzes
        quizData.createdAt = serverTimestamp();
        
        // Create new quiz
        const docRef = await addDoc(collection(db, "quizzes"), quizData);
        
        // Add to quizzes list
        setQuizzes([...quizzes, { ...quizData, id: docRef.id }]);
        
        setSuccess("Quiz created successfully!");
      }
      
      resetForm();
      setEditingQuiz(null);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error saving quiz:", err);
      setError("Failed to save quiz: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
            <p className="text-center mt-4">Loading quizzes...</p>
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Manage Quizzes</h1>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <FaPlus className="mr-2" /> Create New Quiz
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          {/* Quizzes List */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  You haven't created any quizzes yet. Click the "Create New Quiz" button to get started.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {quizzes.map(quiz => (
                  <li key={quiz.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <button
                          onClick={() => toggleQuizExpand(quiz.id)}
                          className="flex items-center text-lg font-medium text-gray-900 hover:text-gray-700"
                        >
                          {expandedQuizzes[quiz.id] ? <FaChevronUp className="mr-2" /> : <FaChevronDown className="mr-2" />}
                          {quiz.title}
                        </button>
                        <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                        
                        <div className="flex space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Time limit: {quiz.timeLimit} minutes
                          </span>
                          <span className="text-xs text-gray-500">
                            Passing score: {quiz.passingScore}%
                          </span>
                          <span className="text-xs text-gray-500">
                            Questions: {quiz.questions?.length || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            Assigned to: {quiz.assignedStudentIds?.length || 0} students
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Quiz Content */}
                    {expandedQuizzes[quiz.id] && (
                      <div className="mt-4 border-t pt-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Assigned Students:</h4>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {quiz.assignedStudentIds?.length > 0 ? (
                              quiz.assignedStudentIds.map(studentId => {
                                const student = assignedStudents.find(s => s.id === studentId);
                                return (
                                  <span key={studentId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {student ? student.name : 'Unknown student'}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-sm text-gray-500">No students assigned</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Questions:</h4>
                          <div className="mt-2 space-y-4">
                            {quiz.questions?.map((question, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {idx + 1}. {question.question}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {question.type === 'single' ? 'Single choice' : 'Multiple choice'}
                                  </span>
                                </div>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {Array.isArray(question.answers) && question.answers.map((answer, ansIdx) => (
                                    <div key={ansIdx} className={`text-sm p-2 rounded-md ${answer.isCorrect ? 'bg-green-100' : 'bg-gray-100'}`}>
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                          {answer.isCorrect ? (
                                            <FaCheck className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <FaTimes className="h-3 w-3 text-gray-500" />
                                          )}
                                        </div>
                                        <div className="ml-2">
                                          {answer.text}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Add/Edit Quiz Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={editingQuiz || initialValues}
                        validationSchema={quizSchema}
                        onSubmit={handleSubmitQuiz}
                      >
                        {({ values, isSubmitting, setFieldValue }) => (
                          <Form className="space-y-6">
                            {/* Quiz Title */}
                            <div>
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Quiz Title</label>
                              <Field
                                type="text"
                                name="title"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                              <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            {/* Quiz Description */}
                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                              <Field
                                as="textarea"
                                name="description"
                                rows={2}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            {/* Quiz Settings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                                <Field
                                  type="number"
                                  name="timeLimit"
                                  min="1"
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                />
                                <ErrorMessage name="timeLimit" component="div" className="mt-1 text-sm text-red-600" />
                              </div>
                              
                              <div>
                                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                                <Field
                                  type="number"
                                  name="passingScore"
                                  min="0"
                                  max="100"
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                />
                                <ErrorMessage name="passingScore" component="div" className="mt-1 text-sm text-red-600" />
                              </div>
                            </div>
                            
                            {/* Student Assignment */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Assign Students</label>
                              <div className="mt-1">
                                <ErrorMessage name="assignedStudentIds" component="div" className="mt-1 text-sm text-red-600" />
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {assignedStudents.map(student => (
                                    <div key={student.id} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id={`student-${student.id}`}
                                        checked={values.assignedStudentIds?.includes(student.id)}
                                        onChange={() => {
                                          const currentAssignments = values.assignedStudentIds || [];
                                          const newAssignments = currentAssignments.includes(student.id)
                                            ? currentAssignments.filter(id => id !== student.id)
                                            : [...currentAssignments, student.id];
                                          
                                          setFieldValue('assignedStudentIds', newAssignments);
                                        }}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor={`student-${student.id}`} className="ml-2 text-sm text-gray-700">
                                        {student.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                {assignedStudents.length === 0 && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    You don't have any assigned students yet.
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Questions */}
                            <div>
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">Questions</label>
                              </div>
                              <ErrorMessage name="questions" component="div" className="mt-1 text-sm text-red-600" />
                              
                              <FieldArray name="questions">
                                {({ remove, push }) => (
                                  <div className="space-y-4 mt-2">
                                    {values.questions && values.questions.map((question, index) => (
                                      <div key={index} className="border border-gray-300 rounded-md p-4">
                                        <div className="flex justify-between items-center mb-3">
                                          <h4 className="text-sm font-medium text-gray-700">Question {index + 1}</h4>
                                          {values.questions.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => remove(index)}
                                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                                            >
                                              <FaTrash className="mr-1" /> Remove
                                            </button>
                                          )}
                                        </div>
                                        
                                        <div className="space-y-3">
                                          {/* Question Text */}
                                          <div>
                                            <label htmlFor={`questions.${index}.question`} className="block text-sm font-medium text-gray-700">Question Text</label>
                                            <Field
                                              name={`questions.${index}.question`}
                                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            />
                                            <ErrorMessage name={`questions.${index}.question`} component="div" className="mt-1 text-xs text-red-600" />
                                          </div>
                                          
                                          {/* Question Type */}
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700">Question Type</label>
                                            <Field
                                              as="select"
                                              name={`questions.${index}.type`}
                                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                            >
                                              <option value="single">Single Choice</option>
                                              <option value="multiple">Multiple Choice</option>
                                            </Field>
                                          </div>
                                          
                                          {/* Answers */}
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700">Answers</label>
                                            <ErrorMessage name={`questions.${index}.answers`} component="div" className="mt-1 text-xs text-red-600" />
                                            
                                            {Array.isArray(question.answers) && question.answers.map((answer, answerIndex) => (
                                              <div key={answerIndex} className="flex items-center mt-2">
                                                <Field
                                                  name={`questions.${index}.answers.${answerIndex}.text`}
                                                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                  placeholder={`Answer ${answerIndex + 1}`}
                                                />
                                                
                                                <div className="ml-2 flex items-center">
                                                  <input
                                                    type={question.type === 'single' ? 'radio' : 'checkbox'}
                                                    checked={answer.isCorrect}
                                                    onChange={() => {
                                                      if (question.type === 'single') {
                                                        // For single choice, only one correct answer
                                                        const newAnswers = [...question.answers];
                                                        newAnswers.forEach((ans, idx) => {
                                                          newAnswers[idx] = {
                                                            ...ans,
                                                            isCorrect: idx === answerIndex
                                                          };
                                                        });
                                                        setFieldValue(`questions.${index}.answers`, newAnswers);
                                                      } else {
                                                        // For multiple choice, toggle this answer
                                                        setFieldValue(
                                                          `questions.${index}.answers.${answerIndex}.isCorrect`,
                                                          !answer.isCorrect
                                                        );
                                                      }
                                                    }}
                                                    className={question.type === 'single' 
                                                      ? "h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" 
                                                      : "h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                                    }
                                                  />
                                                  <label className="ml-1 block text-xs text-gray-700">
                                                    Correct
                                                  </label>
                                                </div>
                                                
                                                {question.answers.length > 2 && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const newAnswers = [...question.answers];
                                                      newAnswers.splice(answerIndex, 1);
                                                      setFieldValue(`questions.${index}.answers`, newAnswers);
                                                    }}
                                                    className="ml-2 text-red-600 hover:text-red-800"
                                                  >
                                                    <FaTrash />
                                                  </button>
                                                )}
                                              </div>
                                            ))}
                                            
                                            {Array.isArray(question.answers) && question.answers.length < 6 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newAnswers = [...question.answers, { 
                                                    id: Date.now().toString(), 
                                                    text: '', 
                                                    isCorrect: false 
                                                  }];
                                                  setFieldValue(`questions.${index}.answers`, newAnswers);
                                                }}
                                                className="mt-2 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                              >
                                                <FaPlus className="mr-1" /> Add Answer Option
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    <button
                                      type="button"
                                      onClick={() => push({
                                        question: '',
                                        type: 'single',
                                        answers: [
                                          { id: '1', text: '', isCorrect: false },
                                          { id: '2', text: '', isCorrect: false },
                                          { id: '3', text: '', isCorrect: false },
                                          { id: '4', text: '', isCorrect: false }
                                        ]
                                      })}
                                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                      <FaPlus className="mr-1" /> Add Question
                                    </button>
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                            
                            {/* Form Buttons */}
                            <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddModal(false);
                                  setEditingQuiz(null);
                                }}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                {isSubmitting ? 'Saving...' : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
                              </button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
