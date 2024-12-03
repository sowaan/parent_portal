import React, { Suspense, useEffect, useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import { Navigate, Route, Routes } from "react-router-dom";

import { CSpinner } from "@coreui/react";
import "./scss/style.scss";

// We use those styles to show code examples, you should remove them in your application.
import "./scss/examples.scss";
import axios from "axios";
const Dashboard = React.lazy(() => import("./views/Dashboard"));
const Home = React.lazy(() => import("./views/Home"));
const PaidFee = React.lazy(() => import("./views/PaidFee"));
const Login = React.lazy(() => import("./views/Login"));
const FeeForm = React.lazy(() => import("./views/FeeForm"));

function App() {
  const [sidebarShow, setSidebarShow] = useState(true);
  const { isLoading, currentUser } = useFrappeAuth();

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

  useEffect(() => {
    getAppData();
  }, []);

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
      <Routes>
        {!currentUser ? (
          // Redirect to login if user is not authenticated
          <Route path="*" element={<Navigate to="/parent-login" replace />} />
        ) : (
          // Authenticated user routes
          <>
            <Route
              path="/parent-login"
              element={<Navigate to="/student-fee" replace />}
            />
            <Route
              path="/student-fee"
              element={
                <Home
                  sidebarShow={sidebarShow}
                  setSidebarShow={setSidebarShow}
                />
              }
            />
            <Route
              path="/student-paid-fee"
              element={
                <PaidFee
                  sidebarShow={sidebarShow}
                  setSidebarShow={setSidebarShow}
                />
              }
            />
            <Route
              path="/student-fee/:slug"
              element={
                <FeeForm
                  sidebarShow={sidebarShow}
                  setSidebarShow={setSidebarShow}
                />
              }
            />
            <Route
              path="*"
              element={
                <Dashboard
                  sidebarShow={sidebarShow}
                  setSidebarShow={setSidebarShow}
                />
              }
            />
          </>
        )}
        <Route path="/parent-login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default App;
