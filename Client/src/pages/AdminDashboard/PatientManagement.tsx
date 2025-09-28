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
//   useAuth();
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
//       // Mock API call - replace with real endpoint (e.g., POST http://localhost:3002/api/patients)
//       const response = await new Promise((resolve) =>
//         setTimeout(() => resolve({ status: "success", message: "User registered successfully. Please check your email for verification code." }), 1000)
//       );
//       if (response) {
//         toast.success("Patient added successfully!");
//         navigate("/admin-dashboard/users");
//       }
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

import { useState } from "react";
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

function PatientManagement() {
  const { setPatients } = useAuth() as any; // Type assertion until AuthContext is updated
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient>({
    email: "j@gmail.com",
    role: "PATIENT",
    firstName: "John",
    lastName: "Doe",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    phone: "+1234567890",
    isVerified: false,
    roleDocumentId: "671c8f1a4b5c2d3e4f5a6b7d",
    healthCardId: "HC-123456",
    dateOfBirth: "1990-01-01",
    gender: "Male",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const newPatient = { ...patient };
      const savedPatients = localStorage.getItem("patients");
      const patients = savedPatients ? JSON.parse(savedPatients) as Patient[] : [];
      patients.push(newPatient);
      localStorage.setItem("patients", JSON.stringify(patients));
      if (setPatients) setPatients(patients); // Update context if available
      toast.success("Patient added successfully!");
      navigate("/admin-dashboard/profile"); // Redirect to profile to see the table
    } catch (error) {
      toast.error("Failed to add patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add New Patient</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Document ID</label>
            <input
              type="text"
              name="roleDocumentId"
              value={patient.roleDocumentId}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verified</label>
            <input
              type="checkbox"
              name="isVerified"
              checked={patient.isVerified}
              onChange={(e) => setPatient((prev) => ({ ...prev, isVerified: e.target.checked }))}
              className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Patient"}
        </button>
      </form>
    </div>
  );
}

export default PatientManagement;