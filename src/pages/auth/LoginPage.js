import React from 'react';
import Logo from '../../components/common/Logo';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img className="h-16 w-auto" src="/mentneo-logo.png" alt="Mentneo" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        {/* ...existing login form... */}
      </div>
    </div>
  );
};

export default LoginPage;