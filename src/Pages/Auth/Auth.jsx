import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import icon from '../../assets/icon.png';
import Aboutauth from './Aboutauth';
import './Auth.css';
import { login, signup, googleSignIn, phoneSignIn, verifyOTP } from '../../action/auth';

const PhoneAuthSection = ({ isSignup, navigate }) => {
  const { t } = useTranslation();
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
      setError(err.message || t('common.somethingWentWrong'));
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await dispatch(verifyOTP(phone, otp, navigate, isSignup));
    } catch (err) {
      setError(err.message || t('auth.verifyOTP'));
    }
    setLoading(false);
  };

  return (
    <div className="phone-auth-section">
      <input
        type="tel"
        placeholder={t('auth.phoneLogin')}
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
        {loading && !otpSent ? t('common.loading') : isSignup ? t('auth.signupSuccess') : t('auth.phoneLogin')}
      </button>
      {otpSent && (
        <>
          <input
            type="text"
            placeholder={t('auth.enterOTP')}
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <button
            type="button"
            className="auth-btn verify"
            onClick={handleVerifyOTP}
            disabled={loading || !otp}
          >
            {loading ? t('common.loading') : t('auth.verifyOTP')}
          </button>
        </>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const Auth = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode'); 

  const [isSignup, setIsSignup] = useState(false);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'Signup') {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }
    
    // Detect browser for user information
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    
    if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
      browser = "Chrome (OTP required)";
    } else if (userAgent.includes("Edge")) {
      browser = "Microsoft Edge (Direct login)";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browser = "Safari";
    }
    
    setBrowserInfo(browser);
  }, [mode]);

  const handleSwitch = () => {
    const newMode = isSignup ? 'login' : 'Signup';
    navigate(`/Auth?mode=${newMode}`);
    // Reset form state
    setNeedOtp(false);
    setOtp("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (isSignup) {
      if (!name || !email || !password) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }
      
      try {
        await dispatch(signup({ name, email, password }, navigate));
      } catch (err) {
        setError(err.message || t('common.somethingWentWrong'));
      }
    } else {
      if (!email || !password) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }
      
      try {
        // Check if Chrome browser requires OTP
        const userAgent = navigator.userAgent;
        const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edge");
        
        if (isChrome && !needOtp) {
          // First attempt - will trigger OTP sending
          await dispatch(login({ email, password }, navigate));
          setNeedOtp(true);
          setError("");
        } else if (needOtp && otp) {
          // Second attempt with OTP
          await dispatch(login({ email, password, otp }, navigate));
        } else {
          // Direct login for non-Chrome browsers
          await dispatch(login({ email, password }, navigate));
        }
      } catch (err) {
        if (err.message && err.message.includes("OTP")) {
          setNeedOtp(true);
          setError(err.message);
        } else {
          setError(err.message || t('common.somethingWentWrong'));
        }
      }
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    // Check if there's already a pending Google sign-in popup
    if (window.googleSignInPending) {
      setError("A Google sign-in popup is already open. Please complete or close it first.");
      return;
    }
    
    window.googleSignInPending = true;
    try {
      await dispatch(googleSignIn(navigate));
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      window.googleSignInPending = false;
    }
  };

  return (
    <section className="auth-section">
      {isSignup && <Aboutauth />}

      <div className="auth-container-2">
        {!isSignup && <img src={icon} alt="stack-overflow" className="login-logo" />}

        {/* Browser Info Display */}
        <div className="browser-info" style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>Browser:</strong> {browserInfo}
          {browserInfo.includes("Chrome") && (
            <div style={{ marginTop: '5px', color: '#007ac6' }}>
              📧 {t('auth.enterOTP')}
            </div>
          )}
          {browserInfo.includes("Edge") && (
            <div style={{ marginTop: '5px', color: '#28a745' }}>
              ✅ {t('auth.loginSuccess')}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message" style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            padding: '10px',
            margin: '10px 0'
          }}>
            {error}
          </div>
        )}

        <button className="auth-btn google-btn" onClick={handleGoogleSignIn}>
          {isSignup ? t('auth.googleSignup') : t('auth.googleLogin')}
        </button>

        {/* Phone Auth Section */}
        <PhoneAuthSection isSignup={isSignup} navigate={navigate} />

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              <h4>{t('auth.name')}</h4>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setname(e.target.value)}
                disabled={loading}
              />
            </label>
          )}

          <label>
            <h4>{t('auth.email')}</h4>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              disabled={loading || needOtp}
            />
          </label>

          <label>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>{t('auth.password')}</h4>
              {!isSignup && (
                <p style={{ color: "#007ac6", fontSize: "13px" }}>
                  {t('auth.forgotPassword')}
                </p>
              )}
            </div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              disabled={loading || needOtp}
            />
            {isSignup && (
              <p style={{ color: "#666767", fontSize: "13px" }}>
                {t('auth.password')}
              </p>
            )}
          </label>

          {/* OTP Input for Chrome browsers */}
          {needOtp && !isSignup && (
            <label>
              <h4>{t('auth.enterOTP')}</h4>
              <input
                type="text"
                placeholder={t('auth.enterOTP')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                disabled={loading}
                style={{
                  border: '2px solid #007ac6',
                  backgroundColor: '#f0f8ff'
                }}
              />
              <p style={{ color: "#007ac6", fontSize: "13px" }}>
                {t('auth.enterOTP')}
              </p>
            </label>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              t('common.loading')
            ) : needOtp && !isSignup ? (
              t('auth.verifyOTP')
            ) : isSignup ? (
              t('auth.signup')
            ) : (
              t('auth.login')
            )}
          </button>
        </form>

        <p>
          {isSignup ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{" "}
          <button className="switch-btn" onClick={handleSwitch} disabled={loading}>
            {isSignup ? t('auth.login') : t('auth.signup')}
          </button>
        </p>
      </div>
    </section>
  );
};

export default Auth;
