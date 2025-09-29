// src/utils/api.ts

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3002/api").replace(/\/$/, "");

/** Always return a plain string->string map so it's valid HeadersInit */
const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token") ?? "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

// login
export const login = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
};

export const register = async (userData: FormData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw response;
  return response.json();
};

export const verifyEmail = async (pin: string) => {
  const response = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  const text = await response.clone().text(); // debug-friendly
  if (!response.ok) throw new Error(`Verification failed (${response.status}): ${text}`);
  return response.json();
};

// get profile
export const getProfile = async () => {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!response.ok) throw response;
  return response.json();
};

// update profile
export const updateProfile = async (userData: Partial<FormData>) => {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw response;
  return response.json();
};

// get all users (for admin)
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/auth/users`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch users");
  }
  return response.json();
};

// get user by id (for admin)
export const getUserById = async (userId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch user");
  }
  return response.json();
};

// update user (for admin)
export const updateUser = async (
  userId: string,
  userData: Partial<FormData & { password?: string; confirmPassword?: string }>
) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user");
  }
  return response.json();
};

// delete user (for admin)
export const deleteUser = async (userId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete user");
  }
  return response.json();
};

// update user status (for admin)
export const updateUserStatus = async (userId: string, statusData: UserStatusData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/auth/users/${userId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(statusData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user status");
  }
  return response.json();
};

// update user role (for admin)
export const updateUserRole = async (userId: string, roleData: UserRoleData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/auth/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(roleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user role");
  }
  return response.json();
};

// ---------------- Appointment APIs ----------------

export async function getSpecialties() {
  const r = await fetch(`${BASE_URL}/appointments/specialties`);
  if (!r.ok) throw new Error("Failed to load specialties");
  return r.json();
}

export async function getDoctorsBySpecialty(s: string) {
  const r = await fetch(`${BASE_URL}/appointments/doctors?specialty=${encodeURIComponent(s)}`);
  if (!r.ok) throw new Error("Failed to load doctors");
  return r.json();
}

export async function getSlots(doctorId: string, dateISO?: string) {
  const r = await fetch(
    `${BASE_URL}/appointments/slots?doctorId=${doctorId}${dateISO ? `&date=${dateISO}` : ""}`
  );
  if (!r.ok) throw new Error("Failed to load slots");
  return r.json();
}

export async function createAppointment(doctorId: string, slotId: string) {
  const r = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
    body: JSON.stringify({ doctorId, slotId }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to create appointment");
  }
  return r.json();
}

export async function payAppointment(appointmentId: string) {
  const r = await fetch(`${BASE_URL}/appointments/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
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
  const r = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: { ...authHeaders() } as HeadersInit,
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.message || (r.status === 401 ? "Unauthorized" : "Failed to load appointments"));
  }
  return r.json(); // { data: [...] }
}

// Optional helpers hitting /users/me if your backend supports them
export async function getMe() {
  const r = await fetch(`${BASE_URL}/users/me`, {
    headers: { ...authHeaders() } as HeadersInit,
  });
  if (!r.ok) throw new Error("Failed to load user");
  const j = await r.json();
  return j.data ?? j;
}

export async function updateMe(payload: any) {
  const r = await fetch(`${BASE_URL}/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
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
    headers: { ...authHeaders() } as HeadersInit, // don't set Content-Type for FormData
    body: fd,
  });
  if (!r.ok) throw new Error("Failed to upload avatar");
  const j = await r.json();
  return j.data ?? j; // { avatarUrl }
}

export async function changePassword(payload: { oldPassword: string; newPassword: string }) {
  const r = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Password change failed");
  return r.json();
}
