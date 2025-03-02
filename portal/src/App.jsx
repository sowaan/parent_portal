import React, { Suspense, useEffect, useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Loader from "./common/Loader";
import DefaultLayout from "./layout/DefaultLayout";
const SignIn = React.lazy(() => import("./pages/SignIn"));
const StudentLeaveForm = React.lazy(
  () => import("./pages/StudentLeave/StudentLeaveForm")
);
const Profile = React.lazy(() => import("./pages/Profile"));
const UnPaidFee = React.lazy(() => import("./pages/FeePages/UnPaidFee"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const PaidFee = React.lazy(() => import("./pages/FeePages/PaidFee"));
const Lectures = React.lazy(() => import("./pages/Lectures"));
const FeeForm = React.lazy(() => import("./pages/FeePages/FeeForm"));
const Timetable = React.lazy(() => import("./pages/Timetable"));
const Assignment = React.lazy(() => import("./pages/Assignment/index"));
const AssignmentForm = React.lazy(
  () => import("./pages/Assignment/AssignmentForm")
);
const Newsletter = React.lazy(() => import("./pages/Newsletter"));
const NewsletterList = React.lazy(
  () => import("./pages/Newsletter/NewsletterList")
);
const ProgressReport = React.lazy(() => import("./pages/ProgressReport"));
const StudentLeave = React.lazy(() => import("./pages/StudentLeave"));
const Gallery = React.lazy(() => import("./views/Gallery"));
const GalleryView = React.lazy(() => import("./views/GalleryView"));

function App() {
  const { pathname } = useLocation();
  const { currentUser, isLoading } = useFrappeAuth();
  const [enable, setEnable] = useState(true);

  async function getAppData() {
    await axios
      .get("/api/method/parent_portal.parent_portal.api.get_app_logo")
      .then((res) => {
        localStorage.setItem("appData", JSON.stringify(res.data.message));
      })
      .catch((error) => {
        toast.error("Failed to fetch logo:", error.response || error.message);
        console.error("Failed to fetch logo:", error.response || error.message);
      });
  }

  useEffect(() => {
    getAppData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      axios
        .get("/api/method/parent_portal.parent_portal.api.is_potral_enable")
        .then((res) => {
          setEnable(true);
          // setEnable(res.data.message);
        })
        .catch((error) => {
          toast.error(
            "Failed to fetch Portal config:",
            error.response || error.message
          );
          console.error(
            "Failed to fetch Portal config:",
            error.response || error.message
          );
        });
    }
  }, [currentUser]);

  // Restrict access dynamically based on enable
  const isAllowedPath = (path) => {
    if (!enable) {
      return path === "/student-fee" || path.startsWith("/student-fee/");
    }
    return true;
  };

  useEffect(() => {
    if (!enable && pathname.startsWith("/student-fee")) {
      toast.error("Please pay your fee first to access all pages.");
    }
  }, [pathname, enable]);

  if (isLoading && (currentUser ? currentUser : false)) {
    return <Loader message="Check if the user is logged in" />;
  }

  const RouteElement = ({ page }) => {
    return isAllowedPath(pathname) ? (
      page
    ) : (
      <Navigate to="/student-fee" replace />
    );
  };

  return (
    <>
      <ToastContainer />
      {!currentUser ? (
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="*" element={<Navigate to="/parent-login" replace />} />
            <Route path="/parent-login" element={<SignIn />} />
          </Routes>
        </Suspense>
      ) : (
        <DefaultLayout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/parent-login"
                element={<Navigate to="/student-fee" replace />}
              />
              <Route
                path="/student-fee"
                element={<RouteElement page={<UnPaidFee />} />}
              />
              <Route
                path="/student-fee/:slug"
                element={<RouteElement page={<FeeForm />} />}
              />
              <Route
                path="/student-paid-fee"
                element={<RouteElement page={<PaidFee />} />}
              />
              <Route
                path="/lectures"
                element={<RouteElement page={<Lectures />} />}
              />
              <Route
                path="/timetable"
                element={<RouteElement page={<Timetable />} />}
              />
              <Route
                path="/assignment"
                element={<RouteElement page={<Assignment />} />}
              />
              <Route
                path="/assignment/:slug"
                element={<RouteElement page={<AssignmentForm />} />}
              />
              <Route
                path="/newsletter"
                element={<RouteElement page={<Newsletter />} />}
              />
              <Route
                path="/newsletter/:slug"
                element={<RouteElement page={<Newsletter />} />}
              />
              <Route
                path="/newsletter/list"
                element={<RouteElement page={<NewsletterList />} />}
              />
              <Route
                path="/progress-report"
                element={<RouteElement page={<ProgressReport />} />}
              />
              <Route
                path="/student-leave"
                element={<RouteElement page={<StudentLeave />} />}
              />
              <Route
                path="/student-leave/new"
                element={<RouteElement page={<StudentLeaveForm />} />}
              />
              <Route
                path="/student-leave/:slug"
                element={<RouteElement page={<StudentLeaveForm />} />}
              />
              <Route
                path="/gallery"
                element={<RouteElement page={<Gallery />} />}
              />
              <Route
                path="/gallery/:slug"
                element={<RouteElement page={<GalleryView />} />}
              />
              <Route
                path="/profile"
                element={<RouteElement page={<Profile />} />}
              />
              <Route path="*" element={<RouteElement page={<Dashboard />} />} />
            </Routes>
          </Suspense>
        </DefaultLayout>
      )}
    </>
  );
}

export default App;
