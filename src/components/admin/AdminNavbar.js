import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const AdminNavbar = () => {
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending verification count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const pendingUsersQuery = query(
          collection(db, 'users'), 
          where('verificationStatus', '==', 'pending'),
          where('paymentCompleted', '==', true)
        );
        
        const unsubscribe = onSnapshot(pendingUsersQuery, (snapshot) => {
          setPendingCount(snapshot.docs.length);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching pending verifications:', error);
      }
    };

    fetchPendingCount();
  }, []);

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/admin/dashboard">
          MentLearn Admin
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/courses">Courses</Nav.Link>
            <Nav.Link as={Link} to="/admin/students">Students</Nav.Link>
            <Nav.Link as={Link} to="/admin/mentors">Mentors</Nav.Link>
            <Nav.Link as={Link} to="/admin/enrollments">Enrollments</Nav.Link>
            <Nav.Link as={Link} to="/admin/verify-payments" className="text-warning">
              Verify Payments
              {pendingCount > 0 && (
                <Badge bg="danger" pill className="ms-1">
                  {pendingCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;