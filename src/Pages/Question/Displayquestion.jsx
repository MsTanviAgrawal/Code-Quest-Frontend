import React from 'react'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import Rightsidebar from '../../Component/Rightsidebar/Rightsidebar'
import Questiondetails from './Questiondetails'


const Displayquestion = ({slidein}) => {
  return (
    <div className="home-container-1">
      <Leftsidebar slidein={slidein}/>
      <div className="home-container-2">
      
        <Rightsidebar/>
        <Questiondetails/>
      </div>
      {/* <div className="home-container-3">
        
       
      </div> */}
    </div>
  )
}

export default Displayquestion
