import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "./component/Loader";
const Header = lazy(() => import("./component/Header"));
const Footer = lazy(() => import("./component/Footer"));
const Home = lazy(() => import("./component/Home"));
const About = lazy(() => import("./component/About"));
const Gallery = lazy(() => import("./component/Gallery"));
const Calculator = lazy(() => import("./component/Calculator"));
const Login = lazy(() => import("./component/Login"));
const Signin = lazy(() => import("./component/Signin"));
const ResetPassword = lazy(() => import("./component/ResetPassword"));
const AdminPanel = lazy(() => import("./component/AdminPanel"));
const ManageAreas = lazy(() => import("./component/ManageAreas"));
const ManageSlots = lazy(() => import("./component/ManageSlots"));
const ManageUsers = lazy(() => import("./component/ManageUsers"));
const AreaList = lazy(() => import("./component/AreaList"));
const ContactUs = lazy(() => import("./component/ContactUs"));
const ManageAdminContactusData = lazy(() =>
  import("./component/ManageAdminContactusData")
);
const Profile = lazy(() => import("./component/Profile"));
const Feedback = lazy(() => import("./component/Feedback"));
const AdminViewFeedback = lazy(() => import("./component/AdminViewFeedback"));
const AreaWiseSlot = lazy(() => import("./component/AreaWiseSlot"));
const BookingForm = lazy(() => import("./component/BookingForm"));
const UserBooking = lazy(() => import("./component/UserBooking"));
const AdminBookingData = lazy(() => import("./component/AdminBookingData"));
const AuthRoute = lazy(() => import("./component/AuthRoute"));
const AdminSetting = lazy(() => import("./component/AdminSetting"));
const SuperFranchiseList = lazy(() => import("./component/SuperFranchiseList"));
const ManageAdmin = lazy(() => import("./component/ManageAdmins"));
const PaymentSuccess = lazy(() => import("./component/PaymentSuccess"));
const PaymentGateway = lazy(() => import("./component/ManagePaymentGateways"));

function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // pages where header/footer should be hidden
  const hideHeaderFooter =
    path === "/login" ||
    path === "/signin" ||
    path === "/booking-form" ||
    path === "/manageareas" ||
    path === "/manageslots" ||
    path === "/manageusers" ||
    path === "/manageadmins" ||
    path === "/manageadmincontactusdata" ||
    path === "/adminviewfeedback" ||
    path === "/adminbookingdata" ||
    path === "/managepaymentgateway" ||
    path === "/payment-success" ||
    path.startsWith("/reset-password/") ||   // ✅ reset password dynamic url
    path.startsWith("/admin") ||             // ✅ all admin routes
    path.startsWith("/super/");              // ✅ super routes if you want

  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/calculator" element={<Calculator />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Signin />} />

            {/* ✅ Works for live link: /reset-password/<token> */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/booking-form"
              element={
                <AuthRoute>
                  <BookingForm />
                </AuthRoute>
              }
            />

            <Route
              path="/managepaymentgateway"
              element={
                <AuthRoute>
                  <PaymentGateway />
                </AuthRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <AuthRoute>
                  <PaymentSuccess />
                </AuthRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AuthRoute>
                  <AdminPanel />
                </AuthRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AuthRoute>
                  <AdminSetting />
                </AuthRoute>
              }
            />
            <Route
              path="/manageadmins"
              element={
                <AuthRoute>
                  <ManageAdmin />
                </AuthRoute>
              }
            />
            <Route
              path="/manageareas"
              element={
                <AuthRoute>
                  <ManageAreas />
                </AuthRoute>
              }
            />
            <Route
              path="/manageslots"
              element={
                <AuthRoute>
                  <ManageSlots />
                </AuthRoute>
              }
            />
            <Route
              path="/manageusers"
              element={
                <AuthRoute>
                  <ManageUsers />
                </AuthRoute>
              }
            />
            <Route
              path="/manageadmincontactusdata"
              element={
                <AuthRoute>
                  <ManageAdminContactusData />
                </AuthRoute>
              }
            />
            <Route
              path="/adminviewfeedback"
              element={
                <AuthRoute>
                  <AdminViewFeedback />
                </AuthRoute>
              }
            />
            <Route
              path="/adminbookingdata"
              element={
                <AuthRoute>
                  <AdminBookingData />
                </AuthRoute>
              }
            />

            <Route path="/feedback" element={<Feedback />} />
            <Route path="/arealist" element={<AreaList />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/areawiseslot/:areaName" element={<AreaWiseSlot />} />
            <Route path="/userbooking" element={<UserBooking />} />
            <Route path="/super/franchise" element={<SuperFranchiseList />} />
          </Routes>
        </Layout>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
