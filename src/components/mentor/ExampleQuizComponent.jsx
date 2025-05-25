import React from 'react';
import { withSafeQuiz } from '../SafeQuiz';
import { safeRender } from '../../utils/renderUtils';

const ExampleQuizComponent = ({ quiz }) => {
  return (
    <div className="quiz-container">
      <h2>{quiz.title}</h2>
      
      {quiz.questions?.map((question, qIndex) => (
        <div key={qIndex} className="question-container">
          <h3>Question {qIndex + 1}: {safeRender(question.question)}</h3>
          
          <ul className="answers-list">
            {Array.isArray(question.answers) && question.answers.map((answer, aIndex) => (
              <li key={aIndex}>{safeRender(answer)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Wrap with safe quiz HOC
export default withSafeQuiz(ExampleQuizComponent);
