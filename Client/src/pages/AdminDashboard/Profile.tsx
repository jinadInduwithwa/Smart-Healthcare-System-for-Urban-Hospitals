// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import { useAuth } from "@/context/AuthContext";
// import { getDoctors, deleteDoctor } from "@/utils/api"; // Added deleteDoctor import

// interface Address {
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// interface Doctor {
//   _id?: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   address: Address;
//   phone: string;
//   specialization: string;
//   licenseNumber: string;
// }

// interface Patient {
//   email: string;
//   role: string;
//   firstName: string;
//   lastName: string;
//   address: Address;
//   phone: string;
//   isVerified: boolean;
//   roleDocumentId: string;
//   healthCardId: string;
//   dateOfBirth: string;
//   gender: string;
// }

// interface ExtendedAuthContextType {
//   user: any;
//   doctors?: Doctor[];
//   setDoctors?: (doctors: Doctor[]) => void;
//   patients?: Patient[];
//   setPatients?: (patients: Patient[]) => void;
// }

// function Profile() {
//   const { user, doctors, setDoctors, patients, setPatients } = useAuth() as ExtendedAuthContextType;
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   const fetchDoctors = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");
//       const data = await getDoctors(token); // Fetches from http://localhost:3002/api/doctors
//       if (setDoctors) setDoctors(data.data.doctors || []);
//     } catch (error) {
//       console.error("Fetch doctors error:", error);
//       toast.error("Failed to fetch doctors");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDoctors();
//   }, [setDoctors]);

//   useEffect(() => {
//     if (doctors) localStorage.setItem("doctors", JSON.stringify(doctors));
//     if (patients) localStorage.setItem("patients", JSON.stringify(patients));
//   }, [doctors, patients]);

//   const handleDeleteDoctor = async (email: string) => {
//     if (window.confirm("Are you sure you want to delete this doctor?")) {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) throw new Error("No authentication token found");
//         if (!doctors) throw new Error("No doctors data available");
//         const doctorToDelete = doctors.find((doc) => doc.email === email);
//         if (doctorToDelete?._id) {
//           await deleteDoctor(doctorToDelete._id, token); // Using the imported deleteDoctor function
//           if (setDoctors) {
//             const updatedDoctors = doctors.filter((doc) => doc.email !== email);
//             setDoctors(updatedDoctors);
//             toast.success("Doctor deleted successfully!");
//           }
//         } else {
//           throw new Error("Doctor not found");
//         }
//       } catch (error) {
//         console.error("Delete doctor error:", error);
//         toast.error((error as Error).message || "Failed to delete doctor");
//       }
//     }
//   };

//   const handleUpdateDoctor = (doc: Doctor) => {
//     navigate("/admin-dashboard/users/doctors");
//     console.log("Redirecting to update doctor:", doc);
//   };

//   const handleDeletePatient = (email: string) => {
//     if (patients && setPatients) {
//       const updatedPatients = patients.filter((pat) => pat.email !== email);
//       setPatients(updatedPatients);
//       toast.success("Patient deleted successfully!");
//     }
//   };

//   const handleUpdatePatient = (pat: Patient) => {
//     navigate("/admin-dashboard/users/patients");
//     console.log("Redirecting to update patient:", pat);
//   };

//   if (loading) {
//     return <div className="p-6 text-gray-900 dark:text-gray-100">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Admin Profile</h1>
//       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
//           <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Admin Details</h2>
//           <p className="text-gray-600 dark:text-gray-400">
//             Email: <span className="font-medium">{user?.email || "maleesharashani@gmail.com"}</span>
//           </p>
//           <p className="text-gray-600 dark:text-gray-400">
//             Role: <span className="font-medium">Admin</span>
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
//             Last Updated: 11:49 AM +0530, September 28, 2025
//           </p>
//         </div>

