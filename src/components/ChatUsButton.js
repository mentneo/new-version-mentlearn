import React from 'react';
import { Link } from 'react-router-dom';
import { FaComments } from 'react-icons/fa/index.esm.js';

const ChatUsButton = () => {
  return (
    <Link
      to="/chat-us"
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center space-x-2"
    >
      <FaComments className="text-xl" />
      <span className="hidden sm:block font-semibold">Chat Us</span>
    </Link>
  );
};

export default ChatUsButton;
