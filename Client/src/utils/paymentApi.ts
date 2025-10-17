// Payment API utilities with Stripe integration
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002/api";

export interface PaymentDetails {
  _id: string;
  id?: string; // For backward compatibility
  invoiceNumber: string;
  amount: number;
  currency: string;
  status:
    | "PENDING"
    | "PAID"
    | "OVERDUE"
    | "PROCESSING"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  paymentMethod: "CARD" | "INSURANCE" | "HOSPITAL" | "ONLINE";
  dueDate: string;
  paidAt?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  appointment: {
    _id: string;
    availability: {
      date: string;
      timeSlot: string;
      location: string;
    };
  };
  patient: {
    _id: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  doctor: {
    _id: string;
    specialization: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  _id: string;
  id?: string; // For backward compatibility
  invoiceNumber: string;
  amount: number;
  currency: string;
  status:
    | "PENDING"
    | "PAID"
    | "OVERDUE"
    | "PROCESSING"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED"
    | "COMPLETED";
  paymentMethod: "CARD" | "INSURANCE" | "HOSPITAL" | "ONLINE";
  dueDate: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  appointment: {
    _id: string;
    availability: {
      date: string;
      timeSlot: string;
      location: string;
    };
  };
  patient: {
    _id: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  doctor: {
    _id: string;
    specialization: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  outstandingBalance: number;
  pendingAppointments: number;
  totalPaid: number;
  completedPayments: number;
  insuranceCoverage: number;
}

export interface CreatePaymentRequest {
  appointmentId: string;
  amount: number;
  paymentMethod?: "CARD" | "INSURANCE" | "HOSPITAL" | "ONLINE";
  dueDate?: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
  paymentId: string;
}

// Create a new payment
export const createPayment = async (
  paymentData: CreatePaymentRequest
): Promise<PaymentDetails> => {
  try {
    const response = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create payment");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Create Stripe checkout session
export const createStripeCheckout = async (
  paymentId: string,
  successUrl: string,
  cancelUrl: string
): Promise<StripeCheckoutResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/payments/${paymentId}/stripe-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ successUrl, cancelUrl }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create Stripe checkout");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating Stripe checkout:", error);
    throw error;
  }
};

// Verify Stripe payment
export const verifyStripePayment = async (
  sessionId: string
): Promise<PaymentDetails> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/verify-stripe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify payment");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    throw error;
  }
};

// Get outstanding payments
export const getOutstandingPayments = async (): Promise<PaymentDetails[]> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/outstanding/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch outstanding payments"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching outstanding payments:", error);
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async (filters?: {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ payments: PaymentRecord[]; pagination: any }> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${BASE_URL}/payments/history/list?${queryParams}`,
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
      throw new Error(errorData.message || "Failed to fetch payment history");
    }

    const result = await response.json();
    return {
      payments: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};

// Get payment summary
export const getPaymentSummary = async (): Promise<PaymentSummary> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/summary/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch payment summary");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching payment summary:", error);
    throw error;
  }
};

// Process refund
export const processRefund = async (
  paymentId: string,
  refundAmount?: number
): Promise<{ refundId: string; refundAmount: number; status: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ refundAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to process refund");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
};

// Download receipt
export const downloadReceipt = async (paymentId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/${paymentId}/receipt`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to download receipt");
    }

    const result = await response.json();

    // Create a mock PDF blob from receipt data
    const receiptData = result.data;
    const receiptContent = `
      RECEIPT
      Invoice Number: ${receiptData.invoiceNumber}
      Amount: ${receiptData.currency.toUpperCase()} ${receiptData.amount.toLocaleString()}
      Patient: ${receiptData.patientName}
      Doctor: ${receiptData.doctorName} (${receiptData.specialization})
      Appointment: ${new Date(
        receiptData.appointmentDate
      ).toLocaleDateString()} at ${receiptData.appointmentTime}
      Hospital: ${receiptData.hospitalBranch}
      Transaction ID: ${receiptData.transactionId}
      Paid At: ${new Date(receiptData.paidAt).toLocaleString()}
    `;

    return new Blob([receiptContent], { type: "text/plain" });
  } catch (error) {
    console.error("Error downloading receipt:", error);
    throw error;
  }
};

// Get payment by ID
export const getPaymentById = async (
  paymentId: string
): Promise<PaymentDetails> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch payment");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};
