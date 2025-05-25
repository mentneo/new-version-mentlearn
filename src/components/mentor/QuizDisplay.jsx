import React from 'react';
import { safeRender, renderQuizAnswers } from '../../utils/renderUtils';
import { withSafeQuizRendering } from './QuizRenderSafe';

const QuizDisplay = ({ quiz }) => {
  return (
    <div className="quiz-container">
      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>
      
      <div className="questions-list">
        {quiz.questions?.map((question, qIndex) => (
          <div key={qIndex} className="question-item">
            <h3>{question.question}</h3>
            
            <div className="answers-list">
              {/* Use the safe answers array */}
              {question.answers?.map((answer, aIndex) => (
                <div key={aIndex} className="answer-option">
                  {safeRender(answer)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Wrap component with safe rendering HOC
export default withSafeQuizRendering(QuizDisplay);
