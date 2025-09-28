// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import { useAuth } from "@/context/AuthContext";

// interface Address {
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// interface Doctor {
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   address: Address;
//   phone: string;
//   specialization: string;
//   licenseNumber: string;
// }

// // Extended AuthContextType to include doctors and setDoctors
// interface ExtendedAuthContextType {
//   user: any;
//   doctors?: Doctor[];
//   setDoctors?: (doctors: Doctor[]) => void;
// }

// function Profile() {
//   const { user, doctors, setDoctors } = useAuth() as ExtendedAuthContextType;
//   const navigate = useNavigate();

//   // Debug log to check state
//   useEffect(() => {
//     console.log("Doctors state:", doctors);
//     if (!doctors || doctors.length === 0) {
//       console.log("No doctors found, checking localStorage");
//       const savedDoctors = localStorage.getItem("doctors");
//       if (savedDoctors) {
//         const parsedDoctors = JSON.parse(savedDoctors) as Doctor[];
//         if (setDoctors) {
//           setDoctors(parsedDoctors);
//           console.log("Doctors loaded from localStorage into context:", parsedDoctors);
//         } else {
//           localStorage.setItem("doctors", savedDoctors); // Ensure fallback persists
//           console.log("Doctors loaded from localStorage:", parsedDoctors);
//         }
//       } else {
//         console.log("No saved doctors in localStorage");
//       }
//     }
//   }, [doctors, setDoctors]);

//   // Save doctors to localStorage (fallback)
//   useEffect(() => {
//     if (doctors) {
//       localStorage.setItem("doctors", JSON.stringify(doctors));
//     }
//   }, [doctors]);

//   const handleDelete = (email: string) => {
//     if (doctors && setDoctors) {
//       const updatedDoctors = doctors.filter((doc) => doc.email !== email);
//       setDoctors(updatedDoctors);
//       toast.success("Doctor deleted successfully!");
//     } else {
//       console.error("Cannot delete: doctors or setDoctors is undefined");
//     }
//   };

//   const handleUpdate = (doc: Doctor) => {
//     navigate("/admin-dashboard/users/doctors"); // Redirect to DoctorManagement for editing
//     console.log("Redirecting to update doctor:", doc);
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Admin Profile</h1>
//       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         {/* Admin Profile Section */}
//         <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
//           <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Admin Details</h2>
//           <p className="text-gray-600 dark:text-gray-400">
//             Email: <span className="font-medium">{user?.email || "maleesharashani@gmail.com"}</span>
//           </p>
//           <p className="text-gray-600 dark:text-gray-400">
//             Role: <span className="font-medium">Admin</span>
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
//             Last Updated: 11:43 AM +0530, September 28, 2025
//           </p>
//         </div>

//         {/* Doctors Table */}
//         <div>
//           <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Registered Doctors</h2>
//           {(!doctors || doctors.length === 0) ? (
//             <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
//               No doctors registered yet. Add one from <a href="/admin-dashboard/users/doctors" className="text-blue-600 hover:underline">Doctor Management</a>.
//             </p>
//           ) : (
//             <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
//               <thead>
//                 <tr className="bg-gray-200 dark:bg-gray-700">
//                   <th className="border p-2 text-left">Email</th>
//                   <th className="border p-2 text-left">Name</th>
//                   <th className="border p-2 text-left">Phone</th>
//                   <th className="border p-2 text-left">Specialization</th>
//                   <th className="border p-2 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {doctors.map((doc) => (
//                   <tr key={doc.email} className="border-t">
//                     <td className="border p-2">{doc.email}</td>
//                     <td className="border p-2">{`${doc.firstName} ${doc.lastName}`}</td>
//                     <td className="border p-2">{doc.phone}</td>
//                     <td className="border p-2">{doc.specialization}</td>
//                     <td className="border p-2">
//                       <button
//                         onClick={() => handleUpdate(doc)}
//                         className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
//                       >
//                         Update
//                       </button>
//                       <button
//                         onClick={() => handleDelete(doc.email)}
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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Doctor {
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

function Profile() {
  const { user, doctors, setDoctors, patients, setPatients } = useAuth() as ExtendedAuthContextType;
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Profile component rendered at 11:49 AM +0530, September 28, 2025");
    if (!doctors || doctors.length === 0) {
      const savedDoctors = localStorage.getItem("doctors");
      if (savedDoctors) {
        const parsedDoctors = JSON.parse(savedDoctors) as Doctor[];
        if (setDoctors) setDoctors(parsedDoctors);
      }
    }
    if (!patients || patients.length === 0) {
      const savedPatients = localStorage.getItem("patients");
      if (savedPatients) {
        const parsedPatients = JSON.parse(savedPatients) as Patient[];
        if (setPatients) setPatients(parsedPatients);
      }
    }
  }, [doctors, setDoctors, patients, setPatients]);

  useEffect(() => {
    if (doctors) localStorage.setItem("doctors", JSON.stringify(doctors));
    if (patients) localStorage.setItem("patients", JSON.stringify(patients));
  }, [doctors, patients]);

  const handleDeleteDoctor = (email: string) => {
    if (doctors && setDoctors) {
      const updatedDoctors = doctors.filter((doc) => doc.email !== email);
      setDoctors(updatedDoctors);
      toast.success("Doctor deleted successfully!");
    }
  };

  const handleUpdateDoctor = (doc: Doctor) => {
    navigate("/admin-dashboard/users/doctors");
    console.log("Redirecting to update doctor:", doc);
  };

  const handleDeletePatient = (email: string) => {
    if (patients && setPatients) {
      const updatedPatients = patients.filter((pat) => pat.email !== email);
      setPatients(updatedPatients);
      toast.success("Patient deleted successfully!");
    }
  };

  const handleUpdatePatient = (pat: Patient) => {
    navigate("/admin-dashboard/users/patients");
    console.log("Redirecting to update patient:", pat);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Admin Profile</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Admin Details</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Email: <span className="font-medium">{user?.email || "maleesharashani@gmail.com"}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Role: <span className="font-medium">Admin</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Last Updated: 11:49 AM +0530, September 28, 2025
          </p>
        </div>

        {/* Doctors Table */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Registered Doctors</h2>
          {(!doctors || doctors.length === 0) ? (
            <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              No doctors registered yet. Add one from <a href="/admin-dashboard/users/doctors" className="text-blue-600 hover:underline">Doctor Management</a>.
            </p>
          ) : (
            <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Phone</th>
                  <th className="border p-2 text-left">Specialization</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.email} className="border-t">
                    <td className="border p-2">{doc.email}</td>
                    <td className="border p-2">{`${doc.firstName} ${doc.lastName}`}</td>
                    <td className="border p-2">{doc.phone}</td>
                    <td className="border p-2">{doc.specialization}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleUpdateDoctor(doc)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.email)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Patients Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Registered Patients</h2>
          {(!patients || patients.length === 0) ? (
            <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              No patients registered yet. Add one from <a href="/admin-dashboard/users/patients" className="text-blue-600 hover:underline">Patient Management</a>.
            </p>
          ) : (
            <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Phone</th>
                  <th className="border p-2 text-left">Health Card ID</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((pat) => (
                  <tr key={pat.email} className="border-t">
                    <td className="border p-2">{pat.email}</td>
                    <td className="border p-2">{`${pat.firstName} ${pat.lastName}`}</td>
                    <td className="border p-2">{pat.phone}</td>
                    <td className="border p-2">{pat.healthCardId}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleUpdatePatient(pat)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeletePatient(pat.email)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;