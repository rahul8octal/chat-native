import 'dotenv/config';

export default {
  expo: {
    name: "chat-app",
    slug: "chat-app",
    extra: {
      apiUrl: process.env.API_URL,
    },
  },
};
