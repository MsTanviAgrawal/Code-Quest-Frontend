import { fetchallusers } from './action/users';
import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './Component/Navbar/Navbar'
import { BrowserRouter as Router } from 'react-router-dom';
import Allroutes from './Allroutes'
import { useDispatch } from 'react-redux';
import { fetchallquestion } from './action/question';
import { requestNotificationPermission } from './Utils/Notification'

function App() {
  const [slidein, setSlideIn] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchallusers());
    dispatch(fetchallquestion());
  }, [dispatch])

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
