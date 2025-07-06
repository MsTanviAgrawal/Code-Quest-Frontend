// utils/notification.js
// export const showNotification = (title, body) => {
//   if (Notification.permission === "granted") {
//     new Notification(title, {
//       body,
//       icon: "/favicon.ico", // Or any icon you want
//     });
//   }
// };

// export const requestNotificationPermission = () => {
//   if ("Notification" in window && Notification.permission !== "granted") {
//     Notification.requestPermission();
//   }
// };


export const showNotification = (title, body) => {
  const isEnabled = localStorage.getItem("notificationsEnabled") === "true";

  if (!isEnabled) return;

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      }
    });
  }
};

export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};

