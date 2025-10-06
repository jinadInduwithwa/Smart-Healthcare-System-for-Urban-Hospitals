// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import { useAuth } from "@/context/AuthContext";
// import { addDoctor } from "@/utils/api"; // Updated import path

// interface Address {
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// interface Doctor {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   address: Address;
//   phone: string;
//   specialization: string;
//   licenseNumber: string;
// }

// function DoctorManagement() {
//   useAuth(); // Ensures authentication check
//   const navigate = useNavigate();
//   const [doctor, setDoctor] = useState<Doctor>({
//     email: "doctor@gmail.com",
//     password: "securepass123",
//     firstName: "Jane",
//     lastName: "Smith",
//     role: "DOCTOR",
//     address: {
//       street: "456 Oak Street",
//       city: "Boston",
//       state: "MA",
//       zipCode: "02108",
//       country: "USA",
//     },
//     phone: "+1987654321",
//     specialization: "Cardiology",
//     licenseNumber: "LN987654",
//   });
//   const [, setDoctors] = useState<Doctor[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     if (name.startsWith("address.")) {
//       const field = name.split(".")[1];
//       setDoctor((prev) => ({
//         ...prev,
//         address: { ...prev.address, [field]: value },
//       }));
//     } else {
//       setDoctor((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const newDoctor = await addDoctor(doctor, token);
//       setDoctors((prevDoctors) => [...prevDoctors, newDoctor]);
//       toast.success("Doctor added successfully!");
//       navigate("/admin-dashboard/profile");
//     } catch (error: unknown) { // Explicitly type error as unknown
//       const errorMessage = error instanceof Error ? error.message : "Failed to add doctor. Please try again.";
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add New Doctor</h1>
//       <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={doctor.email}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={doctor.password}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
//             <input
//               type="text"
//               name="firstName"
//               value={doctor.firstName}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
//             <input
//               type="text"
//               name="lastName"
//               value={doctor.lastName}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
//             <input
//               type="tel"
//               name="phone"
//               value={doctor.phone}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialization</label>
//             <input
//               type="text"
//               name="specialization"
//               value={doctor.specialization}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Number</label>
//             <input
//               type="text"
//               name="licenseNumber"
//               value={doctor.licenseNumber}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street</label>
//             <input
//               type="text"
//               name="address.street"
//               value={doctor.address.street}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
//             <input
//               type="text"
//               name="address.city"
//               value={doctor.address.city}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
//             <input
//               type="text"
//               name="address.state"
//               value={doctor.address.state}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</label>
//             <input
//               type="text"
//               name="address.zipCode"
//               value={doctor.address.zipCode}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
//             <input
//               type="text"
//               name="address.country"
//               value={doctor.address.country}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "Adding..." : "Add Doctor"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default DoctorManagement;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { addDoctor, updateDoctor, deleteDoctor, getDoctors } from '@/utils/api';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Doctor {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  address: Address;
  phone: string;
  specialization: string;
  licenseNumber: string;
}

function DoctorManagement() {
  useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'DOCTOR',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    phone: '',
    specialization: '',
    licenseNumber: '',
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Fetching doctors with token:', token); // Debug log
      const data = await getDoctors(token);
      console.log('Fetch doctors response:', data); // Debug log
      setDoctors(data.data.doctors || []);
    } catch (error) {
      console.error('Fetch doctors error:', error);
      if (error instanceof Error && error.message === 'Token is not valid') {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Failed to fetch doctors');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setDoctor((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setDoctor((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Submitting doctor data:', doctor); // Debug log
      console.log('Token used:', token); // Debug log

      if (editId) {
        const updatedDoctor = await updateDoctor(editId, doctor, token);
        console.log('Update doctor response:', updatedDoctor); // Debug log
        setDoctors((prev) =>
          prev.map((d) => (d._id === editId ? updatedDoctor.data.doctor : d))
        );
        toast.success('Doctor updated successfully!');
      } else {
        const newDoctor = await addDoctor(doctor, token);
        console.log('Add doctor response:', newDoctor); // Debug log
        setDoctors((prev) => [...prev, newDoctor.data.doctor]);
        toast.success('Doctor added successfully!');
      }

      setDoctor({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'DOCTOR',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        phone: '',
        specialization: '',
        licenseNumber: '',
      });
      setEditId(null);
      await fetchDoctors(); // Refresh the list
      navigate('/admin-dashboard/profile');
    } catch (error) {
      console.error('Submit error:', error);
      if (error instanceof Error && (error as Error).message === 'Token is not valid') {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error((error as Error).message || 'Failed to save doctor');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doctorToEdit: Doctor) => {
    setDoctor(doctorToEdit);
    setEditId(doctorToEdit._id || null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        console.log('Deleting doctor with id:', id); // Debug log
        await deleteDoctor(id, token);
        setDoctors(doctors.filter((d) => d._id !== id));
        toast.success('Doctor deleted successfully!');
      } catch (error) {
        console.error('Delete doctor error:', error);
        if (error instanceof Error && (error as Error).message === 'Token is not valid') {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error((error as Error).message || 'Failed to delete doctor');
        }
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add Doctor</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={doctor.email}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={doctor.password}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required={!editId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input
              type="text"
              name="firstName"
              value={doctor.firstName}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={doctor.lastName}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input
              type="tel"
              name="phone"
              value={doctor.phone}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={doctor.specialization}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={doctor.licenseNumber}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street</label>
            <input
              type="text"
              name="address.street"
              value={doctor.address.street}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
            <input
              type="text"
              name="address.city"
              value={doctor.address.city}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
            <input
              type="text"
              name="address.state"
              value={doctor.address.state}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</label>
            <input
              type="text"
              name="address.zipCode"
              value={doctor.address.zipCode}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
            <input
              type="text"
              name="address.country"
              value={doctor.address.country}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? (editId ? 'Updating...' : 'Adding...') : editId ? 'Update Doctor' : 'Add Doctor'}
        </button>
      </form>
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Doctor List</h2>
        <ul>
          {doctors.map((doc) => (
            <li key={doc._id} className="flex justify-between items-center p-2 border-b dark:border-gray-700">
              <span>{doc.firstName} {doc.lastName}</span>
              <div>
                <button
                  onClick={() => handleEdit(doc)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc._id!)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DoctorManagement;