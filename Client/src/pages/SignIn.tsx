
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { IoEyeOutline, IoEyeOffOutline, IoLogoApple } from "react-icons/io5";
// import { FcGoogle } from "react-icons/fc";
// import toast, { Toaster } from "react-hot-toast";
// import CustomButton from "@/components/UI/CustomButton";
// import { login } from "@/utils/api";
// import { useAuth } from "@/context/AuthContext";

// function SignIn() {
//   const navigate = useNavigate();
//   const { login: authLogin, user, loading: authLoading } = useAuth();
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [email, setEmail] = useState("jinadgamage@gmail.com");
//   const [password, setPassword] = useState("Password123@");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleGoogleSignIn = () => {
//     window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
//   };

//   const handleAppleSignIn = () => {
//     window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/apple`;
//   };

//   const validateEmail = (email: string) => {
//     if (!email) {
//       setEmailError("Email is required");
//       return false;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setEmailError("Please enter a valid email");
//       return false;
//     }
//     setEmailError("");
//     return true;
//   };

//   const validatePassword = (password: string) => {
//     if (!password) {
//       setPasswordError("Password is required");
//       return false;
//     }
//     setPasswordError("");
//     return true;
//   };

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEmail(e.target.value);
//     if (emailError) validateEmail(e.target.value);
//   };

//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPassword(e.target.value);
//     if (passwordError) validatePassword(e.target.value);
//   };

//   const handleEmailBlur = () => {
//     validateEmail(email);
//   };

//   const handleFormSubmit = async () => {
//     const isEmailValid = validateEmail(email);
//     const isPasswordValid = validatePassword(password);

//     if (!isEmailValid || !isPasswordValid) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await login(email, password);
//       console.log("Login response:", response); // Debug: Log the full response
//       toast.success("Successfully signed in!");

//       if (response.data && response.data.token) {
//         localStorage.setItem("token", response.data.token);
//         authLogin({
//           id: response.data.user.id,
//           email: response.data.user.email,
//           role: response.data.user.role,
//           firstName: response.data.user.firstName,
//           lastName: response.data.user.lastName,
//         });
//       } else {
//         throw new Error("Invalid response format");
//       }
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         toast.error(error.message);
//       } else {
//         toast.error("Invalid email or password");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Effect to handle navigation after context update
//   useEffect(() => {
//     console.log("Current user in useEffect:", user); // Debug log
//     if (!authLoading && user) {
//       if (user.role === "DOCTOR") {
//         navigate("/doctor-dashboard");
//       } else if (user.role === "ADMIN") {
//         navigate("/admin-dashboard");
//       } else {
//         navigate("/");
//       }
//     }
//   }, [authLoading, user, navigate]);

//   return (
//     <div className="mx-auto flex w-full mt-20 lg:mt-0 max-w-[1920px] flex-col lg:flex-row min-h-screen">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* Background Image */}
//       <div className="hidden lg:block lg:w-[55%] h-screen sticky top-0">
//         <img
//           src="/assets/Home/signup_healthcare_bg.jpg"
//           alt="Healthcare Background"
//           className="h-full w-full object-cover"
//         />
//       </div>

//       {/* Form Section */}
//       <div className="flex w-full flex-col px-[20px] pt-[20px] sm:px-[30px] sm:pt-[30px] md:px-20 lg:w-[45%] lg:px-[60px] lg:pt-[80px] 2xl:px-[165px] 2xl:pt-[154px] min-h-screen">
//         {/* Logo - Visible on all screens */}
//         <div className="w-full mb-4 hidden lg:block">
//           <span className="text-4xl font-bold text-blue-600">Medora</span>
//         </div>

//         {/* Sign In Section */}
//         <div className="flex w-full flex-col lg:mt-10">
//           <h2 className="font-PlusSans text-[24px] font-bold leading-[32px] text-[#000] lg:text-[36px]">
//             Welcome Back
//           </h2>
//           <span className="mt-5 font-PlusSans text-sm font-medium leading-6 text-black lg:text-base lg:leading-8">
//             Sign in to access your healthcare services
//           </span>

//           {/* Email Input */}
//           <div className="mt-[32px] space-y-1">
//             <input
//               type="email"
//               value={email}
//               onChange={handleEmailChange}
//               onBlur={handleEmailBlur}
//               placeholder="Username@example.com"
//               className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
//                 emailError ? "text-red-500" : ""
//               }`}
//             />
//             <div
//               className={`h-[1px] w-full ${
//                 emailError ? "bg-red-500" : "bg-[#000]"
//               }`}
//             ></div>
//             {emailError && (
//               <p className="text-xs text-red-500 mt-1">{emailError}</p>
//             )}
//           </div>

//           {/* Password Input */}
//           <div className="mt-[24px] space-y-1">
//             <div className="relative">
//               <input
//                 type={passwordVisible ? "text" : "password"}
//                 value={password}
//                 onChange={handlePasswordChange}
//                 placeholder="Enter your Password"
//                 className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
//                   passwordError ? "text-red-500" : ""
//                 }`}
//               />
//               <div
//                 className="absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer"
//                 onClick={() => setPasswordVisible(!passwordVisible)}
//               >
//                 {passwordVisible ? (
//                   <IoEyeOutline
//                     size={20}
//                     color={passwordError ? "#EF4444" : "#646464"}
//                   />
//                 ) : (
//                   <IoEyeOffOutline
//                     size={20}
//                     color={passwordError ? "#EF4444" : "#646464"}
//                   />
//                 )}
//               </div>
//             </div>
//             <div
//               className={`h-[1px] w-full ${
//                 passwordError ? "bg-red-500" : "bg-[#000]"
//               }`}
//             ></div>
//             {passwordError && (
//               <p className="text-xs text-red-500 mt-1">{passwordError}</p>
//             )}
//           </div>

