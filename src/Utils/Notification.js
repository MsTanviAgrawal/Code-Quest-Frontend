// utils/notification.js
export const showNotification = (title, body) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico", // Or any icon you want
    });
  }
};

export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};



