import * as api from '../api/index';
import { setcurrentuser } from './currentuser';
import { fetchallusers } from './users';
import { auth, provider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase";

export const signup = (authdata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.signup(authdata);
        dispatch({ type: "AUTH", data });
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
        dispatch(fetchallusers());
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};

export const login = (authdata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.login(authdata);
        dispatch({ type: "AUTH", data });
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};

export const googleSignIn = (navigate) => async (dispatch) => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const authData = {
            name: user.displayName,
            email: user.email,
            token: user.accessToken,
            googleId: user.uid,
        };
        const { data } = await api.googleLogin(authData);

        dispatch({ type: "AUTH", data });
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
        dispatch(fetchallusers());
        navigate("/");
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert("Google sign-in failed");
    }
};

export const phoneSignUp = (userData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.phoneLogin(userData);
    dispatch({ type: "AUTH", data });
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
    navigate("/");
  } catch (error) {
    console.error("Phone sign-in failed", error);
  }
};




// export const phoneSignUp = (phoneNumber, navigate) => async (dispatch) => {
//   try {
//     const recaptcha = new RecaptchaVerifier(
//       "recaptcha-container",
//       {
//         size: "invisible",
//         callback: () => {
//           console.log("reCAPTCHA verified");
//         },
//       },
//       auth
//     );

//     const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
//     const code = prompt("Enter the OTP sent to your phone:");
//     const result = await confirmationResult.confirm(code);

//     const user = result.user;

//     const authData = {
//       name: user.phoneNumber,
//       email: user.phoneNumber,
//       token: user.accessToken,
//     };

//     // Optional: send to backend
//     const { data } = await api.signup(authData);

//     dispatch({ type: "AUTH", data });
//     dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
//     dispatch(fetchallusers());
//     navigate("/");
//   } catch (error) {
//     console.error("Phone Sign-In Error:", error);
//     alert("Phone sign-in failed");
//   }
// };
