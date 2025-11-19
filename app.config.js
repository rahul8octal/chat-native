import 'dotenv/config';

export default {
  expo: {
    name: "chat-app",
    slug: "chat-app",
    scheme: "chatapp",
    extra: {
      apiUrl: process.env.API_URL,
      socketUrl: process.env.Socket_URL,
    },
  },
};
