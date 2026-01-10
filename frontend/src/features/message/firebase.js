import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBn80meaZtFd_JIfIiRcg5XDllrcH3d9T0",
    authDomain: "ute-shop-43bcc.firebaseapp.com",
    projectId: "ute-shop-43bcc",
    storageBucket: "ute-shop-43bcc.firebasestorage.app",
    messagingSenderId: "757914286248",
    appId: "1:757914286248:web:ba84b330f872cb68b0ea9d",
    measurementId: "G-1XC3WKVE2J",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔥 LẤY FCM TOKEN (ĐÃ FIX LỖI no active Service Worker)
export const requestForToken = async () => {
    try {
        // 1️⃣ Đăng ký Service Worker
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );

        // 2️⃣ BẮT BUỘC chờ SW sẵn sàng
        await navigator.serviceWorker.ready;

        console.log("✅ Service Worker READY");

        // 3️⃣ Xin permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("⚠️ Người dùng chưa cấp quyền thông báo");
            return null;
        }

        // 4️⃣ Lấy token
        const token = await getToken(messaging, {
            vapidKey:
                "BMpzXM10v4QA7x-X90IrCnWSq2PkLuCkz_PHdI4xn1RtRifk2m0Bpwk1CqHFoSNj5ce8Ka4z5tdLum2fnCgdIwc",
            serviceWorkerRegistration: registration,
        });

        if (token) {
            console.log("🔥 FCM TOKEN:", token);
            return token;
        }

        return null;
    } catch (error) {
        console.error("❌ Lỗi khi lấy FCM token:", error);
        return null;
    }
};

export const initFCM = async () => {
    if (!("Notification" in window)) return null;

    if (Notification.permission === "denied") {
        console.warn("❌ Notification bị chặn");
        return null;
    }

    // Xin permission nếu chưa có
    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return null;
    }

    return await requestForToken();
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("📩 Foreground message:", payload);
            resolve(payload);
        });
    });
