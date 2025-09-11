import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEdit, FaCamera, FaTrash, FaUpload } from 'react-icons/fa';
import { uploadImageWithFallback } from '../../utils/cloudinary';

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
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Creator Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="m-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="m-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

                    <div className="p-4 sm:p-6">
            {/* Profile Image Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
                <div className="relative mb-4 sm:mb-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {(profile.profileImage || imagePreview) ? (
                      <img
                        src={imagePreview || profile.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaCamera className="text-gray-400 text-xl sm:text-2xl" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-indigo-700 touch-manipulation"
                        title="Upload new image"
                      >
                        <FaUpload className="text-xs" />
                      </button>
                      {profile.profileImage && (
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="bg-red-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-700 touch-manipulation"
                          title="Remove image"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">{profile.name || 'Creator'}</h3>
                  <p className="text-sm text-gray-500">{profile.specialization || 'Specialization not set'}</p>
                  {isEditing && imagePreview && (
                    <div className="mt-3 sm:mt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={imageUploading}
                        className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 touch-manipulation"
                      >
                        {imageUploading ? 'Uploading...' : 'Save Image'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 touch-manipulation"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
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
                onSubmit={handleUpdateProfile}
              >
                {({ handleSubmit, isSubmitting }) => (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <Field
                          type="text"
                          name="name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <Field
                          type="text"
                          name="phone"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                        <Field
                          type="text"
                          name="specialization"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <ErrorMessage name="specialization" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
                        <Field
                          type="text"
                          name="experience"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <ErrorMessage name="experience" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                      <Field
                        as="textarea"
                        name="bio"
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
                        <Field
                          type="text"
                          name="linkedIn"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <ErrorMessage name="linkedIn" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Personal Website</label>
                        <Field
                          type="text"
                          name="website"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <ErrorMessage name="website" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Image Display */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mx-auto sm:mx-0 mb-4 sm:mb-0">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaCamera className="text-gray-400 text-xl sm:text-2xl" />
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900">{profile.name}</h3>
                    <p className="text-sm text-gray-500">{profile.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.specialization}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.experience}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                  <p className="mt-1 text-sm text-gray-900 leading-relaxed">{profile.bio}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {profile.linkedIn && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">LinkedIn Profile</h3>
                      <a
                        href={profile.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 break-all"
                      >
                        {profile.linkedIn}
                      </a>
                    </div>
                  )}

                  {profile.website && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Personal Website</h3>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 break-all"
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
