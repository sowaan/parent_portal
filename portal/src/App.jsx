import React, { Suspense, useEffect, useRef, useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { CToast, CToastBody, CToastClose, CToaster } from "@coreui/react";
import axios from "axios";
import Lectures from "./views/Lectures";
import Wrapper from "./components/Wrapper";
import Loader from "./common/Loader";
import StudentLeaveForm from "./views/StudentLeave/StudentLeaveForm";
import DefaultLayout from "./layout/DefaultLayout";
import Profile from "./pages/Profile";
import UnPaidFee from "./pages/FeePages/UnPaidFee";
const Dashboard = React.lazy(() => import("./views/Dashboard"));
const Home = React.lazy(() => import("./views/Home"));
const PaidFee = React.lazy(() => import("./pages/FeePages/PaidFee"));
const Login = React.lazy(() => import("./views/Login"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const FeeForm = React.lazy(() => import("./pages/FeePages/FeeForm"));
const Timetable = React.lazy(() => import("./views/Timetable"));
const Assignment = React.lazy(() => import("./views/Assignment/index"));
const AssignmentForm = React.lazy(
  () => import("./views/Assignment/AssignmentForm")
);
const Newsletter = React.lazy(() => import("./views/Newsletter"));
const NewsletterList = React.lazy(
  () => import("./views/Newsletter/NewsletterList")
);
const ProgressReport = React.lazy(() => import("./views/ProgressReport"));
const StudentLeave = React.lazy(() => import("./views/StudentLeave"));
const Gallery = React.lazy(() => import("./views/Gallery"));
const GalleryView = React.lazy(() => import("./views/GalleryView"));

function App() {
  const { pathname } = useLocation();
  const { isLoading, currentUser } = useFrappeAuth();
  const [enable, setEnable] = useState(true);
  const [toast, addToast] = useState(0);
  const toaster = useRef();

  const exampleToast = (
    <CToast>
      <div className="d-flex">
        <CToastBody>Please pay your fee first to access all pages.</CToastBody>
        <CToastClose className="me-2 m-auto" />
      </div>
    </CToast>
  );

  async function getAppData() {
    await axios
      .get("/api/method/parent_portal.parent_portal.api.get_app_logo")
      .then((res) => {
        localStorage.setItem("appData", JSON.stringify(res.data.message));
      })
      .catch((error) => {
        console.error("Failed to fetch logo:", error.response || error.message);
      });
  }

  async function portalAvailability() {
    if (currentUser) {
      await axios
        .get("/api/method/parent_portal.parent_portal.api.is_potral_enable")
        .then((res) => {
          setEnable(true);
          // setEnable(res.data.message);
        })
        .catch((error) => {
          console.error(
            "Failed to fetch logo:",
            error.response || error.message
          );
        });
    }
  }

  useEffect(() => {
    getAppData();
  }, []);

  useEffect(() => {
    portalAvailability();
  }, [currentUser]);

  // Restrict access dynamically based on `enable`
  const isAllowedPath = (path) => {
    if (!enable) {
      return path === "/student-fee" || path.startsWith("/student-fee/");
    }
    return true;
  };

  useEffect(() => {
    // Listen for route changes
    const handleLocationChange = () => {
      if (
        !enable &&
        (pathname === "/student-fee" || pathname.startsWith("/student-fee/"))
      ) {
        addToast(exampleToast);
        // Show toast when specific paths are accessed
      }
    };

    handleLocationChange();
  }, [pathname, enable]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <CToaster
        className="p-3"
        placement="top-end"
        push={toast}
        ref={toaster}
      />
      {!currentUser ? (
        <Routes>
          <Route path="*" element={<Navigate to="/parent-login" replace />} />
          <Route path="/parent-login" element={<SignIn />} />
        </Routes>
      ) : (
        <DefaultLayout>
          <Routes>
            <Route
              path="/parent-login"
              element={<Navigate to="/student-fee" replace />}
            />
            <Route
              path="/student-fee"
              element={
                isAllowedPath(pathname) ? (
                  <UnPaidFee />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-fee/:slug"
              element={
                isAllowedPath(pathname) ? (
                  <FeeForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-paid-fee"
              element={
                isAllowedPath(pathname) ? (
                  <PaidFee />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/lectures"
              element={
                isAllowedPath(pathname) ? (
                  <Lectures />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/timetable"
              element={
                isAllowedPath(pathname) ? (
                  <Timetable />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/assignment"
              element={
                isAllowedPath(pathname) ? (
                  <Assignment />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/assignment/:slug"
              element={
                isAllowedPath(pathname) ? (
                  <AssignmentForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/newsletter"
              element={
                isAllowedPath(pathname) ? (
                  <Newsletter />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/newsletter/:slug"
              element={
                isAllowedPath(pathname) ? (
                  <Newsletter />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/newsletter/list"
              element={
                isAllowedPath(pathname) ? (
                  <NewsletterList />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/progress-report"
              element={
                isAllowedPath(pathname) ? (
                  <ProgressReport />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-leave"
              element={
                isAllowedPath(pathname) ? (
                  <StudentLeave />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-leave/new"
              element={
                isAllowedPath(pathname) ? (
                  <StudentLeaveForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-leave/:slug"
              element={
                isAllowedPath(pathname) ? (
                  <StudentLeaveForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/gallery"
              element={
                isAllowedPath(pathname) ? (
                  <Gallery />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/gallery/:slug"
              element={
                isAllowedPath(pathname) ? (
                  <GalleryView />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAllowedPath(pathname) ? (
                  <Profile />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="*"
              element={
                isAllowedPath(pathname) ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
          </Routes>
        </DefaultLayout>
      )}
    </Suspense>
  );
}

export default App;
