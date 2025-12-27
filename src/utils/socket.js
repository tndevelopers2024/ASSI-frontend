import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

// We'll initialize it lazily or when needed
let socket;

export const getSocket = (userId = null) => {
    if (!socket) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const id = userId || storedUser._id;

        socket = io(URL, {
            query: id ? { userId: id } : {},
            transports: ["websocket"],
        });

        console.log("Global Socket Initialized", id ? "with userId" : "without userId");
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
