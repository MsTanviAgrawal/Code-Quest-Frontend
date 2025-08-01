
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from '../../assets/icon.png';
import Aboutauth from './Aboutauth';
import './Auth.css';
import { login, signup, googleSignIn, phoneSignIn, verifyOTP } from '../../action/auth';
// import { signInWithPopup, auth, provider } from '../../firebase';

// Phone authentication UI component
const PhoneAuthSection = ({ isSignup, navigate }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await dispatch(phoneSignIn(phone, navigate, isSignup));
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await dispatch(verifyOTP(phone, otp, navigate, isSignup));
    } catch (err) {
      setError(err.message || "OTP verification failed");
    }
    setLoading(false);
  };

  return (
    <div className="phone-auth-section">
      <input
        type="tel"
        placeholder="Phone number (e.g. +911234567890)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={otpSent || loading}
      />
      <button
        type="button"
        className="auth-btn"
        onClick={handleSendOTP}
        disabled={loading || !phone || otpSent}
      >
        {loading && !otpSent ? "Sending..." : isSignup ? "Send OTP to Sign Up" : "Send OTP to Login"}
      </button>
      {otpSent && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <button
            type="button"
            className="auth-btn verify"
            onClick={handleVerifyOTP}
            disabled={loading || !otp}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};


const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode'); 

  const [isSignup, setIsSignup] = useState(false);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    
    if (mode === 'Signup') {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }
  }, [mode]);
  

  const handleSwitch = () => {
    // Toggle mode and update URL
    const newMode = isSignup ? 'login' : 'Signup';
    navigate(`/Auth?mode=${newMode}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      if (!name || !email || !password) return alert("Please fill all fields");
      dispatch(signup({ name, email, password }, navigate));
    } else {
      if (!email || !password) return alert("Please fill all fields");
      dispatch(login({ email, password }, navigate));
    }
  };

 const handleGoogleSignIn = () => {
  dispatch(googleSignIn(navigate, isSignup));
};


  return (
    <section className="auth-section">
      {isSignup && <Aboutauth />}

      <div className="auth-container-2">
        {!isSignup && <img src={icon} alt="stack-overflow" className="login-logo" />}

        <button className="auth-btn google-btn" onClick={handleGoogleSignIn}>
          {isSignup ? "Sign up with Google" : "Log in with Google"}
        </button>

        {/* Phone Auth Section */}
        <PhoneAuthSection isSignup={isSignup} navigate={navigate} />

        

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              <h4>Display Name</h4>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />
            </label>
          )}

          <label>
            <h4>Email</h4>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
          </label>

          <label>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Password</h4>
              {!isSignup && (
                <p style={{ color: "#007ac6", fontSize: "13px" }}>
                  Forgot Password?
                </p>
              )}
            </div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
            {isSignup && (
              <p style={{ color: "#666767", fontSize: "13px" }}>
                Passwords must contain at least eight characters,
                including at least 1 letter and 1 number.
              </p>
            )}
          </label>

          <button type="submit" className="auth-btn">
            {isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="switch-btn" onClick={handleSwitch}>
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </section>
  );
};

export default Auth;

