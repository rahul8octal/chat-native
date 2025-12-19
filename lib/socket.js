import AsyncStorage from "@react-native-async-storage/async-storage";
import { Socket_URL } from "@/config";
import { io } from "socket.io-client";
import { Platform } from "react-native";

const isBrowser = typeof window !== "undefined";

const socket = io(Socket_URL, {
	withCredentials: true,
	transports: ["websocket"],
	autoConnect: isBrowser,
	auth: async (cb) => {
		if (Platform.OS === "web" && !isBrowser) {
			cb({});
			return;
		}
		const token = await AsyncStorage.getItem("token");
		cb({ token });
	},
});

function reauthenticateSocket() {
	if (Platform.OS === "web" && !isBrowser) return;
	socket.disconnect();
	socket.connect();
}

async function connectSocketWithToken() {
	if (Platform.OS === "web" && !isBrowser) return;
	
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
	if (Platform.OS === "web" && !isBrowser) return;
	if (socket.connected) {
		socket.disconnect();
	}
	socket.auth = {};
}

export default socket;
export { reauthenticateSocket, connectSocketWithToken, disconnectSocket };
