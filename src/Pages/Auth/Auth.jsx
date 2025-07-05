
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from '../../assets/icon.png';
import Aboutauth from './Aboutauth';
import './Auth.css';
import { login, signup, googleSignIn } from '../../action/auth';
// import { signInWithPopup, auth, provider } from '../../firebase';


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

// const handleGoogleSignIn = async () => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user;

//     let emailToUse = user.email;

//     if (isSignup && !emailToUse) {
//       emailToUse = prompt("Enter your email to complete signup:");
//     }

//     const authData = {
//       name: user.displayName,
//       email: emailToUse,
//       token: user.accessToken,
//       googleId: user.uid,
//     };

//     dispatch(googleSignIn(authData, navigate)); // Send authData to backend
//   } catch (error) {
//     console.error("Google Sign-In Error:", error.message);
//     alert("Google sign-in failed");
//   }
// };


  return (
    <section className="auth-section">
      {isSignup && <Aboutauth />}

      <div className="auth-container-2">
        {!isSignup && <img src={icon} alt="stack-overflow" className="login-logo" />}

        <button className="auth-btn google-btn" onClick={handleGoogleSignIn}>
          {isSignup ? "Sign up with Google" : "Log in with Google"}
        </button>

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

