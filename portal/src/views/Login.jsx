import { useFrappeAuth } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CButton,
  CForm,
  CFormInput,
  CImage,
  CInputGroup,
  CInputGroupText,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLowVision } from "@coreui/icons";
import "./LoginPage.css";
import students from "../assets/student-login.svg";
import sowaanLogo from "../images/logo/sowaan.png";

const Login = () => {
  const { isLoading, currentUser } = useFrappeAuth();
  const navigator = useNavigate();
  const appData = JSON.parse(localStorage.getItem("appData"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRes = await axios.post("/api/method/login", {
        usr: email,
        pwd: password,
      });

      // if login response is successful, set the user in the context
      if (loginRes.status === 200) {
        const userRes = await axios.get(
          "/api/method/parent_portal.parent_portal.api.get_currentuser"
        );
        const user = userRes.data.message;
        localStorage.setItem("user", JSON.stringify(user));
        // Navigate or perform post-login actions
        window.location.pathname = "/portal";
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err, "error");
      setError("Invalid email or password");
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigator("/");
    }
  }, [currentUser]);

  useEffect(() => {}, [appData]);

  if (isLoading) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  return (
    <div className="c-container">
      <div className="c-login">
        {/* Left Section */}
        <div className="c-login-left">
          <div className="d-flex justify-content-center">
            <CImage
              className="mb-3"
              src={(appData ? appData.app_logo : null) ?? sowaanLogo}
              alt="Sowaan Logo"
              height={60}
            />
          </div>
          {error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <h5 className="d-flex justify-content-center">
              Login to {(appData ? appData.app_name : null) ?? "Sowaan"}
            </h5>
          )}
          <CForm onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <CFormInput
                id="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <CInputGroup>
                <CFormInput
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <CInputGroupText
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  <CIcon icon={cilLowVision} />
                </CInputGroupText>
              </CInputGroup>
            </div>

            {/* Login Button */}
            <CButton
              disabled={loading}
              type="submit"
              color="primary"
              className="w-100 mt-3"
            >
              {loading ? "Loading..." : "Login"}
            </CButton>
          </CForm>
        </div>

        {/* Right Section */}
        <div className="c-login-right">
          <h1>
            Welcome to <br /> Parent portal
          </h1>
          <p>Login to access your account</p>
          <img src={students} alt="students" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
