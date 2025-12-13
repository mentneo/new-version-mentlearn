import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext.js';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEdit, FaCamera, FaTrash, FaUpload } from 'react-icons/fa/index.esm.js';
import { uploadImageWithFallback } from '../../utils/cloudinary.js';

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string().required('Phone number is required'),
  specialization: Yup.string().required('Specialization is required'),
  experience: Yup.string().required('Experience is required'),
  bio: Yup.string().required('Bio is required'),
  linkedIn: Yup.string().url('Must be a valid URL'),
  website: Yup.string().url('Must be a valid URL')
});

export default function CreatorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const creatorQuery = doc(db, 'creators', currentUser.uid);
      const creatorDoc = await getDoc(creatorQuery);

      if (creatorDoc.exists()) {
        setProfile(creatorDoc.data());
      } else {
        // Create a new creator profile if it doesn't exist
        const newProfile = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: '',
          specialization: '',
          experience: '',
          bio: '',
          linkedIn: '',
          website: '',
          profileImage: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(creatorQuery, newProfile);
        setProfile(newProfile);
        setSuccess('Profile created successfully!');
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    try {
      const creatorRef = doc(db, 'creators', currentUser.uid);
      await updateDoc(creatorRef, {
        name: values.name,
        phone: values.phone,
        specialization: values.specialization,
        experience: values.experience,
        bio: values.bio,
        linkedIn: values.linkedIn,
        website: values.website,
        profileImage: values.profileImage,
        updatedAt: new Date().toISOString()
      });

      setSuccess('Profile updated successfully!');
      setProfile(values);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current?.files[0]) return;

    setImageUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const imageUrl = await uploadImageWithFallback(file, currentUser.uid);

      const creatorRef = doc(db, 'creators', currentUser.uid);
      await updateDoc(creatorRef, {
        profileImage: imageUrl,
        updatedAt: new Date().toISOString()
      });

      setProfile(prev => ({ ...prev, profileImage: imageUrl }));
      setImagePreview(null);
      setSuccess('Profile image updated successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      const creatorRef = doc(db, 'creators', currentUser.uid);
      await updateDoc(creatorRef, {
        profileImage: null,
        updatedAt: new Date().toISOString()
      });

      setProfile(prev => ({ ...prev, profileImage: null }));
      setImagePreview(null);
      setSuccess('Profile image removed successfully!');
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You must be logged in to access this page.
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Unable to load or create profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            My Profile
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your professional information and settings
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-indigo-100">
                  {isEditing ? 'Update your details below' : 'View and manage your profile'}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            {/* Profile Image Section */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center border-4 border-white shadow-xl ring-2 ring-indigo-100">
                    {(profile.profileImage || imagePreview) ? (
                      <img
                        src={imagePreview || profile.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaCamera className="text-indigo-300 text-4xl sm:text-5xl" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        title="Upload new image"
                      >
                        <FaUpload className="text-sm" />
                      </button>
                      {profile.profileImage && (
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          title="Remove image"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{profile.name || 'Creator'}</h3>
                  <p className="text-lg text-gray-600 mt-2 font-medium">{profile.specialization || 'Specialization not set'}</p>
                  <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                  {isEditing && imagePreview && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={imageUploading}
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        {imageUploading ? 'Uploading...' : 'Save Image'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {isEditing ? (
              <Formik
                initialValues={{
                  name: profile.name || '',
                  phone: profile.phone || '',
                  specialization: profile.specialization || '',
                  experience: profile.experience || '',
                  bio: profile.bio || '',
                  linkedIn: profile.linkedIn || '',
                  website: profile.website || '',
                  profileImage: profile.profileImage || ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleUpdateProfile}8">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                          <Field
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                          />
                          <ErrorMessage name="name" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                          <Field
                            type="text"
                            name="phone"
                            placeholder="+1 (555) 123-4567"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                          />
                          <ErrorMessage name="phone" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                        </div>
                        <div>
                          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">Specialization <span className="text-red-500">*</span></label>
                          <Field
                            type="text"
                            name="specialization"
                            placeholder="e.g., Web Development, Data Science"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                          />
                          <ErrorMessage name="specialization" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                        </div>
                        <div>
                          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">Experience <span className="text-red-500">*</span></label>
                          <Field
                            type="text"
                            name="experience"
                            placeholder="e.g., 5+ years"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                          />
                          <ErrorMessage name="experience" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Bio</h3>
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">About You <span className="text-red-500">*</span></label>
                        <Field
                          as="textarea"
                          name="bio"
                          rows={5}
                          placeholder="Tell us about your background, expertise, and what you're passionate about teaching..."
                          className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all resize-none"
                        />
                        <ErrorMessage name="bio" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                          <Field
                            type="text"
                            name="linkedIn"
                            placeholder="https://linkedin.com/in/your-profile"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                          />
                          <ErrorMessage name="linkedIn" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                        </div>
                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Personal Website</label>
                          <Field
                            type="text"
                            name="website"
                            placeholder="https://yourwebsite.com"
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                          />
                          <ErrorMessage name="website" component="div" className="mt-2 text-sm text-red-600 font-medium" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
                     ersonal Information Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-gray-900 truncate">{profile.email}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.experience || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Professional Details
                  </h3>
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specialization</p>
                    <p className="text-xl font-bold text-purple-600">{profile.specialization || 'Not provided'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-5 shadow-sm mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Professional Bio</p>
                    <p className="text-base text-gray-700 leading-relaxed">{profile.bio || 'No bio provided yet.'}</p>
                  </div>
                </div>

                {/* Social Links Section */}
                {(profile.linkedIn || profile.website) && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Social & Professional Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.linkedIn && (
                        <a
                          href={profile.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">LinkedIn Profile</p>
                          <p className="text-sm text-blue-600 group-hover:text-blue-700 font-medium truncate flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            View Profile
                          </p>
                        </a>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal Website</p>
                          <p className="text-sm text-blue-600 group-hover:text-blue-700 font-medium truncate flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            Visit Website
                          </p>
                        </a>
                      )}
                    </div>
                  </div>
                )}lassName="mt-1 text-lg text-gray-900 leading-relaxed">{profile.bio}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {profile.linkedIn && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-500">LinkedIn Profile</h3>
                      <a
                        href={profile.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-lg text-indigo-600 hover:text-indigo-500 break-all"
                      >
                        {profile.linkedIn}
                      </a>
                    </div>
                  )}
                  {profile.website && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-500">Personal Website</h3>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-lg text-indigo-600 hover:text-indigo-500 break-all"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
