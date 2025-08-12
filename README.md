# MentNeo Learning Platform

MentNeo is a comprehensive online learning platform that connects students with expert mentors to build successful tech careers. This platform provides structured learning paths, one-on-one mentoring, and hands-on projects to help students develop real-world skills.

## Features

- **Role-based Access**: Separate dashboards and features for students, mentors, and administrators
- **Course Management**: Admins can create and manage courses, while students can enroll and track progress
- **Quiz System**: Mentors can create and assign quizzes to assess student knowledge
- **Mentor Reports**: Detailed feedback system for personalized student guidance
- **Authentication**: Secure user authentication with role-based permissions
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

- **Frontend**: React.js with React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage for course materials and user uploads
- **Hosting**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mentneo/new-version-mentlearn.git
cd new-version-mentlearn
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Set up storage rules
5. Deploy the Firebase security rules in `firestore.rules` and `storage.rules`

## Project Structure

```
├── public/               # Static files
├── src/
│   ├── api/              # API integration functions
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable components
│   │   ├── admin/        # Admin-specific components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared components
│   │   ├── layouts/      # Layout components
│   │   ├── mentor/       # Mentor-specific components
│   │   └── student/      # Student-specific components
│   ├── contexts/         # React context providers
│   ├── firebase/         # Firebase configuration
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin pages
│   │   ├── auth/         # Authentication pages
│   │   ├── mentor/       # Mentor pages
│   │   ├── payment/      # Payment pages
│   │   └── student/      # Student pages
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
└── package.json          # Project dependencies
```

## User Roles

### Student
- Access learning materials
- Take quizzes
- View progress and reports
- Interact with mentors

### Mentor
- Create and assign quizzes
- Provide feedback and reports
- View student progress
- Manage assigned students

### Admin
- Manage courses and content
- Manage users (students and mentors)
- View platform analytics
- Verify payments

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

MentNeo Team - contact@mentneo.com

Project Link: [https://github.com/mentneo/new-version-mentlearn](https://github.com/mentneo/new-version-mentlearn)
