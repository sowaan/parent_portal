import React, { Suspense, useEffect, useRef, useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import {
  CSpinner,
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
} from "@coreui/react";
import "./scss/style.scss";

// We use those styles to show code examples, you should remove them in your application.
import "./scss/examples.scss";
import axios from "axios";
import Lectures from "./views/Lectures";
import Wrapper from "./components/Wrapper";
import StudentLeaveForm from "./views/StudentLeave/StudentLeaveForm";
const Dashboard = React.lazy(() => import("./views/Dashboard"));
const Home = React.lazy(() => import("./views/Home"));
const PaidFee = React.lazy(() => import("./views/PaidFee"));
const Login = React.lazy(() => import("./views/Login"));
const FeeForm = React.lazy(() => import("./views/FeeForm"));
const Timetable = React.lazy(() => import("./views/Timetable"));
const Assignment = React.lazy(() => import("./views/Assignment/index"));
const AssignmentForm = React.lazy(() =>
  import("./views/Assignment/AssignmentForm")
);
const Newsletter = React.lazy(() => import("./views/Newsletter"));
const NewsletterList = React.lazy(() =>
  import("./views/Newsletter/NewsletterList")
);
const ProgressReport = React.lazy(() => import("./views/ProgressReport"));
const StudentLeave = React.lazy(() => import("./views/StudentLeave"));
const Gallery = React.lazy(() => import("./views/Gallery"));
const GalleryView = React.lazy(() => import("./views/GalleryView"));

function App() {
  const [sidebarShow, setSidebarShow] = useState(true);
  const { isLoading, currentUser } = useFrappeAuth();
  const [enable, setEnable] = useState(true);
  const location = useLocation();
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
    await axios
      .get("/api/method/parent_portal.parent_portal.api.is_potral_enable")
      .then((res) => {
        setEnable(true);
        // setEnable(res.data.message);
      })
      .catch((error) => {
        console.error("Failed to fetch logo:", error.response || error.message);
      });
  }

  useEffect(() => {
    getAppData();
  }, []);

  useEffect(() => {
    portalAvailability();
  }, []);

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
        (location.pathname === "/student-fee" ||
          location.pathname.startsWith("/student-fee/"))
      ) {
        addToast(exampleToast);
        // Show toast when specific paths are accessed
      }
    };

    handleLocationChange();
  }, [location.pathname, enable]);

  if (isLoading) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <CToaster
        className="p-3"
        placement="top-end"
        push={toast}
        ref={toaster}
      />
      {!currentUser ? (
        <Routes>
          <Route path="*" element={<Navigate to="/parent-login" replace />} />
          <Route path="/parent-login" element={<Login />} />
        </Routes>
      ) : (
        <Wrapper sidebarShow={sidebarShow} setSidebarShow={setSidebarShow}>
          <Routes>
            <Route
              path="/parent-login"
              element={<Navigate to="/student-fee" replace />}
            />
            <Route
              path="/student-fee"
              element={
                isAllowedPath(location.pathname) ? (
                  <Home />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-fee/:slug"
              element={
                isAllowedPath(location.pathname) ? (
                  <FeeForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-paid-fee"
              element={
                isAllowedPath(location.pathname) ? (
                  <PaidFee />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/lectures"
              element={
                isAllowedPath(location.pathname) ? (
                  <Lectures />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/timetable"
              element={
                isAllowedPath(location.pathname) ? (
                  <Timetable />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/assignment"
              element={
                isAllowedPath(location.pathname) ? (
                  <Assignment />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/assignment/:slug"
              element={
                isAllowedPath(location.pathname) ? (
                  <AssignmentForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/newsletter"
              element={
                isAllowedPath(location.pathname) ? (
                  <Newsletter />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/newsletter/:slug"
              element={
                isAllowedPath(location.pathname) ? (
                  <Newsletter />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/newsletter/list"
              element={
                isAllowedPath(location.pathname) ? (
                  <NewsletterList />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/progress-report"
              element={
                isAllowedPath(location.pathname) ? (
                  <ProgressReport />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-leave"
              element={
                isAllowedPath(location.pathname) ? (
                  <StudentLeave />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-leave/new"
              element={
                isAllowedPath(location.pathname) ? (
                  <StudentLeaveForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/student-leave/:slug"
              element={
                isAllowedPath(location.pathname) ? (
                  <StudentLeaveForm />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/gallery"
              element={
                isAllowedPath(location.pathname) ? (
                  <Gallery />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="/gallery/:slug"
              element={
                isAllowedPath(location.pathname) ? (
                  <GalleryView />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
            <Route
              path="*"
              element={
                isAllowedPath(location.pathname) ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/student-fee" replace />
                )
              }
            />
          </Routes>
        </Wrapper>
      )}
    </Suspense>
  );
}

export default App;
