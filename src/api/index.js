import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001",
    withCredentials: true,
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem("Profile")) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("Profile")).token
            }`;
    }
    return req;
});

export const googleLogin = (authData) =>
    API.post("/user/googlelogin", authData);

export const phoneLogin = (authData) =>
    API.post("/user/phonelogin", authData);
export const sendOtp = (phoneData) => API.post("/user/send-otp", phoneData);
export const verifyOtp = (otpData) => API.post("/user/verify-otp", otpData);

// Email OTP authentication
export const sendEmailOtp = (emailData) => API.post("/user/send-email-otp", emailData);
export const verifyEmailOtp = (otpData) => API.post("/user/verify-email-otp", otpData);

export const login = (authdata) => API.post("/user/login", authdata);
export const signup = (authdata) => API.post("/user/signup", authdata);
export const getallusers = () => API.get("/user/getallusers");
export const updateprofile = (id, updatedata) =>
    API.patch(`user/update/${id}`, updatedata);

export const postquestion = (questiondata) =>
    API.post("/questions/Ask", questiondata);
export const getallquestions = () => API.get("/questions/get");
export const getvideoquestions = () => API.get("/questions/get/video");
export const gettextquestions = () => API.get("/questions/get/text");
export const deletequestion = (id) => API.delete(`/questions/delete/${id}`);
export const votequestion = (id, value) =>
    API.patch(`/questions/vote/${id}`, { value });

export const postanswer = (id, noofanswers, answerbody, useranswered, userid) =>
    API.patch(`/answer/post/${id}`, {
        noofanswers,
        answerbody,
        useranswered,
        userid,
    });

export const deleteanswer = (id, answerid, noofanswers) =>
    API.patch(`/answer/delete/${id}`, { answerid, noofanswers });

export const createPost = (payload) => API.post('/posts/create', payload);
export const getAllPosts = () => API.get('/posts/all');
export const getPostStatus = () => API.get('/posts/status');
export const likePost = (id) => API.patch(`/posts/like/${id}`);
export const addComment = (id, comment) => API.patch(`/posts/comment/${id}`, { comment });
export const sharePost = (id) => API.patch(`/posts/share/${id}`);

export const sendFriendRequest = (friendId) => API.post('/friends/request', { friendId });
export const acceptFriendRequest = (requestId) => API.patch(`/friends/accept/${requestId}`);
export const rejectFriendRequest = (requestId) => API.delete(`/friends/reject/${requestId}`);
export const cancelFriendRequest = (requestId) => API.patch(`/friends/cancel/${requestId}`);
export const unfriend = (friendId) => API.delete(`/friends/remove/${friendId}`);
export const getFriendStatus = (userId) => API.get(`/friends/status/${userId}`);
export const getFriendsList = () => API.get('/friends/list');

export const getLoginHistory = (userId) => API.get(`/user/login-history/${userId}`);

