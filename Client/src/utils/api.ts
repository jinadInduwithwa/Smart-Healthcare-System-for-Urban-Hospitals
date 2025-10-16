// const BASE_URL = "http://localhost:3002/api";


// //------------------------ Auth APIs ----------------------

// interface FormData {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
// }
// interface UserStatusData {
//   isActive?: boolean;
//   isVerified?: boolean;
// }

// interface UserRoleData {
//   role: "PATIENT" | "DOCTOR" | "ADMIN" ;
// }

// // login
// export const login = async (email: string, password: string) => {
//   try {
//     const response = await fetch(`${BASE_URL}/auth/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//       throw new Error("Login failed");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Login error:", error);
//     throw error;
//   }
// };

// export const register = async (userData: FormData) => {
//   try {
//     const response = await fetch(`${BASE_URL}/auth/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       throw response;
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Registration error:", error);
//     throw error;
//   }
// };

// export const verifyEmail = async (pin: string) => {
//   try {
//     const response = await fetch(`${BASE_URL}/auth/verify-email`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ pin }),
//     });

//     console.log("Verify Email Response Status:", response.status); // Debug log

//     // Clone the response to read the body multiple times
//     const responseClone = response.clone();
//     const responseText = await responseClone.text(); // Read raw text for debugging
//     console.log("Verify Email Response Text:", responseText);

//     if (!response.ok) {
//       throw new Error(`Verification failed with status ${response.status}: ${responseText}`);
//     }

//     const data = await response.json(); // Read JSON
//     return data; // Returns { status: 'success', message: 'Email verified successfully' }
//   } catch (error) {
//     console.error("Verification error:", error);
//     throw error instanceof Error ? error : new Error("Email verification failed");
//   }
// };

// // get profile
// export const getProfile = async () => {
//   try {
//     const response = await fetch(`${BASE_URL}/auth/profile`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });

//     if (!response.ok) {
//       throw response;
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Profile fetch error:", error);
//     throw error;
//   }
// };

// // update profile
// export const updateProfile = async (userData: Partial<FormData>) => {
//   try {
//     const response = await fetch(`${BASE_URL}/auth/profile`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       throw response;
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Profile update error:", error);
//     throw error;
//   }
// };

// // get all users (for admin)
// export const getAllUsers = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await fetch(`${BASE_URL}/auth/users`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to fetch users");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Fetch all users error:", error);
//     throw error;
//   }
// };

// // get user by id (for admin)
// export const getUserById = async (userId: string) => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to fetch user");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Fetch user by ID error:", error);
//     throw error;
//   }
// };

// // update user (for admin)
// export const updateUser = async (
//   userId: string,
//   userData: Partial<FormData & { password?: string; confirmPassword?: string }>
// ) => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to update user");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Update user error:", error);
//     throw error;
//   }
// };

// // delete user (for admin)
// export const deleteUser = async (userId: string) => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to delete user");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Delete user error:", error);
//     throw error;
//   }
// };

// // get update user status (for admin)
// export const updateUserStatus = async (userId: string, statusData: UserStatusData) => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await fetch(`${BASE_URL}/auth/users/${userId}/status`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(statusData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to update user status");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Update user status error:", error);
//     throw error;
//   }
// };

// // update user role (for admin)
// export const updateUserRole = async (userId: string, roleData: UserRoleData) => {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("No authentication token found");
//     }

//     const response = await fetch(`${BASE_URL}/auth/users/${userId}/role`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(roleData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to update user role");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Update user role error:", error);
//     throw error;
//   }
// };

export const BASE_URL = "http://localhost:3002/api";

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

interface Doctor {
  _id?: string;
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
  phone: string;
  specialization: string;
  licenseNumber: string;
}

// login
export const login = async (email: string, password: string): Promise<{ token: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token); // Automatically store token
    }
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error instanceof Error ? error : new Error("Login failed");
  }
};

// register
export const register = async (userData: FormData): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error instanceof Error ? error : new Error("Registration failed");
  }
};

