import React, { useState, useEffect } from 'react'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriend,
  getFriendStatus
} from '../../api';
import Avatar from '../../Component/Avatar/Avatar'
import './FriendButton.css'
import Editprofileform from './Editprofileform'
import Profilebio from './Profilebio'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBirthdayCake, faPen } from '@fortawesome/free-solid-svg-icons'
import NotificationToggle from './NotificationToggle'

const Userprofile = ({ slidein }) => {
    const { id } = useParams()
    const [Switch, setswitch] = useState(false);
  const [friendState, setFriendState] = useState({ status: 'loading' });

    const users = useSelector((state) => state.usersreducer)
    const currentprofile = users.filter((user) => user._id === id)[0]
    const currentuser = useSelector((state) => state.currentuserreducer)

    // fetch friend status
    useEffect(() => {
      const fetchStatus = async () => {
        if (!currentuser?.result?._id || id === currentuser?.result?._id) return;
        try {
          const { data } = await getFriendStatus(id);
          setFriendState(data);
        } catch (err) {
          console.error(err);
          setFriendState({ status: 'error' });
        }
      };
      fetchStatus();
    }, [id, currentuser]);

    if (!currentprofile) {
    return (
      <div className="home-container-1">
        <Leftsidebar slidein={slidein} />
        <div className="home-container-2">
          <h2>User not found</h2>
          {/* Optional: You can redirect to home page or show loader */}
        </div>
      </div>
    )
  }

    return (
        <div className="home-container-1">
            <Leftsidebar slidein={slidein} />
            <div className="home-container-2">
                <section>
                    <div className="user-details-container">
                        <div className="user-details">
                            <Avatar backgroundColor="purple" color="white" fontSize="50px" px="40px" py="30px">
                                {currentprofile.name.charAt(0).toUpperCase()}
                                </Avatar>
                            <div className="user-name">
                                <h1>{currentprofile?.name}</h1>
                                <p>
                                    <FontAwesomeIcon icon={faBirthdayCake} /> Joined{" "} 
                                    {moment(currentprofile?.joinedon).fromNow()}
                                </p>
                            </div>
                        </div>
                        {/* Friend actions */}
                        {currentuser?.result?._id !== id && friendState.status !== 'loading' && friendState.status !== 'error' && (
                            <FriendActions state={friendState} refresh={setFriendState} targetId={id} />
                        )}

                        {currentuser?.result?._id === id && (
                            <button className="edit-profile-btn"
                             type='button' 
                             onClick={() => setswitch(true)}>
                                <FontAwesomeIcon icon={faPen} /> Edit Profile</button>
                        )}
                    </div>
                    <>
                        {Switch ? (
                            <Editprofileform currentuser={currentuser} setswitch={setswitch} />
                        ) : (
                            <Profilebio currentprofile={currentprofile} />
                        )}
                    </>
                </section>
            </div>
            <NotificationToggle/>
        </div>
    )
}

// Separate component for buttons
const FriendActions = ({ state, refresh, targetId }) => {
  const handle = async (action) => {
    try {
      if (action === 'add') {
        await sendFriendRequest(targetId);
      } else if (action === 'cancel') {
        await cancelFriendRequest(state.requestId);
      } else if (action === 'accept') {
        await acceptFriendRequest(state.requestId);
      } else if (action === 'reject') {
        await rejectFriendRequest(state.requestId);
      } else if (action === 'unfriend') {
        await unfriend(targetId);
      }
      const { data } = await getFriendStatus(targetId);
      refresh(data);
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };

  switch (state.status) {
    case 'none':
      return <button className="friend-btn" onClick={() => handle('add')}>Add Friend</button>;
    case 'outgoing':
      return <button className="friend-btn" onClick={() => handle('cancel')}>Cancel Request</button>;
    case 'incoming':
      return (
        <>
          <button className="friend-btn" onClick={() => handle('accept')}>Accept</button>
          <button className="friend-btn" onClick={() => handle('reject')}>Reject</button>
        </>
      );
    case 'friends':
      return <button className="friend-btn" onClick={() => handle('unfriend')}>Unfriend</button>;
    default:
      return null;
  }
};

export default Userprofile
