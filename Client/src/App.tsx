import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


//-------------- doctor --------------------------------------
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorProfile from "./pages/doctor/DoctorProfile";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<Navigate to="overview" replace />} />{" "}
        {/* Relative path */}
        <Route path="overview" element={<Overview />} />
        <Route path="profile" element={<DoctorProfile />} />

        {/* Order-related routes grouped under /orders */}
        {/* <Route path="prescription">
          <Route path="new" element={<Newprescription />} />
        </Route> */}
      </Route>
    </Routes>
  );
};


//------------------------- main --------------------------
import Home from "./pages/Home";
import Layout from "./components/UI/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import MobileBottomNav from "./components/UI/MobileBottomNav";
import Overview from "./pages/doctor/Overview";

function App() {
  console.log("App component rendered");
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
              {/* path for doctor dashboard */}
              <Route
                path="/doctor-dashboard/*"
                element={<DoctorRoutes />}
              />
            </Routes>
            <MobileBottomNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
