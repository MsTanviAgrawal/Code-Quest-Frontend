import * as api from "../api/index";
import { showNotification } from "../Utils/Notification";

export const askquestion = (questiondata, navigate) => async (dispatch) => {

    let title = "";
    let tags = [];
    if (questiondata instanceof FormData) {
        title = questiondata.get("questiontitle") || "";
        tags = questiondata.get("questiontag") || [];
    } else {
        ({ questiontitle: title, questiontags: tags } = questiondata);
    }

    if (!title.trim()) {
        showNotification("Error", "Question title cannot be empty.");
        return;
    }

    if (!tags || (Array.isArray(tags) ? tags.length === 0 : !tags)) {
        showNotification("Error", "Please add at least one tag.");
        return;
    }

    try {
        // Check user subscription status before posting question
        const subscriptionResponse = await fetch('http://localhost:5001/subscription/user-subscription', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('Profile'))?.token}`
            }
        });

        const subscriptionData = await subscriptionResponse.json();
        
        // If user has no active subscription, only allow free plan limit (1 question per day)
        if (!subscriptionResponse.ok) {
            // User has no subscription, treat as free plan
            const questionsToday = await checkTodaysQuestionCount();
            if (questionsToday >= 1) {
                showNotification("Error", "Free plan users can only post 1 question per day. Please upgrade your subscription.");
                return;
            }
        } else {
            // Check plan limits
            const planLimits = {
                'free': 1,
                'bronze': 5,
                'silver': 10,
                'gold': Infinity // Unlimited
            };
            
            const userPlan = subscriptionData.plan;
            const questionsToday = await checkTodaysQuestionCount();
            
            if (questionsToday >= planLimits[userPlan]) {
                showNotification("Error", `You have reached your daily limit of ${planLimits[userPlan]} questions for your ${userPlan} plan. Please try again tomorrow.`);
                return;
            }
        }

        const config = questiondata instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
        const { data } = await api.postquestion(questiondata, config);
        dispatch({ type: "POST_QUESTION", payload: data });
        dispatch(fetchallquestion());
        navigate("/");
    } catch (error) {
        console.log(error);
        showNotification("Error", "Failed to post question. Please try again.");
    }
};

// Helper function to check today's question count
const checkTodaysQuestionCount = async () => {
    try {
        // In a real implementation, this would call an API endpoint to get the user's question count for today
        // For now, we'll return 0 as a placeholder
        return 0;
    } catch (error) {
        console.error('Error checking question count:', error);
        return 0; // Default to 0 if there's an error
    }
};

// Fetch All Questions
export const fetchallquestion = () => async (dispatch) => {
    try {
        const { data } = await api.getallquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// Alias for consistency
export const fetchallquestions = fetchallquestion;

// Fetch Video Questions
export const fetchvideoquestions = () => async (dispatch) => {
    try {
        const { data } = await api.getvideoquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// Fetch Text Questions
export const fetchtextquestions = () => async (dispatch) => {
    try {
        const { data } = await api.gettextquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// Delete Question
export const deletequestion = (id, navigate) => async (dispatch) => {
    try {
        await api.deletequestion(id);
        dispatch(fetchallquestion());
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};

// Vote Question 
export const votequestion = (id, value) => async (dispatch) => {
    try {
        await api.votequestion(id, value);
        dispatch(fetchallquestion());

        let action = "";
        if (value === "upvote") {
            action = "upvoted";
        } else if (value === "downvote") {
            action = "downvoted";
        } else {
            action = "voted";
        }

        showNotification("Question Vote", `You ${action} a question.`);
    } catch (error) {
        console.log(error);
    }
};

// Post Answer
export const postanswer = (answerdata) => async (dispatch) => {
    try {
        const { id, noofanswers, answerbody, useranswered, userid } = answerdata;
        const { data } = await api.postanswer(id, noofanswers, answerbody, useranswered, userid);
        dispatch({ type: "POST_ANSWER", payload: data });
        dispatch(fetchallquestion());

        showNotification("New Answer", `${useranswered} answered your question!`);
    } catch (error) {
        console.log(error);
    }
};

// Delete Answer
export const deleteanswer = (id, answerid, noofanswers) => async (dispatch) => {
    try {
        await api.deleteanswer(id, answerid, noofanswers);
        dispatch(fetchallquestion());
    } catch (error) {
        console.log(error);
    }
};
