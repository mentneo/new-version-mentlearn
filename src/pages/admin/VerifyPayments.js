import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Card, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import AdminNavbar from '../../components/admin/AdminNavbar';
import '../../styles/PaymentStyles.css';

const VerifyPayments = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      
      // Query users with pending verification
      const pendingUsersQuery = query(
        collection(db, 'users'), 
        where('verificationStatus', '==', 'pending'),
        where('paymentCompleted', '==', true)
      );
      
      const pendingUsersSnapshot = await getDocs(pendingUsersQuery);
      
      const pendingUsers = [];
      
      // For each pending user, get their payment information
      for (const userDoc of pendingUsersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Get payments for this user
        const paymentsQuery = query(
          collection(db, 'payments'), 
          where('userId', '==', userDoc.id),
          orderBy('timestamp', 'desc')
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        if (!paymentsSnapshot.empty) {
          const paymentData = paymentsSnapshot.docs[0].data();
          
          pendingUsers.push({
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || 'Not provided',
            paymentId: paymentData.paymentId,
            amount: paymentData.amount,
            paymentDate: paymentData.timestamp?.toDate() || new Date(),
            planId: paymentData.planId || 'complete',
            orderId: paymentData.orderId
          });
        }
      }
      
      setPendingVerifications(pendingUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      setError('Failed to load pending verifications. Please try again.');
      setLoading(false);
    }
  };

  const handleApprove = async (userId, planId) => {
    try {
      setRefreshing(true);
      
      // Update user document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verificationStatus: 'approved',
        accessGranted: true,
        accessLevel: planId === 'basic' ? 'basic' : 'full',
        verifiedAt: serverTimestamp(),
        verifiedBy: 'admin' // In a real system, use the admin's ID
      });
      
      // Update enrollment status
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('status', '==', 'pending_verification')
      );
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      for (const enrollDoc of enrollmentsSnapshot.docs) {
        await updateDoc(doc(db, 'enrollments', enrollDoc.id), {
          status: 'active',
          verifiedAt: serverTimestamp()
        });
      }
      
      // Refresh the data
      fetchPendingVerifications();
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleReject = async (userId) => {
    try {
      setRefreshing(true);
      
      // Update user document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verificationStatus: 'rejected',
        accessGranted: false,
        rejectedAt: serverTimestamp(),
        rejectedBy: 'admin' // In a real system, use the admin's ID
      });
      
      // Update enrollment status
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('status', '==', 'pending_verification')
      );
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      for (const enrollDoc of enrollmentsSnapshot.docs) {
        await updateDoc(doc(db, 'enrollments', enrollDoc.id), {
          status: 'rejected',
          rejectedAt: serverTimestamp()
        });
      }
      
      // Refresh the data
      fetchPendingVerifications();
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Failed to reject user. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredVerifications = pendingVerifications.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <Card className="shadow-sm payment-container">
          <Card.Header className="payment-header text-white d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Verify Student Payments</h2>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={fetchPendingVerifications}
              disabled={loading || refreshing}
              className="ms-2"
            >
              {refreshing ? <Spinner size="sm" animation="border" /> : <i className="bi bi-arrow-clockwise"></i>} Refresh
            </Button>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form className="mb-4">
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, email or payment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Form>
            
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-3">Loading pending verifications...</p>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <Alert variant="info">
                {searchTerm ? "No results match your search." : "No pending verifications found."}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Payment Details</th>
                      <th>Plan</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVerifications.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div><strong>{user.name}</strong></div>
                          <div className="text-muted small">{user.email}</div>
                          <div className="text-muted small">{user.phone}</div>
                        </td>
                        <td>
                          <div><Badge bg="info">₹{user.amount}</Badge></div>
                          <div className="small mt-1">ID: {user.paymentId}</div>
                          <div className="small">Order: {user.orderId}</div>
                        </td>
                        <td>
                          <Badge bg={user.planId === 'complete' ? 'primary' : 'secondary'}>
                            {user.planId === 'complete' ? 'Complete Bundle' : 'Basic Plan'}
                          </Badge>
                        </td>
                        <td>{user.paymentDate.toLocaleString()}</td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleApprove(user.id, user.planId)}
                              disabled={refreshing}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleReject(user.id)}
                              disabled={refreshing}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default VerifyPayments;
