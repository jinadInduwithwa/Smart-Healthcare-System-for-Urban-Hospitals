// import { useState } from "react";
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

// function PatientManagement() {
//   const { setPatients } = useAuth() as any; // Type assertion until AuthContext is updated
//   const navigate = useNavigate();
//   const [patient, setPatient] = useState<Patient>({
//     email: "j@gmail.com",
//     role: "PATIENT",
//     firstName: "John",
//     lastName: "Doe",
//     address: {
//       street: "123 Main Street",
//       city: "New York",
//       state: "NY",
//       zipCode: "10001",
//       country: "USA",
//     },
//     phone: "+1234567890",
//     isVerified: false,
//     roleDocumentId: "671c8f1a4b5c2d3e4f5a6b7d",
//     healthCardId: "HC-123456",
//     dateOfBirth: "1990-01-01",
//     gender: "Male",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     if (name.startsWith("address.")) {
//       const field = name.split(".")[1];
//       setPatient((prev) => ({
//         ...prev,
//         address: { ...prev.address, [field]: value },
//       }));
//     } else {
//       setPatient((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const newPatient = { ...patient };
//       const savedPatients = localStorage.getItem("patients");
//       const patients = savedPatients ? JSON.parse(savedPatients) as Patient[] : [];
//       patients.push(newPatient);
//       localStorage.setItem("patients", JSON.stringify(patients));
//       if (setPatients) setPatients(patients); // Update context if available
//       toast.success("Patient added successfully!");
//       navigate("/admin-dashboard/profile"); // Redirect to profile to see the table
//     } catch (error) {
//       toast.error("Failed to add patient. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add New Patient</h1>
//       <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={patient.email}
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
//               value={patient.firstName}
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
//               value={patient.lastName}
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
//               value={patient.phone}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
//             <input
//               type="date"
//               name="dateOfBirth"
//               value={patient.dateOfBirth}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
//             <select
//               name="gender"
//               value={patient.gender}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             >
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street</label>
//             <input
//               type="text"
//               name="address.street"
//               value={patient.address.street}
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
//               value={patient.address.city}
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
//               value={patient.address.state}
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
//               value={patient.address.zipCode}
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
//               value={patient.address.country}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Document ID</label>
//             <input
//               type="text"
//               name="roleDocumentId"
//               value={patient.roleDocumentId}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Health Card ID</label>
//             <input
//               type="text"
//               name="healthCardId"
//               value={patient.healthCardId}
//               onChange={handleChange}
//               className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verified</label>
//             <input
//               type="checkbox"
//               name="isVerified"
//               checked={patient.isVerified}
//               onChange={(e) => setPatient((prev) => ({ ...prev, isVerified: e.target.checked }))}
//               className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
//             />
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "Adding..." : "Add Patient"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default PatientManagement;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { addPatient, updatePatient, deletePatient, getPatients } from "@/utils/api";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Patient {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  address: Address;
  phone: string;
  isVerified: boolean;
  healthCardId: string;
  dateOfBirth: string;
  gender: string;
}

function PatientManagement() {
  const { setPatients } = useAuth() as any; // Type assertion until AuthContext is updated
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "PATIENT",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    phone: "",
    isVerified: false,
    healthCardId: "",
    dateOfBirth: "",
    gender: "",
  });
  const [patients, setPatientsState] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      console.log("Fetching patients with token:", token); // Debug log
      const data = await getPatients(token);
      console.log("Fetch patients response:", data); // Debug log
      setPatientsState(data.data.patients || []);
      if (setPatients) setPatients(data.data.patients || []); // Sync with AuthContext
    } catch (error) {
      console.error("Fetch patients error:", error);
      if (error instanceof Error && error.message === "Token is not valid") {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Failed to fetch patients");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setPatient((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setPatient((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      console.log("Submitting patient data:", patient); // Debug log
      console.log("Token used:", token); // Debug log

      if (editId) {
        const updatedPatient = await updatePatient(editId, patient, token);
        console.log("Update patient response:", updatedPatient); // Debug log
        setPatientsState((prev) =>
          prev.map((p) => (p._id === editId ? updatedPatient.data.patient : p))
        );
        if (setPatients) {
          const updatedPatients = patients.map((p) =>
            p._id === editId ? updatedPatient.data.patient : p
          );
          setPatients(updatedPatients);
        }
        toast.success("Patient updated successfully!");
      } else {
        const newPatient = await addPatient(patient, token);
        console.log("Add patient response:", newPatient); // Debug log
        setPatientsState((prev) => [...prev, newPatient.data.patient]);
        if (setPatients) {
          const updatedPatients = [...patients, newPatient.data.patient];
          setPatients(updatedPatients);
          localStorage.setItem("patients", JSON.stringify(updatedPatients));
        }
        toast.success("Patient added successfully!");
      }

      setPatient({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "PATIENT",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        phone: "",
        isVerified: false,
        healthCardId: "",
        dateOfBirth: "",
        gender: "",
      });
      setEditId(null);
      await fetchPatients(); // Refresh the list
      navigate("/admin-dashboard/profile");
    } catch (error) {
      console.error("Submit error:", error);
      if (error instanceof Error && error.message === "Token is not valid") {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error((error as Error).message || "Failed to save patient");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (patientToEdit: Patient) => {
    setPatient(patientToEdit);
    setEditId(patientToEdit._id || null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        console.log("Deleting patient with id:", id); // Debug log
        await deletePatient(id, token);
        setPatientsState(patients.filter((p) => p._id !== id));
        if (setPatients) {
          const updatedPatients = patients.filter((p) => p._id !== id);
          setPatients(updatedPatients);
          localStorage.setItem("patients", JSON.stringify(updatedPatients));
        }
        toast.success("Patient deleted successfully!");
      } catch (error) {
        console.error("Delete patient error:", error);
        if (error instanceof Error && error.message === "Token is not valid") {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error((error as Error).message || "Failed to delete patient");
        }
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add Patient</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={patient.email}
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
              value={patient.password}
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
              value={patient.firstName}
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
              value={patient.lastName}
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
              value={patient.phone}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Health Card ID</label>
            <input
              type="text"
              name="healthCardId"
              value={patient.healthCardId}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={patient.dateOfBirth}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
            <select
              name="gender"
              value={patient.gender}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street</label>
            <input
              type="text"
              name="address.street"
              value={patient.address.street}
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
              value={patient.address.city}
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
              value={patient.address.state}
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
              value={patient.address.zipCode}
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
              value={patient.address.country}
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
          {isSubmitting ? (editId ? "Updating..." : "Adding...") : editId ? "Update Patient" : "Add Patient"}
        </button>
      </form>
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Patient List</h2>
        <ul>
          {patients.map((pat) => (
            <li
              key={pat._id}
              className="flex justify-between items-center p-2 border-b dark:border-gray-700"
            >
              <span>{pat.firstName} {pat.lastName}</span>
              <div>
                <button
                  onClick={() => handleEdit(pat)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pat._id!)}
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

export default PatientManagement;