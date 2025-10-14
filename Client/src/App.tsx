// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { AuthProvider } from "@/context/AuthContext";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


// //-------------- doctor --------------------------------------
// import DoctorLayout from "./pages/doctor/DoctorLayout";
// import DoctorProfile from "./pages/doctor/DoctorProfile";

// const DoctorRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<DoctorLayout />}>
//         <Route index element={<Navigate to="overview" replace />} />{" "}
//         {/* Relative path */}
//         <Route path="overview" element={<Overview />} />
//         <Route path="profile" element={<DoctorProfile />} />

//         {/* Order-related routes grouped under /orders */}
//         {/* <Route path="prescription">
//           <Route path="new" element={<Newprescription />} />
//         </Route> */}
//       </Route>
//     </Routes>
//   );
// };


// //------------------------- main --------------------------
// import Home from "./pages/Home";
// import Layout from "./components/UI/Layout";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Profile from "./pages/Profile";
// import MobileBottomNav from "./components/UI/MobileBottomNav";
// import Overview from "./pages/doctor/Overview";

// function App() {
//   console.log("App component rendered");
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//             <ToastContainer
//               position="top-right"
//               autoClose={3000}
//               hideProgressBar={false}
//               newestOnTop
//               closeOnClick
//               rtl={false}
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="light"
//             />
//             <Routes>
//               <Route path="/" element={<Layout />}>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/signin" element={<SignIn />} />
//                 <Route path="/signup" element={<SignUp />} />
//                 <Route path="/account" element={<Profile />} />
//               </Route>
//               {/* path for doctor dashboard */}
//               <Route
//                 path="/doctor-dashboard/*"
//                 element={<DoctorRoutes />}
//               />
//             </Routes>
//             <MobileBottomNav />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { AuthProvider } from "@/context/AuthContext";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Home from "./pages/Home";
// import Layout from "./components/UI/Layout";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Profile from "./pages/Profile";
// import MobileBottomNav from "./components/UI/MobileBottomNav";
// import Overview from "./pages/doctor/Overview";
// import DoctorLayout from "./pages/doctor/DoctorLayout";
// import DoctorProfile from "./pages/doctor/DoctorProfile";
// import AdminLayout from "./pages/AdminDashboard/AdminLayout";
// import Reports from "./pages/AdminDashboard/Reports";
// import AdminOverview from "./pages/AdminDashboard/Overview";
// import DoctorManagement from "./pages/AdminDashboard/DoctorManagement";
// import PatientManagement from "./pages/AdminDashboard/PatientManagement";
// import PatientReport from "./pages/AdminDashboard/PatientReport";
// import DoctorReport from "./pages/AdminDashboard/DoctorReport";
// import FinancialReport from "./pages/AdminDashboard/FinancialReport";

// const DoctorRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<DoctorLayout />}>
//         <Route index element={<Navigate to="overview" replace />} />
//         <Route path="overview" element={<Overview />} />
//         <Route path="profile" element={<DoctorProfile />} />
//       </Route>
//     </Routes>
//   );
// };

// function App() {
//   console.log("App component rendered");
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//         <Routes>
//           <Route path="/" element={<Layout />}>
//             <Route path="/" element={<Home />} />
//             <Route path="/signin" element={<SignIn />} />
//             <Route path="/signup" element={<SignUp />} />
//             <Route path="/account" element={<Profile />} />
//           </Route>
//           <Route path="/doctor-dashboard/*" element={<DoctorRoutes />} />
//           <Route path="/admin-dashboard/*" element={<AdminLayout />}>
//             <Route path="reports" element={<Reports />} />
//             <Route path="overview" element={<AdminOverview />} />
//             <Route path="profile" element={<Profile />} />
//             <Route path="users/doctors" element={<DoctorManagement />} />
//             <Route path="users/patients" element={<PatientManagement />} />
//             <Route path="reports/patient" element={<PatientReport />} />
//             <Route path="reports/doctor" element={<DoctorReport />} />
//             <Route path="reports/financial" element={<FinancialReport />} />
//           </Route>
//         </Routes>
//         <MobileBottomNav />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Layout from "./components/UI/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/AdminDashboard/Profile";
import MobileBottomNav from "./components/UI/MobileBottomNav";
import Overview from "./pages/doctor/Overview";
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import AdminLayout from "./pages/AdminDashboard/AdminLayout";
import Reports from "./pages/AdminDashboard/Reports";
import AdminOverview from "./pages/AdminDashboard/Overview";
import DoctorManagement from "./pages/AdminDashboard/DoctorManagement";
import PatientManagement from "./pages/AdminDashboard/PatientManagement";
import PatientReport from "./pages/AdminDashboard/PatientReport";
import DoctorReport from "./pages/AdminDashboard/DoctorReport";
import FinancialReport from "./pages/AdminDashboard/FinancialReport";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>
    </Routes>
  );
};

function App() {
  console.log("App component rendered at 11:43 AM +0530, September 28, 2025");
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/account" element={<Profile />} />
          </Route>
          <Route path="/doctor-dashboard/*" element={<DoctorRoutes />} />
          <Route path="/admin-dashboard/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="reports" element={<Reports />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users/doctors" element={<DoctorManagement />} />
            <Route path="users/patients" element={<PatientManagement />} />
            <Route path="reports/patient" element={<PatientReport />} />
            <Route path="reports/doctor" element={<DoctorReport />} />
            <Route path="reports/financial" element={<FinancialReport />} />
            
          </Route>
        </Routes>
        <MobileBottomNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;