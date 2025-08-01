import * as api from "../api/index";
import { showNotification } from "../Utils/Notification";

// ✅ Ask Question with optional video support
export const askquestion = (questiondata, navigate) => async (dispatch) => {
    // When using FormData we cannot access fields directly unless we convert. So just basic validation done in component.
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
        const config = questiondata instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
        const { data } = await api.postquestion(questiondata, config);
        dispatch({ type: "POST_QUESTION", payload: data });
        dispatch(fetchallquestion());
        navigate("/");
    } catch (error) {
        console.log(error);
        showNotification("Error", "Failed to post the question.");
    }
};

// ✅ Fetch All Questions
export const fetchallquestion = () => async (dispatch) => {
    try {
        const { data } = await api.getallquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
        console.log(error);
    }
};

// ✅ Delete Question
export const deletequestion = (id, navigate) => async (dispatch) => {
    try {
        await api.deletequestion(id);
        dispatch(fetchallquestion());
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};

// ✅ Vote Question (Upvote/Downvote)
export const votequestion = (id, value) => async (dispatch) => {
    try {
        await api.votequestion(id, value);
        dispatch(fetchallquestion());

        // 🟢 Determine vote type
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

// ✅ Post Answer
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

// ✅ Delete Answer
export const deleteanswer = (id, answerid, noofanswers) => async (dispatch) => {
    try {
        await api.deleteanswer(id, answerid, noofanswers);
        dispatch(fetchallquestion());
    } catch (error) {
        console.log(error);
    }
};
