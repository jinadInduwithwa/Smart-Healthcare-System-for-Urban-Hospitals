import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaDownload,
  FaTimes,
  FaCalendarAlt,
  FaUserMd,
  FaCreditCard,
  FaReceipt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getPaymentById, type PaymentDetails } from "@/utils/paymentApi";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  paymentId,
}: PaymentSuccessModalProps) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const paymentDetails = await getPaymentById(paymentId);
      setPayment(paymentDetails);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (payment?.invoiceNumber) {
      toast.info(`Downloading receipt for ${payment.invoiceNumber}...`);
      // Implement receipt download logic
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || "N/A";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-50 p-6 rounded-t-2xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">
                  Payment Successful!
                </h2>
                <p className="text-green-600">
                  Your appointment has been confirmed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading payment details...</p>
            </div>
          ) : payment ? (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaReceipt className="mr-2 text-blue-600" />
                  Payment Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">
                      Invoice Number:
                    </span>
                    <p className="font-medium text-gray-800">
                      {payment.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Amount Paid:</span>
                    <p className="font-bold text-green-600 text-xl">
                      Rs. {payment.amount?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Payment Method:
                    </span>
                    <p className="font-medium text-gray-800 flex items-center">
                      <FaCreditCard className="mr-1 text-blue-600" />
                      {payment.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Transaction ID:
                    </span>
                    <p className="font-medium text-gray-800 text-sm">
                      {payment.transactionId ||
                        payment.stripePaymentIntentId ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  Appointment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hospital Branch:</span>
                    <span className="font-medium text-gray-800">
                      {payment.appointment?.availability?.location || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-gray-800">
                      {payment.appointment?.availability?.date
                        ? formatDate(payment.appointment.availability.date)
                        : "N/A"}{" "}
                      at{" "}
                      {formatTime(
                        payment.appointment?.availability?.timeSlot || ""
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium text-gray-800 flex items-center">
                      <FaUserMd className="mr-1 text-blue-600" />
                      {payment.doctor?.userId?.firstName &&
                      payment.doctor?.userId?.lastName
                        ? `${payment.doctor.userId.firstName} ${payment.doctor.userId.lastName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-medium text-gray-800">
                      {payment.doctor?.specialization || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Patient Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient Name:</span>
                    <span className="font-medium text-gray-800">
                      {payment.patient?.userId?.firstName &&
                      payment.patient?.userId?.lastName
                        ? `${payment.patient.userId.firstName} ${payment.patient.userId.lastName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-medium text-gray-800">
                      {payment.patient?.userId?._id || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Please arrive 15 minutes before your appointment time
                  </li>
                  <li>
                    • Bring a valid ID and your insurance card (if applicable)
                  </li>
                  <li>• You will receive a confirmation email shortly</li>
                  <li>
                    • To reschedule, contact us at least 24 hours in advance
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to load payment details</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 rounded-b-2xl border-t">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload className="mr-2" />
              Download Receipt
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
