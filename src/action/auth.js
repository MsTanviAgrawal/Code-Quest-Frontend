import * as api from '../api/index';
import { setcurrentuser } from './currentuser';
import { fetchallusers } from './users';
import { auth, provider, signInWithPopup } from "../firebase";

// Regular signup
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

// Regular login
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

// ✅ Google Sign-In action
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
