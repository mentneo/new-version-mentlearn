import React from 'react';
import { Link } from 'react-router-dom';

const QuizList = ({ quizzes, onDelete }) => {
  return (
    <div className="space-y-4">
      {quizzes.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No quizzes found. Create your first quiz!</p>
        </div>
      ) : (
        quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{quiz.title}</h3>
                <p className="text-gray-600 mt-1">{quiz.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {quiz.questions && (
                    <p>{quiz.questions.length} Questions</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/mentor/quizzes/edit/${quiz.id}`}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(quiz.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Preview questions - make sure we handle answers properly */}
            {quiz.questions && quiz.questions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Preview:</h4>
                <div className="border-t pt-2">
                  <p className="font-medium">{quiz.questions[0].question}</p>
                  <ul className="mt-1 pl-5 list-disc">
                    {/* Make sure we render answers correctly based on their format */}
                    {quiz.questions[0].answers && Array.isArray(quiz.questions[0].answers) && 
                      quiz.questions[0].answers.map((answer, idx) => (
                        <li key={idx} className="text-gray-600">
                          {/* Handle different possible formats of answers */}
                          {typeof answer === 'string' ? answer : answer.text || 'Unknown answer'}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default QuizList;
