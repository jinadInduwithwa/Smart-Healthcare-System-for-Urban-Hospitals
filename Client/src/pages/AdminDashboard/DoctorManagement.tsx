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

function DoctorManagement() {
  useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor>({
    email: "doctor@gmail.com",
    
    firstName: "Jane",
    lastName: "Smith",
    role: "DOCTOR",
    address: {
      street: "456 Oak Street",
      city: "Boston",
      state: "MA",
      zipCode: "02108",
      country: "USA",
    },
    phone: "+1987654321",
    specialization: "Cardiology",
    licenseNumber: "LN987654",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
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
      // Mock API call - replace with real endpoint (e.g., POST http://localhost:3002/api/doctors)
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 1000)
      );
      if (response) {
        toast.success("Doctor added successfully!");
        navigate("/admin-dashboard/users");
      }
    } catch (error) {
      toast.error("Failed to add doctor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add New Doctor</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          {isSubmitting ? "Adding..." : "Add Doctor"}
        </button>
      </form>
    </div>
  );
}

export default DoctorManagement;