// verifyEmail
export const verifyEmail = async (pin: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    console.log("Verify Email Response Status:", response.status);
    const responseClone = response.clone();
    const responseText = await responseClone.text();
    console.log("Verify Email Response Text:", responseText);

    if (!response.ok) {
      throw new Error(`Verification failed with status ${response.status}: ${responseText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Verification error:", error);
    throw error instanceof Error ? error : new Error("Email verification failed");
  }
};

// getProfile
export const getProfile = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};

// updateProfile
export const updateProfile = async (userData: Partial<FormData>): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
};

// getAllUsers
export const getAllUsers = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

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

// getUserById
export const getUserById = async (userId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

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

// updateUser
export const updateUser = async (
  userId: string,
  userData: Partial<FormData & { password?: string; confirmPassword?: string }>
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

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

// deleteUser
export const deleteUser = async (userId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

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

// updateUserStatus
export const updateUserStatus = async (userId: string, statusData: UserStatusData): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

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

// updateUserRole
export const updateUserRole = async (userId: string, roleData: UserRoleData): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

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

//------------------------ Doctor APIs ----------------------

export const addDoctor = async (doctorData: Doctor, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doctorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add doctor");
    }

    return await response.json();
  } catch (error) {
    console.error("Add doctor error:", error);
    throw error;
  }
};

export const updateDoctor = async (id: string, doctorData: Partial<Doctor>, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doctorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update doctor");
    }

    return await response.json();
  } catch (error) {
    console.error("Update doctor error:", error);
    throw error;
  }
};

export const deleteDoctor = async (id: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete doctor");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete doctor error:", error);
    throw error;
  }
};

export const getDoctors = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/doctors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text(); // Use text() for potential non-JSON errors
      throw new Error(errorData || "Failed to fetch doctors");
    }

    return await response.json();
  } catch (error) {
    console.error("Get doctors error:", error);
    throw error;
  }
};

// Add this function to your api.ts file in the reports section

export const getDoctorAvailabilityReport = async (token: string): Promise<any> => {
  try {
    const url = `${BASE_URL}/reports/doctor-availability`;
    console.log("Fetching doctor availability report from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });

    console.log("Response status:", response.status);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response received:", textResponse.substring(0, 200));
      throw new Error(`Server returned ${contentType || 'unknown content type'}. Expected JSON.`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch doctor availability report (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get doctor availability report error:", error);
    throw error;
  }
};



//------------------------ Patient APIs ----------------------

interface Patient {
  _id?: string;
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
  phone: string;
  isVerified: boolean;
  healthCardId: string;
  dateOfBirth: string;
  gender: string;
}

export const addPatient = async (patientData: Patient, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add patient");
    }

    return await response.json();
  } catch (error) {
    console.error("Add patient error:", error);
    throw error;
  }
};

export const updatePatient = async (id: string, patientData: Partial<Patient>, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update patient");
    }

    return await response.json();
  } catch (error) {
    console.error("Update patient error:", error);
    throw error;
  }
};

export const deletePatient = async (id: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete patient");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete patient error:", error);
    throw error;
  }
};

export const getPatients = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/patients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text(); // Use text() for potential non-JSON errors
      throw new Error(errorData || "Failed to fetch patients");
    }

    return await response.json();
  } catch (error) {
    console.error("Get patients error:", error);
    throw error;
  }
};

export const getPatientCheckInReport = async (startDate: string, endDate: string, token: string): Promise<any> => {
  try {
    const url = `${BASE_URL}/reports/patient-check-ins?startDate=${startDate}&endDate=${endDate}`;
    console.log("Fetching patient check-in report from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    // Handle 304 Not Modified - fetch again without cache
    if (response.status === 304) {
      console.warn("Received 304 Not Modified, retrying without cache...");
      const retryResponse = await fetch(url + `&_t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      return await retryResponse.json();
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response received:", textResponse.substring(0, 200));
      throw new Error(`Server returned ${contentType || 'unknown content type'}. Expected JSON. Make sure backend server is running on port 3002.`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch patient check-in report (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get patient check-in report error:", error);
    throw error;
  }
};