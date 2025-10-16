import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

//-------------- doctor --------------------------------------
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
        <Route path="profile" element={<DoctorProfile />} />card
         <Route path="appoinment/scheduled" element={<ScheduledAppointments />} /> 
         <Route path="patient-records/all" element={<AllPatientRecords />} /> 
         <Route path="patient-records/card" element={<SearchCard />} /> 
         <Route path="consultation/patient/:patientId" element={<AllConsultations />} />  
         <Route path="consultation/add/:patientId" element={<AddConsultation />} /> 
        {/* Order-related routes grouped under /orders */}
        {/* <Route path="prescription">
          <Route path="new" element={<Newprescription />} />
        </Route> */}
      </Route>
    </Routes>
  );
};

const PatientRoutes = () => {
  return (
    <Routes>
   <Route path="/patient" element={<PatientShell />}>
            <Route index element={<Navigate to="book" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="past-records" element={<PastRecords />} />
          </Route>
    </Routes>
  );
}


//------------------------- main --------------------------

import AllPatientRecords from "./pages/doctor/AllPatientRecords";
import AllConsultations from "./pages/doctor/AllConsultations";
import AddConsultation from "./pages/doctor/AddConsultation";
import SearchCard from "./pages/doctor/SearchCard";
import ScheduledAppointments from "./pages/doctor/ScheduledAppointments";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} /> 
                <Route path="/signup" element={<SignUp />} />
                <Route path="/doctor-signup" element={<SignUp_Doctor />} />
                <Route path="/account" element={<Profile />} />
              </Route>
              {/* path for doctor dashboard */}
              <Route
                path="/doctor-dashboard/*"
                element={<DoctorRoutes />}
              />
               <Route path="/*" element={<PatientRoutes />} />
            </Routes>
            <MobileBottomNav />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;