
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline, IoLogoApple } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";
import CustomButton from "@/components/UI/CustomButton";
import { useAuth } from "@/context/AuthContext";
import { register, verifyEmail, login } from "@/utils/api";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface FormErrors {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

function SignUp() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationPin, setVerificationPin] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "PATIENT",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const handleAppleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/apple`;
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    }
    if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    if (!formData.firstName.trim()) {
      setErrors((prev) => ({ ...prev, firstName: "First name is required" }));
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      setErrors((prev) => ({ ...prev, lastName: "Last name is required" }));
      isValid = false;
    }
    if (!formData.address.street.trim()) {
      setErrors((prev) => ({
        ...prev,
        address: { ...prev.address, street: "Street is required" },
      }));
      isValid = false;
    }
    if (!formData.address.city.trim()) {
      setErrors((prev) => ({
        ...prev,
        address: { ...prev.address, city: "City is required" },
      }));
      isValid = false;
    }
    if (!formData.address.state.trim()) {
      setErrors((prev) => ({
        ...prev,
        address: { ...prev.address, state: "State is required" },
      }));
      isValid = false;
    }
    if (!formData.address.zipCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        address: { ...prev.address, zipCode: "Zip code is required" },
      }));
      isValid = false;
    }
    if (!formData.address.country.trim()) {
      setErrors((prev) => ({
        ...prev,
        address: { ...prev.address, country: "Country is required" },
      }));
      isValid = false;
    }
    // Removed the "Sri Lanka" restriction to match backend behavior
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, string>),
          [child]: value,
        },
      }));
      setErrors((prev) => ({
        ...prev,
        address: { ...prev.address, [child]: "" },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFormSubmit = async () => {
    if (
      !validateEmail(formData.email) ||
      !validatePassword(formData.password) ||
      !validateForm()
    ) {
      return;
    }

    const submitData = {
      ...formData,
    }; // Removed forced "Sri Lanka" country

    setIsLoading(true);
    try {
      await register(submitData);
      setIsVerificationStep(true);
      toast.success("Please check your email for verification code");
    } catch (error: unknown) {
      if (error instanceof Response) {
        const data = await error.json();
        if (data.errors) {
          data.errors.forEach((err: { path: string; msg: string }) => {
            if (err.path === "lastName") {
              setErrors((prev) => ({ ...prev, lastName: err.msg }));
            } else if (err.path === "firstName") {
              setErrors((prev) => ({ ...prev, firstName: err.msg }));
            } else if (err.path === "password") {
              setErrors((prev) => ({ ...prev, password: err.msg }));
            } else if (err.path.startsWith("address.")) {
              const field = err.path.split(".")[1];
              setErrors((prev) => ({
                ...prev,
                address: { ...prev.address, [field]: err.msg },
              }));
            }
          });
        } else if (data.message) {
          toast.error(data.message);
        }
      } else {
        toast.error("Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationPin) {
      toast.error("Please enter verification code");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Verifying email with pin:", verificationPin); // Debug log
      const response = await verifyEmail(verificationPin);
      console.log("Verification response:", response); // Debug response
      if (response.status === "success") {
        // Verification successful, now log in the user
        const loginResponse = await login(formData.email, formData.password);
        console.log("Login response:", loginResponse); // Debug login response
        if (loginResponse.status === "success" && loginResponse.data.token) {
          localStorage.setItem("token", loginResponse.data.token);
          authLogin({
            id: loginResponse.data.user.id,
            email: loginResponse.data.user.email,
            role: loginResponse.data.user.role,
            firstName: loginResponse.data.user.firstName,
            lastName: loginResponse.data.user.lastName,
          });
          toast.success("Account verified and logged in successfully!");
          // Navigate based on role
          if (loginResponse.data.user.role === "DOCTOR") {
            navigate("/doctor-dashboard/profile");
          } else {
            navigate("/signin");
          }
        } else {
          throw new Error("Login failed after verification");
        }
      } else {
        throw new Error(response.message || "Verification failed");
      }
    } catch (error: unknown) {
      console.error("Verification error details:", error); // Detailed error log
      if (error instanceof Error) {
        toast.error(`Verification failed: ${error.message}`);
      } else {
        toast.error("Failed to verify account due to an unexpected error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const submitData = {
        ...formData,
      }; // Removed forced "Sri Lanka" country
      await register(submitData); // Re-trigger registration to resend the code
      toast.success("A new verification code has been sent to your email");
    } catch (error: unknown) {
      toast.error("Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  if (isVerificationStep) {
    return (
      <div className="mx-auto flex w-full mt-20 lg:mt-0 max-w-[1920px] flex-col lg:flex-row min-h-screen">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Background Image */}
        <div className="hidden lg:block lg:w-[55%] h-screen sticky top-0">
          <img
            src="/assets/Home/signup_healthcare_bg.jpg"
            alt="Healthcare Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col px-[20px] pt-[20px] sm:px-[30px] sm:pt-[30px] md:px-20 lg:w-[45%] lg:px-[60px] lg:pt-[80px] 2xl:px-[165px] 2xl:pt-[154px] min-h-screen">
          <div className="w-full mb-4 hidden lg:block">
            <span className="text-4xl font-bold text-blue-600">Medora</span>
          </div>
          <div className="flex w-full flex-col lg:mt-10">
            <h2 className="font-PlusSans text-[24px] font-bold leading-[32px] text-[#000] lg:text-[36px]">
              Verify Your Email
            </h2>
            <span className="mt-5 font-PlusSans text-sm font-medium leading-6 text-black lg:text-base lg:leading-8">
              Please enter the verification code sent to your email.
            </span>
            <div className="mt-[32px] flex gap-2 justify-center">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={verificationPin[index] || ""}
                  onChange={(e) => {
                    const newPin = [...verificationPin];
                    newPin[index] = e.target.value;
                    setVerificationPin(newPin.join(""));
                    if (e.target.value && index < 5) {
                      const nextInput = document.querySelector(
                        `input[name="otp-${index + 1}"]`
                      ) as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }}
                  name={`otp-${index}`}
                  className="w-12 h-12 text-center font-PlusSans text-[14px] font-normal leading-[24px] text-black border-b-2 border-[#000] focus:outline-none focus:border-blue-600"
                />
              ))}
            </div>
            <div className="mt-[32px] w-full">
              <CustomButton
                title={isLoading ? "Verifying..." : "Verify Account"}
                bgColor="bg-blue-600"
                textColor="text-white"
                onClick={handleVerificationSubmit}
                style="hover:bg-blue-700"
                disabled={isLoading}
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400"
              >
                {resendLoading ? "Resending..." : "Resend Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full mt-20 lg:mt-0 max-w-[1920px] flex-col lg:flex-row min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Background Image */}
      <div className="hidden lg:block lg:w-[55%] h-screen sticky top-0">
        <img
          src="/assets/Home/signup_healthcare_bg.jpg"
          alt="Healthcare Background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="flex w-full flex-col px-[20px] pt-[20px] sm:px-[30px] sm:pt-[30px] md:px-20 lg:w-[45%] lg:px-[60px] lg:pt-[80px] 2xl:px-[165px] 2xl:pt-[154px] min-h-screen">
        {/* Logo */}
        <div className="w-full mb-4 hidden lg:block">
          <span className="text-4xl font-bold text-blue-600">Medora</span>
        </div>

        {/* Sign Up Section */}
        <div className="flex w-full flex-col lg:mt-10">
          <h2 className="font-PlusSans text-[24px] font-bold leading-[32px] text-[#000] lg:text-[36px]">
            Create Account
          </h2>
          <span className="mt-5 font-PlusSans text-sm font-medium leading-6 text-black lg:text-base lg:leading-8">
            Create your account to access healthcare services.
          </span>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4 mt-[32px]">
            <div className="space-y-1">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                  errors.firstName ? "text-red-500" : ""
                }`}
              />
              <div
                className={`h-[1px] w-full ${
                  errors.firstName ? "bg-red-500" : "bg-[#000]"
                }`}
              ></div>
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                  errors.lastName ? "text-red-500" : ""
                }`}
              />
              <div
                className={`h-[1px] w-full ${
                  errors.lastName ? "bg-red-500" : "bg-[#000]"
                }`}
              ></div>
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="mt-[24px] space-y-1">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Username@example.com"
              className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                errors.email ? "text-red-500" : ""
              }`}
            />
            <div
              className={`h-[1px] w-full ${
                errors.email ? "bg-red-500" : "bg-[#000]"
              }`}
            ></div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mt-[24px] space-y-1">
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create Password"
                className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                  errors.password ? "text-red-500" : ""
                }`}
              />
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <IoEyeOutline
                    size={20}
                    color={errors.password ? "#EF4444" : "#646464"}
                  />
                ) : (
                  <IoEyeOffOutline
                    size={20}
                    color={errors.password ? "#EF4444" : "#646464"}
                  />
                )}
              </div>
            </div>
            <div
              className={`h-[1px] w-full ${
                errors.password ? "bg-red-500" : "bg-[#000]"
              }`}
            ></div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
           {/* Date of Birth Input */}
          <div className="mt-[24px] space-y-1">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                errors.dateOfBirth ? "text-red-500" : ""
              }`}
            />
            <div
              className={`h-[1px] w-full ${errors.dateOfBirth ? "bg-red-500" : "bg-[#000]"}`}
            ></div>
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Gender Input */}
          <div className="mt-[24px] space-y-1">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                errors.gender ? "text-red-500" : ""
              }`}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <div
              className={`h-[1px] w-full ${errors.gender ? "bg-red-500" : "bg-[#000]"}`}
            ></div>
            {errors.gender && (
              <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Address Fields */}
          <div className="mt-[24px] space-y-4">
            <div className="space-y-1">
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Street Address"
                className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                  errors.address.street ? "text-red-500" : ""
                }`}
              />
              <div
                className={`h-[1px] w-full ${
                  errors.address.street ? "bg-red-500" : "bg-[#000]"
                }`}
              ></div>
              {errors.address.street && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.address.street}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                    errors.address.city ? "text-red-500" : ""
                  }`}
                />
                <div
                  className={`h-[1px] w-full ${
                    errors.address.city ? "bg-red-500" : "bg-[#000]"
                  }`}
                ></div>
                {errors.address.city && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.city}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                    errors.address.state ? "text-red-500" : ""
                  }`}
                />
                <div
                  className={`h-[1px] w-full ${
                    errors.address.state ? "bg-red-500" : "bg-[#000]"
                  }`}
                ></div>
                {errors.address.state && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.state}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="Zip Code"
                  className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                    errors.address.zipCode ? "text-red-500" : ""
                  }`}
                />
                <div
                  className={`h-[1px] w-full ${
                    errors.address.zipCode ? "bg-red-500" : "bg-[#000]"
                  }`}
                ></div>
                {errors.address.zipCode && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.zipCode}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                    errors.address.country ? "text-red-500" : ""
                  }`}
                />
                <div
                  className={`h-[1px] w-full ${
                    errors.address.country ? "bg-red-500" : "bg-[#000]"
                  }`}
                ></div>
                {errors.address.country && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.country}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <div className="mt-[32px] w-full">
            <CustomButton
              title={isLoading ? "Creating Account..." : "Create Account"}
              bgColor="bg-blue-600"
              textColor="text-white"
              onClick={handleFormSubmit}
              style="hover:bg-blue-700"
              disabled={isLoading}
            />
          </div>

          <div className="mt-[23px] flex items-center justify-center font-PlusSans text-sm leading-6 text-black">
            or continue with
          </div>

          {/* Social Login Buttons */}
          <div className="mt-[24px] flex items-center justify-center space-x-[9px] lg:mt-[46px]">
            <div
              className="flex h-[46px] w-[105px] cursor-pointer items-center justify-center border-[1px] border-[#00000033] bg-white hover:border-2 hover:border-blue-600"
              onClick={handleGoogleSignIn}
            >
              <FcGoogle size={24} />
            </div>
            <div
              className="flex h-[46px] w-[105px] cursor-pointer items-center justify-center border-[1px] border-[#00000033] bg-white hover:border-2 hover:border-blue-600"
              onClick={handleAppleSignIn}
            >
              <IoLogoApple size={24} />
            </div>
          </div>

          {/* Sign In Link */}
          <h1 className="mt-[12px] flex items-center justify-center font-PlusSans text-sm leading-6 text-[#646464]">
            Already have an account?{" "}
            <span
              className="ml-2.5 cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </h1>

          {/* Join As Doctor Link */}
          <h1 className="mt-[12px] flex items-center justify-center font-PlusSans text-sm leading-6 text-[#646464]">
            Are you a healthcare professional?{" "}
            <span
              className="ml-2.5 cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              onClick={() => navigate("/doctor-signup")}
            >
              Join As Doctor
            </span>
          </h1>
          
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-center py-3 font-PlusSans text-xs leading-6 text-black lg:py-7">
          2025 © All rights reserved. Medora
        </div>
      </div>
    </div>
  );
}

export default SignUp;
