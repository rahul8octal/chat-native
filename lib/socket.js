import AsyncStorage from "@react-native-async-storage/async-storage";
import { Socket_URL } from "@/config";
import { io } from "socket.io-client";

const socket = io(Socket_URL, {
	withCredentials: true,
	transports: ["websocket"],
	auth: async (cb) => {
		const token = await AsyncStorage.getItem("token");
		cb({ token });
	},
});

function reauthenticateSocket() {
	socket.disconnect();
	socket.connect();
}

async function connectSocketWithToken() {
	const token = await AsyncStorage.getItem("token");
	socket.auth = token ? { token } : {};

	if (socket.connected) return;

	await new Promise((resolve, reject) => {
		socket.once("connect", resolve);
		socket.once("connect_error", reject);
		socket.connect();
	});
}

async function disconnectSocket() {
	if (socket.connected) {
		socket.disconnect();
	}
	socket.auth = {};
}

export default socket;
export { reauthenticateSocket, connectSocketWithToken, disconnectSocket };
