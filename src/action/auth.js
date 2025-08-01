import * as api from '../api/index';
import { signInWithPopup, auth, provider } from '../firebase';
import { setcurrentuser } from './currentuser';
import { fetchallusers } from './users';

export const signup = (authdata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.signup(authdata);
        localStorage.setItem("Profile", JSON.stringify(data));
        dispatch({ type: "AUTH", data });
        // dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
         dispatch(setcurrentuser(data)); // use data directly instead of localStorage
        dispatch(fetchallusers());
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};

export const login = (authdata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.login(authdata);
        localStorage.setItem("Profile", JSON.stringify(data));
        dispatch({ type: "AUTH", data });
        //dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
         dispatch(setcurrentuser(data));
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};


export const googleSignIn = (navigate, isSignup = false) => async (dispatch) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const idToken = await user.getIdToken();
    const authData = {
      name: user.displayName,
      email: user.email,
      token: idToken,
      googleId: user.uid,
      isSignup,
    };

    const { data } = await api.googleLogin(authData);
    localStorage.setItem("Profile", JSON.stringify(data));
    dispatch({ type: "AUTH", data });

    //dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
    dispatch(setcurrentuser(data));

    dispatch(fetchallusers());
    navigate("/");
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    alert("Google sign-in failed");
  }
};

// Phone Authentication using Fast2SMS backend
export const phoneSignIn = (phone, navigate, isSignup = false) => async (dispatch) => {
    try {
        await api.sendOtp({ phone });
        // No dispatch needed, just trigger OTP UI
    } catch (error) {
        alert(error?.response?.data?.message || "Failed to send OTP");
        throw error;
    }
};

// Verify OTP and complete phone authentication
export const verifyOTP = (phone, otp, navigate, isSignup = false) => async (dispatch) => {
    try {
        const { data } = await api.verifyOtp({ phone, otp });
        localStorage.setItem("Profile", JSON.stringify(data));
        dispatch({ type: "AUTH", data });
        dispatch(setcurrentuser(data));
        dispatch(fetchallusers());
        navigate("/");
    } catch (error) {
        alert(error?.response?.data?.message || "OTP verification failed");
        throw error;
    }
};
