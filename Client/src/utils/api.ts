const BASE_URL = "http://localhost:3002/api";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });


//------------------------ Auth APIs ----------------------

interface FormData {
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
  role: "PATIENT" | "DOCTOR" | "ADMIN" ;
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
      throw new Error(`Verification failed with status ${response.status}: ${responseText}`);
    }

    const data = await response.json(); // Read JSON
    return data; // Returns { status: 'success', message: 'Email verified successfully' }
  } catch (error) {
    console.error("Verification error:", error);
    throw error instanceof Error ? error : new Error("Email verification failed");
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
export const updateUserStatus = async (userId: string, statusData: UserStatusData) => {
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
export const updateUserRole = async (userId: string, roleData: UserRoleData) => {
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

// ---------------- Appointment APIs ----------------
export const getSpecialties = async () => {
  const res = await fetch(`${BASE_URL}/appointments/specialties`);
  if (!res.ok) throw new Error("Failed to load specialties");
  return res.json();
};

export const getDoctorsBySpecialty = async (specialty: string) => {
  const res = await fetch(`${BASE_URL}/appointments/doctors?specialty=${encodeURIComponent(specialty)}`);
  if (!res.ok) throw new Error("Failed to load doctors");
  return res.json();
};

export const getSlots = async (doctorId: string, date?: string) => {
  const qs = new URLSearchParams({ doctorId, ...(date ? { date } : {}) });
  const res = await fetch(`${BASE_URL}/appointments/slots?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to load slots");
  return res.json();
};

export const holdSlot = async (slotId: string) => {
  const res = await fetch(`${BASE_URL}/appointments/hold`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ slotId }),
  });
  if (!res.ok) throw new Error("Slot unavailable");
  return res.json();
};

export const createAppointment = async (doctorId: string, slotId: string) => {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ doctorId, slotId }),
  });
  if (!res.ok) throw new Error("Failed to create appointment");
  return res.json();
};

export const payAppointment = async (appointmentId: string) => {
  const res = await fetch(`${BASE_URL}/appointments/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ appointmentId }),
  });
  if (!res.ok) throw new Error("Payment failed");
  return res.json();
};

// returns: [{ _id, startTime, endTime, isBooked }]
export async function getDoctorSlots(doctorId: string, date: Date) {
  const ymd = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const res = await fetch(
    `${BASE_URL}/appointments/slots?doctorId=${doctorId}&date=${ymd}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
  );
  if (!res.ok) throw new Error("Failed to load time slots");
  const json = await res.json();
  return json.data as Array<{ _id: string; startTime: string; endTime: string }>;
}

export async function getMyAppointments() {
  const res = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load appointments");
  return res.json(); // -> { data: [...] }
}

export async function getMe() {
  const r = await fetch(`${BASE_URL}/users/me`, { headers: authHeaders(), credentials: "include" });
  if (!r.ok) throw new Error("Failed to load user");
  const j = await r.json();
  return j.data ?? j;
}

export async function updateMe(payload: any) {
  const r = await fetch(`${BASE_URL}/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Failed to update user");
  const j = await r.json();
  return j.data ?? j;
}

export async function uploadAvatar(file: File) {
  const fd = new FormData();
  fd.append("avatar", file);
  const r = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: "PUT",
    headers: authHeaders(),
    credentials: "include",
    body: fd,
  });
  if (!r.ok) throw new Error("Failed to upload avatar");
  const j = await r.json();
  return j.data ?? j; // { avatarUrl }
}

export async function changePassword(payload: { oldPassword: string; newPassword: string }) {
  const r = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Password change failed");
  return r.json();
}