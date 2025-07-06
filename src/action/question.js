import * as api from "../api/index"
import { showNotification } from "../Utils/Notification";

export const askquestion = (questiondata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.postquestion(questiondata);
        dispatch({ type: "POST_QUESTION", payload: data });
        dispatch(fetchallquestion())
        navigate("/")
    } catch (error) {
        console.log(error)
    }
};

export const fetchallquestion = () => async (dispatch) => {
    try {
        const { data } = await api.getallquestions();
        dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data })
    } catch (error) {
        console.log(error)
    }
}

export const deletequestion = (id, navigate) => async (dispatch) => {
    try {
        await api.deletequestion(id);
        dispatch(fetchallquestion());
        navigate("/")
    } catch (error) {
        console.log(error)
    }
}

export const votequestion = (id, value) => async (dispatch) => {
    try {
        await api.votequestion(id, value);
        dispatch(fetchallquestion());

        // ✅ Show notification
        const action = value === 1 ? "upvoted" : "downvoted";

        showNotification("Question Vote", `Your question was ${action}.`);

        // showNotification("Question Vote", {
        //     body: `Your question was ${action}.`,
        //     icon: "/favicon.ico",
        // });
    } catch (error) {
        console.log(error)
    }
}


export const postanswer = (answerdata) => async (dispatch) => {
    try {
        const { id, noofanswers, answerbody, useranswered, userid } = answerdata;
        const { data } = await api.postanswer(id, noofanswers, answerbody, useranswered, userid);
        dispatch({ type: "POST_ANSWER", payload: data });
        dispatch(fetchallquestion())

        showNotification("New Answer", `${useranswered} answered your question!`);


        //      showNotification("New Answer", {
        //   body: `${useranswered} answered your question!`,
        //   icon: "/favicon.ico",
        // });

    } catch (error) {
        console.log(error)
    }
}

export const deleteanswer = (id, answerid, noofanswers) => async (dispatch) => {
    try {
        await api.deleteanswer(id, answerid, noofanswers);
        dispatch(fetchallquestion())
    } catch (error) {
        console.log(error)
    }
};