//         {/* Registered Doctors Section */}
//         <div className="mb-6">
//           <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Registered Doctors</h2>
//           {doctors && doctors.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
//                 <thead>
//                   <tr className="bg-gray-200 dark:bg-gray-700">
//                     <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Email</th>
//                     <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Name</th>
//                     <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Phone</th>
//                     <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Specialization</th>
//                     <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {doctors.map((doc) => (
//                     <tr key={doc._id || doc.email} className="border-t hover:bg-gray-100 dark:hover:bg-gray-700">
//                       <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{doc.email}</td>
//                       <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{`${doc.firstName} ${doc.lastName}`}</td>
//                       <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{doc.phone}</td>
//                       <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{doc.specialization}</td>
//                       <td className="border p-3 text-sm">
//                         <button
//                           onClick={() => handleUpdateDoctor(doc)}
//                           className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 text-sm"
//                         >
//                           Update
//                         </button>
//                         <button
//                           onClick={() => handleDeleteDoctor(doc.email)}
//                           className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
//                Add one from{" "}
//               <a href="/admin-dashboard/users/doctors" className="text-blue-600 hover:underline">
//                 Doctor Management
//               </a>.
//             </p>
//           )}
//         </div>

//         {/* Patients Table */}
//         <div>
//           <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Registered Patients</h2>
//           {(!patients || patients.length === 0) ? (
//             <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
//                Add one from{" "}
//               <a href="/admin-dashboard/users/patients" className="text-blue-600 hover:underline">
//                 Patient Management
//               </a>.
//             </p>
//           ) : (
//             <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
//               <thead>
//                 <tr className="bg-gray-200 dark:bg-gray-700">
//                   <th className="border p-2 text-left">Email</th>
//                   <th className="border p-2 text-left">Name</th>
//                   <th className="border p-2 text-left">Phone</th>
//                   <th className="border p-2 text-left">Health Card ID</th>
//                   <th className="border p-2 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {patients?.map((pat) => (
//                   <tr key={pat.email} className="border-t">
//                     <td className="border p-2">{pat.email}</td>
//                     <td className="border p-2">{`${pat.firstName} ${pat.lastName}`}</td>
//                     <td className="border p-2">{pat.phone}</td>
//                     <td className="border p-2">{pat.healthCardId}</td>
//                     <td className="border p-2">
//                       <button
//                         onClick={() => handleUpdatePatient(pat)}
//                         className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
//                       >
//                         Update
//                       </button>
//                       <button
//                         onClick={() => handleDeletePatient(pat.email)}
//                         className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Profile;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { deleteDoctor, updateDoctor, updatePatient } from "@/utils/api";
import { BASE_URL } from '@/utils/api';

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
  firstName: string;
  lastName: string;
  role: string;
  address: Address;
  phone: string;
  specialization: string;
  licenseNumber: string;
}

interface Patient {
  _id?: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  address: Address;
  phone: string;
  isVerified: boolean;
  roleDocumentId: string;
  healthCardId: string;
  dateOfBirth: string;
  gender: string;
}

interface ExtendedAuthContextType {
  user: any;
  doctors?: Doctor[];
  setDoctors?: (doctors: Doctor[]) => void;
  patients?: Patient[];
  setPatients?: (patients: Patient[]) => void;
}

