import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.js';
import CreatorProfile from './CreatorProfile';

// Mock Firebase
jest.mock('../../firebase/firebase.js', () => ({
  db: {},
  storage: {}
}));

describe('CreatorProfile Component', () => {
  const mockCurrentUser = {
    uid: 'test-uid',
    displayName: 'Test Creator',
    email: 'test@example.com',
    photoURL: 'https://via.placeholder.com/150',
  };
  
  const mockAuthContext = {
    currentUser: mockCurrentUser,
    logout: jest.fn()
  };

  it('renders profile information correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <CreatorProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check if profile displays user information
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders menu items', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <CreatorProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check if menu items are rendered
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('My Courses')).toBeInTheDocument();
    expect(screen.getByText('Revenue & Analytics')).toBeInTheDocument();
    expect(screen.getByText('Manage Quizzes & Assignments')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications Sent')).toBeInTheDocument();
    expect(screen.getByText('Invite a Friend / Collaborator')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});