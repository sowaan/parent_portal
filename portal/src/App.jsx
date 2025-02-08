import React, { Suspense, useEffect, useRef, useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CToast, CToastBody, CToastClose, CToaster } from "@coreui/react";
import axios from "axios";
import Loader from "./common/Loader";
import DefaultLayout from "./layout/DefaultLayout";

const lazyLoad = (component) => React.lazy(() => import(`./${component}`));
const routes = [
  { path: "/student-fee", element: lazyLoad("pages/FeePages/UnPaidFee") },
  { path: "/student-fee/:slug", element: lazyLoad("pages/FeePages/FeeForm") },
  { path: "/student-paid-fee", element: lazyLoad("pages/FeePages/PaidFee") },
  { path: "/lectures", element: lazyLoad("views/Lectures") },
  { path: "/timetable", element: lazyLoad("views/Timetable") },
  { path: "/assignment", element: lazyLoad("views/Assignment/index") },
  {
    path: "/assignment/:slug",
    element: lazyLoad("views/Assignment/AssignmentForm"),
  },
  { path: "/newsletter", element: lazyLoad("views/Newsletter") },
  { path: "/newsletter/:slug", element: lazyLoad("views/Newsletter") },
  {
    path: "/newsletter/list",
    element: lazyLoad("views/Newsletter/NewsletterList"),
  },
  { path: "/progress-report", element: lazyLoad("views/ProgressReport") },
  { path: "/student-leave", element: lazyLoad("pages/StudentLeave") },
  {
    path: "/student-leave/new",
    element: lazyLoad("pages/StudentLeave/StudentLeaveForm"),
  },
  {
    path: "/student-leave/:slug",
    element: lazyLoad("pages/StudentLeave/StudentLeaveForm"),
  },
  { path: "/gallery", element: lazyLoad("views/Gallery") },
  { path: "/gallery/:slug", element: lazyLoad("views/GalleryView") },
  { path: "/profile", element: lazyLoad("pages/Profile") },
  { path: "*", element: lazyLoad("views/Dashboard") },
];

function App() {
  const { pathname } = useLocation();
  const { isLoading, currentUser } = useFrappeAuth();
  const [enable, setEnable] = useState(true);
  const [toast, addToast] = useState(null);
  const toaster = useRef();

  useEffect(() => {
    axios
      .get("/api/method/parent_portal.parent_portal.api.get_app_logo")
      .then((res) =>
        localStorage.setItem("appData", JSON.stringify(res.data.message))
      )
      .catch((error) =>
        console.error("Failed to fetch logo:", error.response || error.message)
      );
  }, []);

  useEffect(() => {
    if (currentUser) {
      axios
        .get("/api/method/parent_portal.parent_portal.api.is_potral_enable")
        .then(() => setEnable(true))
        .catch((error) =>
          console.error(
            "Failed to fetch portal availability:",
            error.response || error.message
          )
        );
    }
  }, [currentUser]);

  useEffect(() => {
    if (!enable && pathname.startsWith("/student-fee")) {
      addToast(
        <CToast>
          <div className="d-flex">
            <CToastBody>
              Please pay your fee first to access all pages.
            </CToastBody>
            <CToastClose className="me-2 m-auto" />
          </div>
        </CToast>
      );
    }
  }, [pathname, enable]);

  if (isLoading) {
    return <Loader message="Check if the user is logged in" />;
  }

  return (
    <>
      <CToaster
        className="p-3"
        placement="top-end"
        push={toast}
        ref={toaster}
      />
      {!currentUser ? (
        <Routes>
          <Route path="*" element={<Navigate to="/parent-login" replace />} />
          <Route path="/parent-login" element={lazyLoad("pages/SignIn")} />
        </Routes>
      ) : (
        <DefaultLayout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/parent-login"
                element={<Navigate to="/student-fee" replace />}
              />
              {routes.map(({ path, element }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    enable || path.startsWith("/student-fee") ? (
                      React.createElement(element)
                    ) : (
                      <Navigate to="/student-fee" replace />
                    )
                  }
                />
              ))}
            </Routes>
          </Suspense>
        </DefaultLayout>
      )}
    </>
  );
}

export default App;