// Doctor Edit Row Component
const DoctorEditRow = ({ 
  doctor, 
  onSave, 
  onCancel, 
  isUpdating 
}: { 
  doctor: Doctor; 
  onSave: (doctor: Doctor) => void; 
  onCancel: () => void;
  isUpdating: boolean;
}) => {
  const [editedDoctor, setEditedDoctor] = useState<Doctor>({ ...doctor });

  const handleSave = () => {
    onSave(editedDoctor);
  };

  const handleChange = (field: string, value: string) => {
    setEditedDoctor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={editedDoctor.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
            placeholder="First Name"
          />
          <input
            type="text"
            value={editedDoctor.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
            placeholder="Last Name"
          />
        </div>
      </td>
      <td className="px-6 py-4">
        <input
          type="email"
          value={editedDoctor.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
          placeholder="Email"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="tel"
          value={editedDoctor.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
          placeholder="Phone"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={editedDoctor.specialization}
          onChange={(e) => handleChange('specialization', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
          placeholder="Specialization"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={editedDoctor.licenseNumber}
          onChange={(e) => handleChange('licenseNumber', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full font-mono"
          placeholder="License Number"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors text-xs"
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors text-xs"
          >
            Cancel
          </button>
        </div>
      </td>
    </>
  );
};

// Patient Edit Row Component
const PatientEditRow = ({ 
  patient, 
  onSave, 
  onCancel, 
  isUpdating 
}: { 
  patient: Patient; 
  onSave: (patient: Patient) => void; 
  onCancel: () => void;
  isUpdating: boolean;
}) => {
  const [editedPatient, setEditedPatient] = useState<Patient>({ ...patient });

  const handleSave = () => {
    onSave(editedPatient);
  };

  const handleChange = (field: string, value: string) => {
    setEditedPatient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={editedPatient.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
            placeholder="First Name"
          />
          <input
            type="text"
            value={editedPatient.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
            placeholder="Last Name"
          />
        </div>
      </td>
      <td className="px-6 py-4">
        <input
          type="email"
          value={editedPatient.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
          placeholder="Email"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="tel"
          value={editedPatient.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
          placeholder="Phone"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={editedPatient.healthCardId}
          onChange={(e) => handleChange('healthCardId', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full font-mono"
          placeholder="Health Card ID"
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="date"
          value={editedPatient.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
        />
      </td>
      <td className="px-6 py-4">
        <select
          value={editedPatient.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <select
          value={editedPatient.isVerified ? 'verified' : 'pending'}
          onChange={(e) => handleChange('isVerified', e.target.value === 'verified' ? 'true' : 'false')}
          className="px-2 py-1 border rounded text-sm w-full"
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors text-xs"
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors text-xs"
          >
            Cancel
          </button>
        </div>
      </td>
    </>
  );
};

function Profile() {
  const { user, doctors, setDoctors, patients, setPatients } = useAuth() as ExtendedAuthContextType;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  
  // State for editing
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all doctors from the same API endpoint used in Overview
  const fetchAllDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      console.log("Fetching all doctors from API...");
      const response = await fetch(`${BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Doctors API response not OK: ${response.status}`);
      }

      const data = await response.json();
      console.log("Doctors API response:", data);
      
      let doctorsList: Doctor[] = [];
      
      // Handle different response formats (same as Overview.tsx)
      if (data.data?.doctors && Array.isArray(data.data.doctors)) {
        doctorsList = data.data.doctors;
      } else if (data.data && Array.isArray(data.data)) {
        doctorsList = data.data;
      } else if (Array.isArray(data)) {
        doctorsList = data;
      } else if (data.doctors && Array.isArray(data.doctors)) {
        doctorsList = data.doctors;
      }
      
      console.log("Processed doctors list:", doctorsList);
      
      // Update both local state and context
      setAllDoctors(doctorsList);
      if (setDoctors) {
        setDoctors(doctorsList);
      }
      
      // Store in localStorage for backup
      localStorage.setItem("doctors", JSON.stringify(doctorsList));
      localStorage.setItem("allDoctorsData", JSON.stringify(doctorsList));
      console.log(`Successfully loaded ${doctorsList.length} doctors`);
      
    } catch (error) {
      console.error("Fetch doctors error:", error);
      
      // Try to get doctors from localStorage as fallback
      try {
        const storedDoctors = localStorage.getItem("doctors") || localStorage.getItem("allDoctorsData");
        if (storedDoctors) {
          const parsedDoctors = JSON.parse(storedDoctors);
          setAllDoctors(parsedDoctors);
          if (setDoctors) {
            setDoctors(parsedDoctors);
          }
          console.log("Using doctors from localStorage:", parsedDoctors);
          toast.success(`Loaded ${parsedDoctors.length} doctors from cache`);
        } else {
          toast.error("Failed to fetch doctors data");
        }
      } catch (localStorageError) {
        console.error("Error getting doctors from localStorage:", localStorageError);
        toast.error("Failed to load doctors data");
      }
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Fetch all patients from the same API endpoint used in Overview
  const fetchAllPatients = async () => {
    try {
      setPatientsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      console.log("Fetching all patients from API...");
      const response = await fetch(`${BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Patients API response not OK: ${response.status}`);
      }

      const data = await response.json();
      console.log("Patients API response:", data);
      
      let patientsList: Patient[] = [];
      
      // Handle different response formats (same as Overview.tsx)
      if (data.data?.patients && Array.isArray(data.data.patients)) {
        patientsList = data.data.patients;
      } else if (data.data && Array.isArray(data.data)) {
        patientsList = data.data;
      } else if (Array.isArray(data)) {
        patientsList = data;
      } else if (data.patients && Array.isArray(data.patients)) {
        patientsList = data.patients;
      }
      
      console.log("Processed patients list:", patientsList);
      
      // Update both local state and context
      setAllPatients(patientsList);
      if (setPatients) {
        setPatients(patientsList);
      }
      
      // Store in localStorage for backup
      localStorage.setItem("patients", JSON.stringify(patientsList));
      localStorage.setItem("allPatientsData", JSON.stringify(patientsList));
      console.log(`Successfully loaded ${patientsList.length} patients`);
      
    } catch (error) {
      console.error("Fetch patients error:", error);
      
      // Try to get patients from localStorage as fallback
      try {
        const storedPatients = localStorage.getItem("patients") || localStorage.getItem("allPatientsData");
        if (storedPatients) {
          const parsedPatients = JSON.parse(storedPatients);
          setAllPatients(parsedPatients);
          if (setPatients) {
            setPatients(parsedPatients);
          }
          console.log("Using patients from localStorage:", parsedPatients);
          toast.success(`Loaded ${parsedPatients.length} patients from cache`);
        } else {
          toast.error("Failed to fetch patients data");
        }
      } catch (localStorageError) {
        console.error("Error getting patients from localStorage:", localStorageError);
        toast.error("Failed to load patients data");
      }
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // First try to load from APIs (same as Overview.tsx)
      await Promise.all([
        fetchAllDoctors(),
        fetchAllPatients()
      ]);
      
      setLoading(false);
    };

    initializeData();
  }, []);

  const handleDeleteDoctor = async (doctorId: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete doctor ${email}?`)) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        
        await deleteDoctor(doctorId, token);
        
        // Update both local state and context
        const updatedDoctors = allDoctors.filter((doc) => doc._id !== doctorId);
        setAllDoctors(updatedDoctors);
        if (setDoctors) {
          setDoctors(updatedDoctors);
        }
        
        localStorage.setItem("doctors", JSON.stringify(updatedDoctors));
        localStorage.setItem("allDoctorsData", JSON.stringify(updatedDoctors));
        toast.success("Doctor deleted successfully!");
      } catch (error) {
        console.error("Delete doctor error:", error);
        toast.error((error as Error).message || "Failed to delete doctor");
      }
    }
  };

  const handleUpdateDoctor = (doctor: Doctor) => {
    console.log("Starting update for doctor:", doctor);
    setEditingDoctor(doctor);
  };

  const handleSaveDoctor = async (updatedDoctor: Doctor) => {
    if (!updatedDoctor._id) {
      toast.error("Doctor ID is missing");
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      console.log("Updating doctor:", updatedDoctor);
      
      // Call update API
      const response = await updateDoctor(updatedDoctor._id, updatedDoctor, token);
      console.log("Update doctor response:", response);

      // Update local state
      const updatedDoctors = allDoctors.map(doc => 
        doc._id === updatedDoctor._id ? { ...response.data.doctor } : doc
      );
      
      setAllDoctors(updatedDoctors);
      if (setDoctors) {
        setDoctors(updatedDoctors);
      }
      
      localStorage.setItem("doctors", JSON.stringify(updatedDoctors));
      localStorage.setItem("allDoctorsData", JSON.stringify(updatedDoctors));
      
      setEditingDoctor(null);
      toast.success("Doctor updated successfully!");
    } catch (error) {
      console.error("Update doctor error:", error);
      toast.error((error as Error).message || "Failed to update doctor");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEditDoctor = () => {
    setEditingDoctor(null);
  };

  const handleDeletePatient = async (patientId: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete patient ${email}?`)) {
      try {
        // Note: You'll need to implement deletePatient API function
        // For now, we'll just update the local state
        const updatedPatients = allPatients.filter((pat) => pat._id !== patientId);
        setAllPatients(updatedPatients);
        if (setPatients) {
          setPatients(updatedPatients);
        }
        
        localStorage.setItem("patients", JSON.stringify(updatedPatients));
        localStorage.setItem("allPatientsData", JSON.stringify(updatedPatients));
        toast.success("Patient deleted successfully!");
      } catch (error) {
        console.error("Delete patient error:", error);
        toast.error((error as Error).message || "Failed to delete patient");
      }
    }
  };

  const handleUpdatePatient = (patient: Patient) => {
    console.log("Starting update for patient:", patient);
    setEditingPatient(patient);
  };

  const handleSavePatient = async (updatedPatient: Patient) => {
    if (!updatedPatient._id) {
      toast.error("Patient ID is missing");
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      console.log("Updating patient:", updatedPatient);
      
      // Call update API
      const response = await updatePatient(updatedPatient._id, updatedPatient, token);
      console.log("Update patient response:", response);

      // Update local state
      const updatedPatients = allPatients.map(pat => 
        pat._id === updatedPatient._id ? { ...response.data.patient } : pat
      );
      
      setAllPatients(updatedPatients);
      if (setPatients) {
        setPatients(updatedPatients);
      }
      
      localStorage.setItem("patients", JSON.stringify(updatedPatients));
      localStorage.setItem("allPatientsData", JSON.stringify(updatedPatients));
      
      setEditingPatient(null);
      toast.success("Patient updated successfully!");
    } catch (error) {
      console.error("Update patient error:", error);
      toast.error((error as Error).message || "Failed to update patient");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEditPatient = () => {
    setEditingPatient(null);
  };

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      fetchAllDoctors(),
      fetchAllPatients()
    ]).finally(() => {
      setLoading(false);
      toast.success("Data refreshed successfully!");
    });
  };

  // Use allDoctors and allPatients for display (they contain the actual data from Overview)
  const displayDoctors = allDoctors.length > 0 ? allDoctors : (doctors || []);
  const displayPatients = allPatients.length > 0 ? allPatients : (patients || []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-gray-100">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and view all registered doctors and patients
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Total: {displayDoctors.length} Doctors, {displayPatients.length} Patients
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {/* Admin Details Section */}
        <div className="mb-8 p-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Admin Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Email:</span> {user?.email || "maleesharashani@gmail.com"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Role:</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Admin</span>
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">System Status:</span> <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Last Updated: {new Date().toLocaleString("en-US", { 
                  timeZone: "Asia/Colombo", 
                  hour12: true,
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Registered Doctors Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Registered Doctors ({displayDoctors.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin-dashboard/users/doctors")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Doctor
              </button>
            </div>
          </div>

          {doctorsLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading doctors...</p>
            </div>
          ) : displayDoctors.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Specialization</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">License Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayDoctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {editingDoctor && editingDoctor._id === doc._id ? (
                        // Edit Mode for Doctor - Only render if editingDoctor is not null
                        <DoctorEditRow 
                          doctor={editingDoctor}
                          onSave={handleSaveDoctor}
                          onCancel={handleCancelEditDoctor}
                          isUpdating={isUpdating}
                        />
                      ) : (
                        // View Mode for Doctor
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {doc.firstName} {doc.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {doc.specialization}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {doc.licenseNumber}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateDoctor(doc)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => doc._id && handleDeleteDoctor(doc._id, doc.email)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-gray-400 text-4xl mb-4">👨‍⚕️</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No doctors registered yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                Start by adding doctors to the system
              </p>
              <button
                onClick={() => navigate("/admin-dashboard/users/doctors")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Doctor
              </button>
            </div>
          )}
        </div>

        {/* Registered Patients Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Registered Patients ({displayPatients.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin-dashboard/users/patients")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Patient
              </button>
            </div>
          </div>

          {patientsLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading patients...</p>
            </div>
          ) : displayPatients.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Health Card ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Date of Birth</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayPatients.map((pat) => (
                    <tr key={pat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {editingPatient && editingPatient._id === pat._id ? (
                        // Edit Mode for Patient - Only render if editingPatient is not null
                        <PatientEditRow 
                          patient={editingPatient}
                          onSave={handleSavePatient}
                          onCancel={handleCancelEditPatient}
                          isUpdating={isUpdating}
                        />
                      ) : (
                        // View Mode for Patient
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {pat.firstName} {pat.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pat.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pat.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {pat.healthCardId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {pat.dateOfBirth ? new Date(pat.dateOfBirth).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {pat.gender || 'Not specified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pat.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pat.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdatePatient(pat)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => pat._id && handleDeletePatient(pat._id, pat.email)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No patients registered yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                Patients will appear here once they register
              </p>
              <button
                onClick={() => navigate("/admin-dashboard/users/patients")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add First Patient
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;