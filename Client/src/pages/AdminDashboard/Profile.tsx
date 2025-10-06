// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import { useAuth } from "@/context/AuthContext";
// import { getDoctors, deleteDoctor } from "@/utils/api";

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
//       const data = await getDoctors(token);
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
//           await deleteDoctor(doctorToDelete._id, token);
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

//         {/* Doctors Table */}
//         <div className="mb-6">
//           <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Registered Doctors</h2>
//           {doctors && doctors.length > 0 ? (
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
//                         onClick={() => handleUpdateDoctor(doc)}
//                         className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
//                       >
//                         Update
//                       </button>
//                       <button
//                         onClick={() => handleDeleteDoctor(doc.email)}
//                         className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
//               No doctors registered yet. Add one from{" "}
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
//               No patients registered yet. Add one from{" "}
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
import { getDoctors, deleteDoctor } from "@/utils/api"; // Added deleteDoctor import

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
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const data = await getDoctors(token); // Fetches from http://localhost:3002/api/doctors
      if (setDoctors) setDoctors(data.data.doctors || []);
    } catch (error) {
      console.error("Fetch doctors error:", error);
      toast.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [setDoctors]);

  useEffect(() => {
    if (doctors) localStorage.setItem("doctors", JSON.stringify(doctors));
    if (patients) localStorage.setItem("patients", JSON.stringify(patients));
  }, [doctors, patients]);

  const handleDeleteDoctor = async (email: string) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        if (!doctors) throw new Error("No doctors data available");
        const doctorToDelete = doctors.find((doc) => doc.email === email);
        if (doctorToDelete?._id) {
          await deleteDoctor(doctorToDelete._id, token); // Using the imported deleteDoctor function
          if (setDoctors) {
            const updatedDoctors = doctors.filter((doc) => doc.email !== email);
            setDoctors(updatedDoctors);
            toast.success("Doctor deleted successfully!");
          }
        } else {
          throw new Error("Doctor not found");
        }
      } catch (error) {
        console.error("Delete doctor error:", error);
        toast.error((error as Error).message || "Failed to delete doctor");
      }
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

  if (loading) {
    return <div className="p-6 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

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

        {/* Registered Doctors Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Registered Doctors</h2>
          {doctors && doctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Email</th>
                    <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Name</th>
                    <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Phone</th>
                    <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Specialization</th>
                    <th className="border p-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc._id || doc.email} className="border-t hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{doc.email}</td>
                      <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{`${doc.firstName} ${doc.lastName}`}</td>
                      <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{doc.phone}</td>
                      <td className="border p-3 text-sm text-gray-900 dark:text-gray-100">{doc.specialization}</td>
                      <td className="border p-3 text-sm">
                        <button
                          onClick={() => handleUpdateDoctor(doc)}
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 text-sm"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc.email)}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              No doctors registered yet. Add one from{" "}
              <a href="/admin-dashboard/users/doctors" className="text-blue-600 hover:underline">
                Doctor Management
              </a>.
            </p>
          )}
        </div>

        {/* Patients Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Registered Patients</h2>
          {(!patients || patients.length === 0) ? (
            <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              No patients registered yet. Add one from{" "}
              <a href="/admin-dashboard/users/patients" className="text-blue-600 hover:underline">
                Patient Management
              </a>.
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
                {patients?.map((pat) => (
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