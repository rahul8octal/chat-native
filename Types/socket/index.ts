import type { IUser } from "..";

export interface IContact {
  id: string;
  name: string;
  lowerName: string;
  profile_image: string;
  about: string;
}

export type MsgType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "location"
  | "document"
  | "poll"
  | "file"
  | "system";
export type MsgStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface IConversation {
  id?: string;
  pin: boolean;
  type: "user" | "group";
  mute: boolean;
  active: boolean;
  deleted: boolean;
  sender_id?: string;
  receiver_id?: string;
}

export interface IChatConversation extends IConversation {
  receiver_id: string;
  message: string;
  message_type: MsgType;
  sentCount: number;
  username: string;
  user_active: boolean;
  profile_image: string;
  group_name: string;
  group_image: string;
  readStatus: MsgStatus;
  sendedAt: string | Date;
  isTyping: boolean;
  isTypingUsers?: Record<
    string,
    {
      id: string;
      username: string;
      profile_image: string;
    }
  >;
  sender: {
    id: string;
    username: string;
    profile_image: string;
  };
}

export interface IMembers {
  id: string;
  is_admin: boolean;
  is_creator: boolean;
  detail: IUser;
}

export interface IMembersSettings {
  edit_group: boolean;
  send_message: boolean;
  add_member: boolean;
  create_invite_link: boolean;
}

export interface IGroup {
  group_name: string;
  group_image: string;
  group_description: string;
  invite_link: string;
  members_settings: IMembersSettings;
  members: IMembers[];
  is_member: boolean;
  isTypingUsers?: Record<
    string,
    {
      id: string;
      username: string;
      profile_image: string;
    }
  >;
}

export interface IProfile extends IGroup, IUser {
  _id: string;
  type: "user" | "group";
}

export interface IConversationWithProfile {
  profile: IProfile;
  conversations_exist: boolean;
  messages?: IMessage[];
  conversation?: IConversation;
}

export interface IGetConversation {
  module_id: string;
  type?: string;
}

export interface IGetProfile {
  module_id: string;
  type: "user" | "group";
}

export interface IDeleteConversation {
  conversation_id: string;
  type?: "user" | "group";
}

export interface ISendMessage {
  receiver_id: string;
  message: string;
  type: MsgType;
  attachments?: string;
  poll?: {
    question: string;
    options: string[];
  };
  tab_type: "user" | "group";
}

export interface IDeleteMessage {
  messageId: string;
  conversation_id: string;
  type: "user" | "group";
}

export interface IReadStatus {
  _id: string;
  readStatus: MsgStatus;
}

export interface IVotePoll {
  poll_id: string;
  option_id: string;
}

export type Action =
  | "group_created"
  | "user_joined"
  | "user_left"
  | "setting_changed"
  | "group_image_changed"
  | "group_name_changed"
  | "group_description_changed"
  | "members_added"
  | "remove_member";

export interface IPollOptionVote {
  id: string;
  username: string;
  profile_image: string;
  about: string;
  votedAt: string;
}

export interface IPollOption {
  id: string;
  text: string;
  votes: IPollOptionVote[];
}

export interface IPoll {
  id: string;
  question: string;
  options: IPollOption[];
  createdBy: string;
  group_id: string;
  createdAt: string;
}

export interface IMessage {
  id?: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  sender: {
    id: string;
    username: string;
    profile_image: string;
  };
  tab_type: "user" | "group";
  type: MsgType;
  readStatus?: MsgStatus | IReadStatus[];
  username?: string;
  profile_image?: string;
  group_name?: string;
  group_image?: string;
  systemInfo?: {
    action: Action;
    triggeredBy: string;
    meta?: Record<string, any>;
  };
  poll: IPoll;
  createdAt: string | Date;
}

export interface ISeen {
  chat_Ids: string[];
  conversation_id: string;
  receiver_id: string;
  type: "user" | "group";
  isSystemMessage?: boolean;
}

export interface IDelivered {
  chat_Id: string;
  receiver_id: string;
  type: "user" | "group";
}

export interface IAllDelivered {
  profile_id: string;
  user_id: string;
  type: "user" | "group";
}

export interface CreateGroup {
  group_name: string;
  group_description: string;
  group_image: string;
  members: string[];
}

export interface IUpdateGroupProfile {
  groupId: string;
  group_name: string;
  group_description: string;
  group_image: string;
}

export interface AddMembers {
  groupId: string;
  newMembers: string[];
}

export type IUpdateMember = {
  groupId: string;
  memberId: string;
};

export type IRemoveMember = IUpdateMember;
export type IMakeAdmin = IUpdateMember;
export type IDismissAdmin = IUpdateMember;

export interface IHandleGroupPermission {
  groupId: string;
  permission: IMembersSettings;
}

export interface ITyping {
  typing: boolean;
  tab_type: "user" | "group";
  receiver_id: string;
}

export interface IReceiveTyping {
  typing: boolean;
  tab_type: "user" | "group";
  receiver_id: string;
  user: {
    id: string;
    username: string;
    profile_image: string;
  };
}

export interface IUpdateUser {
  username: string;
  profile_image: string;
  about: string;
}

export interface IStatuses {
  user: IStatusUser;
  statuses: IStatus[];
}

export interface IStatus {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  viewed: boolean;
  viewers: IViewerStatus[];
}

export interface IViewerStatus {
  id: string;
  user_id: string;
  username: string;
  profile_image: string;
  viewedAt: string;
}

export interface IUpdateStatusViewer {
  status_id: string;
  viewer: IViewerStatus;
}

export interface IStatusUser {
  id: string;
  username: string;
  profile_image: string;
}

// Voice and video call types
export interface ICallSignalSend {
  toUserId: string;
  callId: string;
  data:
    | {
        candidate: RTCIceCandidate;
      }
    | RTCSessionDescription
    | null;
}

export interface ICallCallInitSend {
  toUserId: string;
  callId: string;
  metadata: { type: "audio" | "video" };
}

export interface ICallAcceptSend {
  toUserId: string;
  callId: string;
}

export interface ICallRejectSend {
  toUserId: string;
  callId: string;
  reason?: string;
}

export interface ICallHangupSend {
  toUserId: string;
  callId: string;
}

export interface ICallIncomingReceive {
  fromUserId: string;
  callId: string;
  metadata?: { type: "audio" | "video" };
  caller: IUser;
}

export interface ICallAcceptReceive {
  fromUserId: string;
  callId: string;
}

export interface ICallSignalReceive {
  fromUserId: string;
  callId: string;
  data: {
    candidate: RTCIceCandidate;
    type: "offer" | "answer" | "pranswer" | "rollback";
  },
  caller: IUser
}
export interface ICallRejectReceive {
  callId: string;
  reason: string;
}
export interface ICallHangupReceive {
  fromUserId: string;
  callId: string;
}

