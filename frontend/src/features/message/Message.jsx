import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button.jsx";
import { requestForToken, onMessageListener } from "./firebase.js";


const Message = () => {
    const [token, setToken] = useState("");
    const [notification, setNotification] = useState(null);

    const handleGetToken = async () => {
        const t = await requestForToken();
        if (t) setToken(t);
    };

    useEffect(() => {
        onMessageListener().then((payload) => {
            setNotification({
                title: payload.notification.title,
                body: payload.notification.body,
            });
        });
    }, [token]);
    return (
        <div className="m-5 space-y-4">
            <Button
                onClick={handleGetToken}
                variant="outline"
                className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-7 py-5 rounded-xl text-base font-semibold transition-all hover:scale-105"
            >
                Lấy token FCM
            </Button>

            {token && (
                <div className="p-3 bg-gray-50 rounded-md text-sm break-words">
                    <strong>Token:</strong> {token}
                </div>
            )}

            {notification && (
                <div className="p-3 bg-green-100 rounded-md">
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                </div>
            )}
        </div>
    );
};

export default Message;
