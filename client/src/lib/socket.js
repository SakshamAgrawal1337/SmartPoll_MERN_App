import { io } from "socket.io-client";
import { SOCKET_URL } from "./api";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const joinPollRoom = (pollId) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("join-poll", pollId);
  return s;
};

export const leaveSocket = () => {
  if (socket?.connected) socket.disconnect();
  socket = null;
};
