import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [initialOtp, setInitialOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  function handleContinue() {
    if (isEmailVerified) {
      setStep(2);
    } else {
      toast.error("Please verify your email first.");
    }
  }

  function handleBack() {
    setStep(1);
  }

  function handleSignup() {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    axios
      .post("http://localhost:8080/addstudent", {
        email,
        firstname,
        lastname,
        password,
      })
      .then((res) => {
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      })
      .catch(() => {
        toast.error("Failed to create account. Please try again.");
      });
  }

  function checkPasswordStrength(value) {
    setPassword(value);
    let strength = 0;
    if (/[A-Z]/.test(value)) strength += 1;
    if (/[a-z]/.test(value)) strength += 1;
    if (/\d/.test(value)) strength += 1;
    if (/[^A-Za-z0-9]/.test(value)) strength += 1;

    if (value.length >= 8 && strength === 4) {
      setPasswordStrength("strong");
    } else if (value.length >= 6 && strength >= 2) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  }

  function sendOtp() {
    setIsLoading(true);
    axios
      .post("http://localhost:8080/send-otp", { email })
      .then((res) => {
        setInitialOtp(res.data.otp);
        setIsOtpSent(true);
        setResendCooldown(60);
        toast.success("OTP sent to your email!");
      })
      .catch((error) => {
        if (error.response && error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function verifyOtp() {
    if (otp !== initialOtp) {
      toast.error("OTP didn't match!");
      return;
    }
    setIsEmailVerified(true);
    setIsOtpSent(false);
    setStep(2);
    toast.success("Email verified successfully!");
  }

  return (
    <div className="loginpage">
      <div className={`login-container ${step === 2 ? "step-two" : ""}`}>
        <p className="login-text">Sign Up!</p>
        <div className="login-input-class">
          {step === 1 && (
            <>
              <input
                className="login-input"
                type="text"
                name="firstname"
                placeholder="Enter First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <input
                className="login-input"
                type="text"
                name="lastname"
                placeholder="Enter Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
              <input
                className="login-input"
                type="text"
                name="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!isOtpSent && (
                <button
                  onClick={sendOtp}
                  className="login-button"
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? <div className="spinner"></div> : "Verify Email"}
                </button>
              )}
              {isOtpSent && (
                <>
                  <input
                    className="login-input"
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    onClick={verifyOtp}
                    className="login-button"
                    type="button"
                  >
                    Verify OTP
                  </button>
                  {resendCooldown === 0 ? (
                    <button onClick={sendOtp} className="resend-otp">
                      Resend OTP
                    </button>
                  ) : (
                    <p className="resend-timer">
                      Resend OTP in {resendCooldown}s
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <input
                className="login-input"
                type="password"
                name="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => checkPasswordStrength(e.target.value)}
              />
              <input
                className="login-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {password && (
                <div className={`password-strength ${passwordStrength}`}>
                  {passwordStrength === "strong" && "Strong password"}
                  {passwordStrength === "medium" &&
                    "Medium password (try adding uppercase, number, and special character)"}
                  {passwordStrength === "weak" &&
                    "Weak password (try adding uppercase, number, and special character)"}
                </div>
              )}
              <button
                onClick={handleSignup}
                className="login-button"
                type="button"
              >
                Register
              </button>
              <a onClick={handleBack} className="back-link">
                ← Back
              </a>
            </>
          )}

          <p>
            Already have an account?{" "}
            <Link to="/login" className="login-signup">
              Login Here!
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}
