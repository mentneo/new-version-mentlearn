import React, { useState } from 'react';

const QuizForm = ({ onSubmit, initialData = {} }) => {
  const [quizTitle, setQuizTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [questions, setQuestions] = useState(initialData.questions || [
    { 
      question: '', 
      type: 'multiple-choice',
      answers: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: ''
    }
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
    const updatedQuestions = [...questions];
    
    // If changing the isCorrect field, update all other answers to be false
    if (field === 'isCorrect' && value === true) {
      updatedQuestions[questionIndex].answers.forEach((answer, idx) => {
        if (idx !== answerIndex) {
          answer.isCorrect = false;
        }
      });
    }
    
    updatedQuestions[questionIndex].answers[answerIndex][field] = value;
    
    // If marking an answer as correct, also update the correctAnswer field
    if (field === 'isCorrect' && value === true) {
      updatedQuestions[questionIndex].correctAnswer = updatedQuestions[questionIndex].answers[answerIndex].text;
    }
    
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'multiple-choice',
        answers: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate quiz - ensure all questions have content and a correct answer
    const isValid = questions.every(q => {
      return q.question.trim() !== '' && 
        q.answers.some(a => a.isCorrect) &&
        q.answers.every(a => a.text.trim() !== '');
    });

    if (!isValid) {
      setErrorMsg('Please complete all questions and mark correct answers');
      return;
    }

    if (!quizTitle.trim()) {
      setErrorMsg('Please provide a quiz title');
      return;
    }

    onSubmit({
      title: quizTitle,
      description,
      questions
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Quiz</h2>
      
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter quiz title"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter quiz description"
            rows="3"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Questions</h3>
          
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-bold">Question {questionIndex + 1}</h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter question"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">
                  Answer Options
                </label>
                {question.answers.map((answer, answerIndex) => (
                  <div key={answerIndex} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={answer.isCorrect}
                      onChange={() => handleAnswerChange(questionIndex, answerIndex, 'isCorrect', true)}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(questionIndex, answerIndex, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      placeholder={`Answer option ${answerIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            + Add Question
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
