import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { FrappeProvider } from "frappe-react-sdk";
import { BrowserRouter as Router } from "react-router-dom";

import "./css/style.css";
import "./css/satoshi.css";
import "flatpickr/dist/flatpickr.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FrappeProvider socketPort={import.meta.env.VITE_SOCKET_PORT ?? ""}>
      <Router basename={import.meta.env.VITE_BASE_PATH}>
        <App />
      </Router>
    </FrappeProvider>
  </StrictMode>
);
