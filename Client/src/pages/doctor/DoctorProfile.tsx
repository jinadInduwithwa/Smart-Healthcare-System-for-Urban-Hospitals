
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import * as Yup from 'yup';
import { getUserById, updateUser } from '@/utils/api';
import { IoCamera } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';

interface FormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}


const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string(),
  email: Yup.string().email('Invalid email').required('Email is required'),
  role: Yup.string().oneOf(["PATIENT", "DOCTOR", "ADMIN"], 'Invalid role').required('Role is required'),
  address: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('Zip code is required'),
    country: Yup.string().required('Country is required'),
  }),
});

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Partial<FormData>>({
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [files, setFiles] = useState<{ profilePhoto: File | null }>({ profilePhoto: null });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated || !user?.id) {
        toast.error('Please log in to view your profile');
        navigate('/signin');
        return;
      }
      try {
        const userData = await getUserById(user.id);
        setFormData({
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || 'DOCTOR', 
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
        });
        setIsLoading(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch user details');
        console.error('Error fetching user:', error);
        setIsLoading(false); 
      }
    };

    fetchUser();
  }, [navigate, isAuthenticated, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1] as keyof FormData['address'];
      setFormData({
        ...formData,
        address: { ...formData.address!, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await validationSchema.validate(formData, { abortEarly: false });

      if (!isAuthenticated || !user?.id) {
        throw new Error('Authentication required');
      }

      // Exclude password from update since it's not editable here
      const { password, ...dataToUpdate } = formData;
      const updatedUser = await updateUser(user.id, dataToUpdate as Partial<FormData> & { profilePhoto?: File });
      setFormData(updatedUser);
      setFiles({ profilePhoto: null });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.message || 'Failed to update profile');
        console.error('Update error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-gray-900 dark:text-gray-100">Loading...</div>;

  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-col p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-700 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex w-full flex-col px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/Home/doctor_avatar.jpg"
                alt="Doctor Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                <IoCamera size={18} />
                <input
                  type="file"
                  name="profilePhoto"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Dr. User'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{formData.email}</p>
            <div className="mt-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs sm:text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {errors.firstName && <p className="text-red-500 text-xs sm:text-sm">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {errors.email && <p className="text-red-500 text-xs sm:text-sm">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {errors.role && <p className="text-red-500 text-xs sm:text-sm">{errors.role}</p>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Address Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address!.street || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {errors['address.street'] && <p className="text-red-500 text-xs sm:text-sm">{errors['address.street']}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address!.city || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                  {errors['address.city'] && <p className="text-red-500 text-xs sm:text-sm">{errors['address.city']}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address!.state || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                  {errors['address.state'] && <p className="text-red-500 text-xs sm:text-sm">{errors['address.state']}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address!.zipCode || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {errors['address.zipCode'] && <p className="text-red-500 text-xs sm:text-sm">{errors['address.zipCode']}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address!.country || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {errors['address.country'] && <p className="text-red-500 text-xs sm:text-sm">{errors['address.country']}</p>}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 sm:mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default DoctorProfile;
