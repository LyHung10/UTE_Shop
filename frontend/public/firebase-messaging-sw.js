/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBn80meaZtFd_JIfIiRcg5XDllrcH3d9T0",
    authDomain: "ute-shop-43bcc.firebaseapp.com",
    projectId: "ute-shop-43bcc",
    messagingSenderId: "757914286248",
    appId: "1:757914286248:web:ba84b330f872cb68b0ea9d",
});

const messaging = firebase.messaging();

// 🔔 BẮT BUỘC: chỉ show notification
messaging.onBackgroundMessage((payload) => {
    console.log("🔥 [SW] Background message:", payload);

    self.registration.showNotification(
        payload.notification?.title || "TEST NOTIFICATION",
        {
            body: payload.notification?.body || "Nếu thấy cái này là OK",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            requireInteraction: true, // 🔥 CỰC KỲ QUAN TRỌNG
            silent: false,
        }
    );
});
