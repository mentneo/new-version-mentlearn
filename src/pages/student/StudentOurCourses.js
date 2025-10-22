import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LearnIQNavbar from '../../components/student/LearnIQNavbar.js';
import { getAuth } from "firebase/auth";

// Razorpay key (use env in production)
const RAZORPAY_KEY = 'rzp_live_RFqLLkkteSLfOY';

const StudentOurCourses = () => {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchCourses();
	}, []);

	const fetchCourses = async () => {
		try {
			setLoading(true);
			const coursesRef = collection(db, 'courses');
			const snapshot = await getDocs(coursesRef);
			const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setCourses(courseList);
		} catch (err) {
			setError('Failed to load courses.');
		} finally {
			setLoading(false);
		}
	};

	// Load Razorpay script
	const loadRazorpayScript = () => {
		return new Promise((resolve) => {
			if (window.Razorpay) return resolve(true);
			const script = document.createElement('script');
			script.src = 'https://checkout.razorpay.com/v1/checkout.js';
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	// Buy Now handler
	const handleBuyNow = async (courseId, price) => {
		const scriptLoaded = await loadRazorpayScript();
		if (!scriptLoaded) {
			alert('Failed to load payment gateway.');
			return;
		}

		// Get Firebase ID token
		const auth = getAuth();
		const user = auth.currentUser;
		let idToken = null;
		if (user) {
			idToken = await user.getIdToken();
		}

		// Call backend to create order
		let order;
		try {
			const res = await fetch('http://localhost:5001/api/payment/create-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
				},
				body: JSON.stringify({ courseId })
			});
			const data = await res.json();
			order = data.order;
			if (!order) {
				alert(data.error || 'Failed to create payment order. Please check if the course exists and try again.');
				return;
			}
		} catch (err) {
			alert('Failed to create payment order.');
			return;
		}

		const options = {
			key: RAZORPAY_KEY,
			amount: order.amount,
			currency: order.currency,
			name: 'Mentneo Courses',
			description: 'Course Payment',
			order_id: order.id,
			handler: function (response) {
				// On payment success, redirect to success page
				navigate(`/student/course-payment-success?courseId=${courseId}&paymentId=${response.razorpay_payment_id}`);
			},
			prefill: {},
			theme: { color: '#4F46E5' }
		};
		const rzp = new window.Razorpay(options);
		rzp.open();
	};

	if (loading) return <div>Loading courses...</div>;
	if (error) return <div>{error}</div>;

	return (
		<div className="min-h-screen bg-gray-50">
			<LearnIQNavbar />
			<div className="max-w-7xl mx-auto py-10 px-4">
				<h1 className="text-3xl font-bold mb-6">All Courses</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{courses.map(course => (
						<div key={course.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
							<img src={course.thumbnailUrl || 'https://via.placeholder.com/150?text=No+Image'} alt={course.title} className="h-40 w-full object-cover rounded mb-4" />
							<h2 className="text-xl font-bold mb-2">{course.title}</h2>
							<p className="text-gray-600 mb-2">{course.description}</p>
							<p className="text-green-700 font-semibold mb-2">Price: ₹{course.price || 0}</p>
							<button
								onClick={() => handleBuyNow(course.id, course.price)}
								className="mt-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
							>
								Buy Now
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default StudentOurCourses;
