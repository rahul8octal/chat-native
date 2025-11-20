import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "chat-app",
  slug: "chat-app",
  scheme: "chatapp",
  extra: {
    ...config.extra,
    apiUrl: process.env.API_URL,
    socketUrl: process.env.Socket_URL,
    eas: {
      projectId: "8eb286b9-c156-4f13-a92f-fe979ce5315d"
    }
  },
  android: {
    ...config.android,
    package: "com.rahuloctal.chatapp"
  }
});
