import * as api from "../api/index"
import { showNotification } from "../Utils/Notification";
import socket from "../socket";

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

       const { questionreducer } = getState();
    const question = questionreducer.data.find((q) => q._id === id);

    // 🔔 Emit event after vote
    socket.emit("send-notification", {
      type: "upvote",
      message: `${question?.questiontitle} received an upvote`,
    });

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

       // 🔔 Emit event after answer
    const { questionreducer } = getState();
    const question = questionreducer.data.find((q) => q._id === id);

    socket.emit("send-notification", {
      type: "answer",
      message: `${useranswered} answered your question: ${question?.questiontitle}`,
    });
    
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