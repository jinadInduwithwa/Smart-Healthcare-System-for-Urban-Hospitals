import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// -------------- doctor --------------------------------------
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import Overview from "./pages/doctor/Overview";

// ------------------------- main --------------------------
import Home from "./pages/Home";
import Layout from "./components/UI/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp_Patient";
import SignUp_Doctor from "./pages/SignUp_Doctor";
// import Profile from "./pages/Profile";
import MobileBottomNav from "./components/UI/MobileBottomNav";

// ---------- Appointment (patient area) ----------
import BookAppointment from "./pages/appointments/BookAppointment";
import MyAppointments from "./pages/appointments/MyAppointments";
import PastRecords from "./pages/appointments/PastRecords";
import PatientShell from "./components/Patient/PatientShell";
import Profile from "./pages/appointments/Profile";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="profile" element={<DoctorProfile />} />
        {/* Future doctor routes */}
      </Route>
    </Routes>
  );
};

function App() {
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
          {/* Public site shell */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />

            {/* Auth */}
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="doctor-signup" element={<SignUp_Doctor />} />

            {/* Profile */}
            <Route path="account" element={<Profile />} />

            {/* Redirect old appointments path to patient layout */}
            <Route path="appointments" element={<Navigate to="/patient/book" replace />} />
          </Route>

          {/* Patient area with sidebar */}
          <Route path="/patient" element={<PatientShell />}>
            <Route index element={<Navigate to="book" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="past-records" element={<PastRecords />} />
          </Route>

          {/* Doctor dashboard */}
          <Route path="/doctor-dashboard/*" element={<DoctorRoutes />} />
        </Routes>

        <MobileBottomNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
