// src/MainLayout.js
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import socket from "./socket"; // we'll create this in Step 3
import { showNotification } from "./Utils/Notification"; // your browser notif helper

const MainLayout = () => {
  useEffect(() => {
    socket.on("receive-notification", (data) => {
      const enabled = localStorage.getItem("notificationsEnabled") === "true";
      if (enabled) {
        showNotification("Stack Overflow Clone", data.message);
      }
    });

    return () => {
      socket.off("receive-notification");
    };
  }, []);

  return (
    <div>
      {/* You can optionally add a Navbar here */}
      <Outlet />
    </div>
  );
};

export default MainLayout;
