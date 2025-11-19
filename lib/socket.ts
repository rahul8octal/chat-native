import AsyncStorage from "@react-native-async-storage/async-storage";
import { Socket_URL } from "@/config";
import type {
	AddMembers,
	CreateGroup,
	IAllDelivered,
	IChatConversation,
	IContact,
	IConversationWithProfile,
	IDeleteConversation,
	IDeleteMessage,
	IDelivered,
	IDismissAdmin,
	IGetConversation,
	IGetProfile,
	IHandleGroupPermission,
	IMakeAdmin,
	IMessage,
	IPoll,
	IProfile,
	IReceiveTyping,
	IRemoveMember,
	ISeen,
	ISendMessage,
	IStatuses,
	ITyping,
	IUpdateGroupProfile,
	IUpdateStatusViewer,
	IUpdateUser,
	ICallAcceptReceive,
	ICallAcceptSend,
	ICallIncomingReceive,
	ICallCallInitSend,
	ICallHangupReceive,
	ICallHangupSend,
	ICallRejectReceive,
	ICallRejectSend,
	ICallSignalReceive,
	ICallSignalSend,
	IVotePoll,
} from "@/Types/socket";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
	contacts: (data: IContact[]) => void;
	seen: (data: IMessage[]) => void;
	delivered: (data: IMessage) => void;
	"all-delivered": (data: IAllDelivered) => void;
	typing: (data: IReceiveTyping) => void;
	"new-message": (data: IMessage) => void;
	"poll-updated": (data: IPoll) => void;
	"delete-messaged": (data: IDeleteMessage) => void;
	"user-conversation": (data: IConversationWithProfile) => void;
	"new-conversation": (data: IChatConversation) => void;
	conversations: (data: IChatConversation[]) => void;
	statuses: (data: IStatuses[]) => void;
	"status-viewed": (data: IUpdateStatusViewer) => void;
	"update-conversation-count": (data: {
		count: number;
		conversation_id: string;
	}) => void;
	"update-group": (data: IProfile) => void;
	"conversation-deleted": (data: IDeleteConversation) => void;
	profile: (data: IProfile) => void;

	//voice and video call
	"call:incoming": (data: ICallIncomingReceive) => void;
	"call:accepted": (data: ICallAcceptReceive) => void;
	"call:signal": (data: ICallSignalReceive) => void;
	"call:rejected": (data: ICallRejectReceive) => void;
	"call:hangup": (data: ICallHangupReceive) => void;
}

interface ClientToServerEvents {
	seen: (data: ISeen) => void;
	delivered: (data: IDelivered) => void;
	"update-user": (data: IUpdateUser) => void;
	"get-contacts": () => void;
	"get-conversations": () => void;
	"get-statuses": () => void;
	"send-status": (data: { contents: any }) => void;
	"view-status": (data: { status_id: string }) => void;
	"update-group": (data: { groupId: string }) => void;
	"join-group-via-link": (data: { groupId: string }) => void;
	"exit-group": (data: { groupId: string }) => void;
	"create-group": (data: CreateGroup) => void;
	"update-group-profile": (data: IUpdateGroupProfile) => void;
	"add-members": (data: AddMembers) => void;
	"remove-member": (data: IRemoveMember) => void;
	"make-admin": (data: IMakeAdmin) => void;
	"dismiss-admin": (data: IDismissAdmin) => void;
	"handle-group-permission": (data: IHandleGroupPermission) => void;
	typing: (data: ITyping) => void;
	"send-message": (data: ISendMessage) => void;
	"vote-poll": (data: IVotePoll) => void;
	"delete-message": (data: IDeleteMessage) => void;
	"get-conversation": (data: IGetConversation) => void;
	"delete-conversation": (data: IDeleteConversation) => void;
	"get-profile": (data: IGetProfile) => void;

	//voice and video call
	"call:signal": (data: ICallSignalSend) => void;
	"call:call-init": (data: ICallCallInitSend) => void;
	"call:accept": (data: ICallAcceptSend) => void;
	"call:reject": (data: ICallRejectSend) => void;
	"call:hangup": (data: ICallHangupSend) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	Socket_URL,
	{
		withCredentials: true,
		transports: ["websocket"],
		auth: async (cb) => {
			const token = await AsyncStorage.getItem("token");
			cb({ token });
		},
	}
);

function reauthenticateSocket() {
	socket.disconnect();
	socket.connect();
}

async function connectSocketWithToken() {
	const token = await AsyncStorage.getItem("token");
	socket.auth = token ? { token } : {};

	if (socket.connected) return;

	await new Promise<void>((resolve, reject) => {
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
export type { ServerToClientEvents, ClientToServerEvents };
export { reauthenticateSocket, connectSocketWithToken, disconnectSocket };
