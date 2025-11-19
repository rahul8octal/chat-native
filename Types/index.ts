export interface IUserVisibility {
  profile_image: "EVERYONE" | "SELECTED" | "NOBODY";
  last_seen: "EVERYONE" | "SELECTED" | "NOBODY";
  online: "EVERYONE" | "SELECTED" | "NOBODY";
  group: "EVERYONE" | "SELECTED" | "NOBODY";
  about: "EVERYONE" | "SELECTED" | "NOBODY";
  links: "EVERYONE" | "SELECTED" | "NOBODY";
  status: "EVERYONE" | "SELECTED" | "NOBODY";
}

export interface IUser {
  id?: string;
  email?: string;
  active: boolean;
  socket?: string;
  username?: string;
  about: string;
  location?: string;
  contact_no?: string;
  createdAt?: string;
  updatedAt?: string;
  profile_image?: string;
  isTyping?: boolean;
  visibility?: IUserVisibility;
}

export interface UserList {
  name: string;
}
