import React from 'react'
import '../Askquestion/Askquestion.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { askquestion } from '../../action/question'
import { sendEmailOtp, verifyEmailOtp } from '../../api/index'
import './VideoUpload.css'


const Askquestion = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state)=>state.currentuserreducer);
    const [questiontitle, setquestiontitle] = useState("");
    const [questionbody, setquestionbody] = useState("");
    const [questiontag, setquestiontags] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [otp, setOtp] = useState("");
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);

    const handlesubmit = async (e) => {
        e.preventDefault();
        // Time constraint check
        const now = new Date();
        const hour = now.getHours();
        if (hour < 14 || hour >= 19) {
            alert("Video uploads are allowed only between 2 PM and 7 PM");
            return;
        }

        if (!isOTPVerified) {
            alert("Please verify OTP before posting");
            return;
        }
        if (!videoFile) {
            alert("Please select a valid video file");
            return;
        }

        if (user) {
            if (questionbody && questiontitle && questiontag) {
                const formData = new FormData();
                formData.append("questiontitle", questiontitle);
                formData.append("questionbody", questionbody);
                formData.append("questiontag", questiontag);
                formData.append("userposted", user.result.name);
                formData.append("video", videoFile);

                dispatch(askquestion(formData, navigate));
                alert("You have successfully posted a question");
            } else {
                alert("Please enter all the fields");
            }
        } else {
            alert("Login to ask question");
        }
    }
    const handleenter = (e) => {
        if (e.code === 'Enter') {
            setquestionbody(questionbody + "\n");
        }
    }

    // Send OTP to user's email
    const handleSendOtp = async () => {
        try {
            await sendEmailOtp({ email: user?.result?.email });
            setIsOTPSent(true);
            alert("OTP sent to your email");
        } catch (error) {
            console.error(error);
            alert("Failed to send OTP");
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Enter OTP");
            return;
        }
        try {
            await verifyEmailOtp({ email: user?.result?.email, otp });
            setIsOTPVerified(true);
            alert("OTP verified successfully");
        } catch (error) {
            console.error(error);
            alert("OTP verification failed");
        }
    };

    // Video change handler
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert("File size should be less than 50MB");
            return;
        }

        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(url);
            if (video.duration > 120) {
                alert("Video length should not exceed 2 minutes");
            } else {
                setVideoFile(file);
            }
        };
        video.src = url;
    };

    return (
        <div className="ask-question">
            <div className="ask-ques-container">
                <h1>Ask a public Question</h1>
                <form onSubmit={handlesubmit}>
                    <div className="ask-form-container">
                        <label htmlFor="ask-form-container">
                            <h4>Title</h4>
                            <p>Be specific and imagine you're asking a question to another person</p>
                            <input type="text" id="ask-ques-title"
                                onChange={(e) => {
                                    setquestiontitle(e.target.value);
                                }} placeholder='e.g. Is there an R function for finding the index of an element in a vector?' />

                        </label>
                        <label htmlFor="ask-ques-body">
                            <h4>Body</h4>
                            <p>Include all the information someone would need to answer your question</p>
                            <textarea name="" id="ask-ques-body" onChange={(e) => {
                                setquestionbody(e.target.value);

                            }}
                                cols="30"
                                rows="10"
                                onKeyDown={handleenter}
                            ></textarea>
                        </label>
                        <label htmlFor="ask-ques-tags">
                            <h4>Tags</h4>
                            <p>Add up to 5 tags to descibe what your question is about</p>
                            <input type="text" id='ask-ques-tags' onChange={(e) => {
                                setquestiontags(e.target.value.split(" "));
                            }}
                                placeholder='e.g. (xml typescript wordpress'
                            />
                        </label>

                        {/* OTP & Video Upload */}
                        <div className="otp-section">
                            {!isOTPVerified && (
                                isOTPSent ? (
                                    <>
                                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                        <button type="button" onClick={handleVerifyOtp}>Verify OTP</button>
                                    </>
                                ) : (
                                    <button type="button" onClick={handleSendOtp}>Send OTP to Email</button>
                                )
                            )}
                            {isOTPVerified && <p className="otp-success">OTP verified!</p>}
                        </div>

                        <label htmlFor="video-upload">
                            <h4>Upload Question Video (max 2 min / 50MB)</h4>
                            <input type="file" accept="video/*" disabled={!isOTPVerified} onChange={handleVideoChange} />
                        </label>
                    </div>
                    <input type="submit"
                        value="Review your question"
                        className='review-btn' />

                </form>
            </div>

        </div>
    )
}

export default Askquestion
