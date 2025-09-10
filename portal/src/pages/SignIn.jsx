import { Link } from "react-router-dom";
import sowaanLogo from "../images/logo/sowaan.png";
import Loader from "../common/Loader";
import { useFrappeAuth } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { IconEye, IconEyeOff, IconLock, IconMail } from "../common/Icons";
import { ErrorAlert } from "../common/Alerts";
import { toast } from "react-toastify";

const SignIn = () => {
  const { isLoading, currentUser } = useFrappeAuth();
  const navigator = useNavigate();
  const appData = JSON.parse(localStorage.getItem("appData"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

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
      toast.error(err.response.data._server_messages || err);
      setError("Invalid email or password");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    setForgotLoading(true);
    try {
      await axios.post("/api/method/frappe.core.doctype.user.user.reset_password", {
        user: forgotEmail,
      });
      setForgotMsg("Password reset instructions sent to your email.");
    } catch (err) {
      setForgotMsg(
        err.response?.data?.message || "Failed to send reset instructions."
      );
    }
    setForgotLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      navigator("/");
    }
  }, [currentUser]);

  useEffect(() => {}, [appData]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-24 px-10 text-center flex flex-col items-center justify-center h-full">
              <Link className="mb-6 inline-block" to="/">
                <img
                  className="max-h-[100px]"
                  src={(appData ? appData.app_logo : null) ?? sowaanLogo}
                  alt="Logo"
                />
              </Link>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-2">Welcome to Parent Portal</h2>
              <p className="text-gray-400 text-sm">Access your child's academic information easily and securely.</p>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            {error ? <ErrorAlert title="Error" message={error} /> : ""}
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Sign In to {(appData ? appData.app_name : null) ?? "Sowaan"}
              </h2>

              {!showForgot ? (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <Input
                      id="email"
                      type="email"
                      label="Email"
                      placeholder="Enter your email"
                      value={email}
                      onChanged={(e) => setEmail(e.target.value)}
                      required={true}
                      icon={
                        <span className="absolute right-4 top-4">
                          <IconMail />
                        </span>
                      }
                    />
                  </div>

                  <div className="mb-6">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChanged={(e) => setPassword(e.target.value)}
                      required={true}
                      icon={
                        <span
                          className="absolute right-4 top-4"
                          onClick={togglePasswordVisibility}
                        >
                          {password == "" ? (
                            <IconLock />
                          ) : showPassword ? (
                            <IconEyeOff />
                          ) : (
                            <IconEye />
                          )}
                        </span>
                      }
                    />
                  </div>

                  <div className="mb-5">
                    <input
                      disabled={loading}
                      type="submit"
                      value={loading ? "Loading..." : "Sign In"}
                      className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-5">
                    <span></span>
                    <button
                      type="button"
                      className="text-xs text-blue-500 hover:underline focus:outline-none"
                      onClick={() => setShowForgot((v) => !v)}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="mb-5">
                  <div className="mb-2">
                    <Input
                      id="forgot-email"
                      type="email"
                      label="Enter your email to reset password"
                      placeholder="Email"
                      value={forgotEmail}
                      onChanged={(e) => setForgotEmail(e.target.value)}
                      required={true}
                      icon={
                        <span className="absolute right-4 top-4">
                          <IconMail />
                        </span>
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-lg border border-primary bg-primary p-2 text-white text-xs mb-2 hover:bg-opacity-90"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  {forgotMsg && (
                    <div className="text-xs text-center text-green-600 dark:text-green-400">{forgotMsg}</div>
                  )}
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      className="text-xs text-blue-500 hover:underline focus:outline-none"
                      onClick={() => setShowForgot(false)}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
              <div className="mt-6 text-center">
                <p>
                  Powered by{" "}
                  <a
                    href="https://sowaanerp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    SowaanERP
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
