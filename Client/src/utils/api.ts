const BASE_URL = "http://localhost:3002/api";

//------------------------ Auth APIs ----------------------

export interface FormData {
  email: string;
  password: string;
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
interface UserStatusData {
  isActive?: boolean;
  isVerified?: boolean;
}

interface UserRoleData {
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

// login
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (userData: FormData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const verifyEmail = async (pin: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    console.log("Verify Email Response Status:", response.status); // Debug log

    // Clone the response to read the body multiple times
    const responseClone = response.clone();
    const responseText = await responseClone.text(); // Read raw text for debugging
    console.log("Verify Email Response Text:", responseText);

    if (!response.ok) {
      throw new Error(
        `Verification failed with status ${response.status}: ${responseText}`
      );
    }

    const data = await response.json(); // Read JSON
    return data; // Returns { status: 'success', message: 'Email verified successfully' }
  } catch (error) {
    console.error("Verification error:", error);
    throw error instanceof Error
      ? error
      : new Error("Email verification failed");
  }
};

// get profile
export const getProfile = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};

// update profile
export const updateProfile = async (userData: Partial<FormData>) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
};

// get all users (for admin)
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/auth/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch all users error:", error);
    throw error;
  }
};

// get user by id (for admin)
export const getUserById = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch user by ID error:", error);
    throw error;
  }
};

// update user (for admin)
export const updateUser = async (
  userId: string,
  userData: Partial<FormData & { password?: string; confirmPassword?: string }>
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

// delete user (for admin)
export const deleteUser = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

// get update user status (for admin)
export const updateUserStatus = async (
  userId: string,
  statusData: UserStatusData
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/auth/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user status");
    }

    return await response.json();
  } catch (error) {
    console.error("Update user status error:", error);
    throw error;
  }
};

// update user role (for admin)
export const updateUserRole = async (
  userId: string,
  roleData: UserRoleData
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/auth/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user role");
    }

    return await response.json();
  } catch (error) {
    console.error("Update user role error:", error);
    throw error;
  }
};

//------------------------ Consultation APIs ----------------------

interface DiagnosisCode {
  code: string;
  description: string;
}

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
}

interface ClinicalNotes {
  subjective?: string;
  objective?: string;
}

interface ConsultationData {
  patient: string;
  doctor: string;
  consultationDate: string;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  diagnosis?: DiagnosisCode[];
  medications?: Medication[];
  clinicalNotes?: ClinicalNotes;
  recommendedTests?: string[];
}

interface TestName {
  name: string;
}

interface Drug {
  id: string;
  name: string;
  dosageForms: string[];
  frequencyOptions: string[];
}

interface SearchQuery {
  query: string;
  maxResults?: number;
}

// Get all patients (for doctors)
export const getAllPatients = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/consult/patients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch patients");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch all patients error:", error);
    throw error;
  }
};

// Add a new consultation
export const addConsultation = async (consultationData: ConsultationData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(consultationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Create a more detailed error message that includes validation errors
      let errorMessage = errorData.message || "Failed to add consultation";
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors
          .map((err: any) => `${err.param}: ${err.msg}`)
          .join(", ");
        errorMessage += `. Validation errors: ${validationErrors}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Add consultation error:", error);
    throw error;
  }
};

// Search diagnosis codes
export const searchDiagnosisCodes = async ({
  query,
  maxResults = 10,
}: SearchQuery) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!query) {
      throw new Error("Query parameter is required");
    }

    const response = await fetch(
      `${BASE_URL}/consult/search-diagnosis?query=${encodeURIComponent(
        query
      )}&maxResults=${maxResults}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search diagnosis codes");
    }

    return await response.json();
  } catch (error) {
    console.error("Search diagnosis codes error:", error);
    throw error;
  }
};

// Search test names
export const searchTestNames = async ({
  query,
  maxResults = 10,
}: SearchQuery) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!query) {
      throw new Error("Query parameter is required");
    }

    const response = await fetch(
      `${BASE_URL}/consult/search-tests?query=${encodeURIComponent(
        query
      )}&maxResults=${maxResults}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search test names");
    }

    return await response.json();
  } catch (error) {
    console.error("Search test names error:", error);
    throw error;
  }
};

// Search drugs
export const searchDrugs = async ({ query, maxResults = 10 }: SearchQuery) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!query) {
      throw new Error("Query parameter is required");
    }

    const response = await fetch(
      `${BASE_URL}/consult/search-drugs?query=${encodeURIComponent(
        query
      )}&maxResults=${maxResults}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search drugs");
    }

    return await response.json();
  } catch (error) {
    console.error("Search drugs error:", error);
    throw error;
  }
};

// Get consultations by patient ID
export const getConsultationsByPatient = async (patientId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/consult/patient/${patientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch consultations");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch consultations by patient error:", error);
    throw error;
  }
};

// Update a consultation
export const updateConsultation = async (
  id: string,
  consultationData: Partial<ConsultationData>
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/consultations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(consultationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Create a more detailed error message that includes validation errors
      let errorMessage = errorData.message || "Failed to update consultation";
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors
          .map((err: any) => `${err.param}: ${err.msg}`)
          .join(", ");
        errorMessage += `. Validation errors: ${validationErrors}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Update consultation error:", error);
    throw error;
  }
};

// Delete a consultation
export const deleteConsultation = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/consultations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete consultation");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete consultation error:", error);
    throw error;
  }
};

// helper to build Authorization headers from the stored token

// ---------------- Appointment APIs ----------------

export async function getSpecialties() {
  const r = await fetch(`${BASE_URL}/appointments/specialties`);
  if (!r.ok) throw new Error("Failed to load specialties");
  return r.json();
}

export async function getDoctorsBySpecialty(s: string) {
  const r = await fetch(
    `${BASE_URL}/appointments/doctors?specialty=${encodeURIComponent(s)}`
  );
  if (!r.ok) throw new Error("Failed to load doctors");
  return r.json();
}

export async function getSlots(doctorId: string, dateISO?: string) {
  const r = await fetch(
    `${BASE_URL}/appointments/slots?doctorId=${doctorId}${
      dateISO ? `&date=${dateISO}` : ""
    }`
  );
  if (!r.ok) throw new Error("Failed to load slots");
  return r.json();
}

export async function createAppointment(doctorId: string, slotId: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const r = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ doctorId, slotId }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to create appointment");
  }
  return r.json();
}

export async function payAppointment(appointmentId: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const r = await fetch(`${BASE_URL}/appointments/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ appointmentId }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.message || "Payment failed");
  }
  return r.json();
}

// Patient's appointments (requires Authorization)
export async function getMyAppointments() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const r = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(
      err?.message ||
        (r.status === 401 ? "Unauthorized" : "Failed to load appointments")
    );
  }
  return r.json(); // { data: [...] }
}

// Profile management APIs
export async function getMe() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const r = await fetch(`${BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!r.ok) throw new Error("Failed to load user");
  const j = await r.json();
  return j.data ?? j;
}

export async function updateMe(payload: any) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const r = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Failed to update user");
  const j = await r.json();
  return j.data ?? j;
}

export async function uploadAvatar(file: File) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const fd = new FormData();
  fd.append("avatar", file);
  const r = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });
  if (!r.ok) throw new Error("Failed to upload avatar");
  const j = await r.json();
  return j.data ?? j; // { avatarUrl }
}

export async function changePassword(payload: {
  oldPassword: string;
  newPassword: string;
}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const r = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Password change failed");
  return r.json();
}

// Logout helper
export async function logout() {
  // Clear token
  localStorage.removeItem("token");
  // Clear profile data
  localStorage.removeItem("user");
}
