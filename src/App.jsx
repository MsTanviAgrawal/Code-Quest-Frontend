import { fetchallusers } from './action/users';
import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './Component/Navbar/Navbar'
import { BrowserRouter as Router } from 'react-router-dom';
import Allroutes from './Allroutes'
import { useDispatch } from 'react-redux';
import { fetchallquestion } from './action/question';
import { requestNotificationPermission, showNotification } from './Utils/Notification'
import { connectSocket } from './Utils/socket'

function App() {
  const [slidein, setSlideIn] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchallusers());
    dispatch(fetchallquestion());
  }, [dispatch])

  useEffect(() => {
    // Connect to socket.io and set up notification listeners
    const profile = localStorage.getItem("Profile");
    const notificationsEnabled = localStorage.getItem("notificationsEnabled") === "true";
    if (profile && notificationsEnabled) {
      const user = JSON.parse(profile)?.result;
      if (user && user._id) {
        const socket = connectSocket(user._id);
        socket.on("new_answer", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("New Answer", `${data.useranswered} answered your question!`);
          }
        });
        socket.on("question_upvoted", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("Question Upvoted", `${data.upvotedBy} upvoted your question!`);
          }
        });
        socket.on("question_downvoted", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("Question Downvoted", `${data.downvotedBy} downvoted your question!`);
          }
        });
        socket.on("friend_request", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("New Friend Request", `Request sent by ${data.fromUserName}`);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSlideIn(false)
    }
  }, [])
  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSlideIn((state) => !state);
    }
  };
  useEffect(() => {
  const enabled = localStorage.getItem("notificationsEnabled") === "true";
  if (enabled) {
    requestNotificationPermission();
  }
}, []);

  return (
    <>
      <div className='App'>
        <Router>
          <Navbar handleslidein={handleslidein} />
          <Allroutes slidein={slidein} handleslidein={handleslidein} />
        </Router>

      </div>

    </>
  )
}

export default App
