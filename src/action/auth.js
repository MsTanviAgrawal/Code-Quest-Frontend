import * as api from '../api/index';
import { setcurrentuser } from './currentuser';
import { fetchallusers } from './users';
import { auth, provider, signInWithPopup} from "../firebase";

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

    const authData = {
      name: user.displayName,
      email: user.email,
      token: user.accessToken,
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


