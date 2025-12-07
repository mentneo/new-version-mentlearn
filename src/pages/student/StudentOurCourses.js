import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LearnIQNavbar from '../../components/student/LearnIQNavbar.js';

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
			console.error('Failed to load courses', err);
			setError('Failed to load courses.');
		} finally {
			setLoading(false);
		}
	};

	const handleBuyNow = async (courseId) => {
		// Navigate to the checkout page (same as PublicCoursesPage)
		navigate(`/courses/${courseId}/checkout`);
	};

	if (loading) return <div className="p-8">Loading courses...</div>;
	if (error) return <div className="p-8">{error}</div>;

	return (
			<div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
				<LearnIQNavbar />
				<div className="flex-1 overflow-y-auto">
					<div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
						<h1 className="text-4xl font-bold mb-4 text-gray-900">All Courses</h1>
						<p className="text-gray-600 mb-6">Browse our catalog and purchase a course to get started.</p>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{courses.map((course, index) => (
								<div
									key={course.id}
									className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group flex flex-col"
								>
									<div className="relative h-48 overflow-hidden">
										{course.thumbnailUrl ? (
											<img
												src={course.thumbnailUrl}
												alt={course.title}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
												<span className="text-white font-bold">No Image</span>
											</div>
										)}
									</div>

									<div className="p-6 flex-1 flex flex-col">
										{course.category && (
											<span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full mb-3">
												{course.category}
											</span>
										)}

										<h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h2>
										<p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
										<div className="mt-auto">
											<div className="flex items-center justify-between mb-4">
												<div className="text-lg font-semibold text-gray-900">₹{course.price || 0}</div>
												<div className="text-sm text-gray-500">{course.enrollments || 0} enrolled</div>
											</div>

											<button
												onClick={() => handleBuyNow(course.id)}
												className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md"
											>
												Buy Now
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
	);
};

export default StudentOurCourses;