//           {/* Forgot Password Link */}
//           <div className="mt-2 flex w-full items-end justify-end">
//             <span
//               onClick={() => navigate("/forgot-password")}
//               className="cursor-pointer font-PlusSans text-[14px] text-blue-600 hover:text-blue-700 hover:underline"
//             >
//               Forgot Password?
//             </span>
//           </div>

//           {/* Sign In Button */}
//           <div className="mt-[32px] w-full">
//             <CustomButton
//               title={isLoading ? "Signing In..." : "Sign In"}
//               bgColor="bg-blue-600"
//               textColor="text-white"
//               onClick={handleFormSubmit}
//               style="hover:bg-blue-700"
//               disabled={isLoading}
//             />
//           </div>

//           <div className="mt-[23px] flex items-center justify-center font-PlusSans text-sm leading-6 text-black">
//             or continue with
//           </div>

//           {/* Social Login Buttons */}
//           <div className="mt-[24px] flex items-center justify-center space-x-[9px] lg:mt-[46px]">
//             <div
//               className="flex h-[46px] w-[105px] cursor-pointer items-center justify-center border-[1px] border-[#00000033] bg-white hover:border-2 hover:border-blue-600"
//               onClick={handleGoogleSignIn}
//             >
//               <FcGoogle size={24} />
//             </div>
//             <div
//               className="flex h-[46px] w-[105px] cursor-pointer items-center justify-center border-[1px] border-[#00000033] bg-white hover:border-2 hover:border-blue-600"
//               onClick={handleAppleSignIn}
//             >
//               <IoLogoApple size={24} />
//             </div>
//           </div>

//           {/* Sign Up Link */}
//           <h1 className="mt-[12px] flex items-center justify-center font-PlusSans text-sm leading-6 text-[#646464]">
//             Don't have an account?{" "}
//             <span
//               className="ml-2.5 cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline"
//               onClick={() => navigate("/signup")}
//             >
//               Sign Up
//             </span>
//           </h1>
//         </div>

//         {/* Footer */}
//         <div className="mt-auto flex items-center justify-center py-3 font-PlusSans text-xs leading-6 text-black lg:py-7">
//           2025 © All rights reserved. Medora
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SignIn;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline, IoLogoApple } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";
import CustomButton from "@/components/UI/CustomButton";
import { login } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

function SignIn() {
  const navigate = useNavigate();
  const { login: authLogin, user, loading: authLoading } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("jinadgamage@gmail.com");
  const [password, setPassword] = useState("Password123@");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const handleAppleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/apple`;
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) validateEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) validatePassword(e.target.value);
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handleFormSubmit = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(email, password);
      console.log("Login response:", response); // Debug: Log the full response
      toast.success("Successfully signed in!");

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        authLogin({
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
        });

        // Custom navigation for specific credentials
        if (email === "maleesharashani@gmail.com" && password === "Admin@123") {
          navigate("/admin-dashboard");
        } else if (response.data.user.role === "DOCTOR") {
          navigate("/doctor-dashboard");
        } else {
          navigate("/");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle navigation after context update
  useEffect(() => {
    console.log("Current user in useEffect:", user); // Debug log
    if (!authLoading && user) {
      if (user.role === "DOCTOR") {
        navigate("/doctor-dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [authLoading, user, navigate]);

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
        {/* Logo - Visible on all screens */}
        <div className="w-full mb-4 hidden lg:block">
          <span className="text-4xl font-bold text-blue-600">Medora</span>
        </div>

        {/* Sign In Section */}
        <div className="flex w-full flex-col lg:mt-10">
          <h2 className="font-PlusSans text-[24px] font-bold leading-[32px] text-[#000] lg:text-[36px]">
            Welcome Back
          </h2>
          <span className="mt-5 font-PlusSans text-sm font-medium leading-6 text-black lg:text-base lg:leading-8">
            Sign in to access your healthcare services
          </span>

          {/* Email Input */}
          <div className="mt-[32px] space-y-1">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Username@example.com"
              className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                emailError ? "text-red-500" : ""
              }`}
            />
            <div
              className={`h-[1px] w-full ${
                emailError ? "bg-red-500" : "bg-[#000]"
              }`}
            ></div>
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mt-[24px] space-y-1">
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your Password"
                className={`w-full font-PlusSans text-[14px] font-normal leading-[24px] text-black placeholder:text-[#646464] focus:outline-none ${
                  passwordError ? "text-red-500" : ""
                }`}
              />
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <IoEyeOutline
                    size={20}
                    color={passwordError ? "#EF4444" : "#646464"}
                  />
                ) : (
                  <IoEyeOffOutline
                    size={20}
                    color={passwordError ? "#EF4444" : "#646464"}
                  />
                )}
              </div>
            </div>
            <div
              className={`h-[1px] w-full ${
                passwordError ? "bg-red-500" : "bg-[#000]"
              }`}
            ></div>
            {passwordError && (
              <p className="text-xs text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="mt-2 flex w-full items-end justify-end">
            <span
              onClick={() => navigate("/forgot-password")}
              className="cursor-pointer font-PlusSans text-[14px] text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          {/* Sign In Button */}
          <div className="mt-[32px] w-full">
            <CustomButton
              title={isLoading ? "Signing In..." : "Sign In"}
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

          {/* Sign Up Link */}
          <h1 className="mt-[12px] flex items-center justify-center font-PlusSans text-sm leading-6 text-[#646464]">
            Don't have an account?{" "}
            <span
              className="ml-2.5 cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign Up
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

export default SignIn;
