import Pusher from "pusher";

const pusherConfig = {
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
  useTLS: true,
};

const createPusherServer = () => {
  if (!pusherConfig.appId || !pusherConfig.key || !pusherConfig.secret) {
    console.warn("Pusher server keys are missing.");
    return null;
  }
  
  try {
    const P = (Pusher as any).default || Pusher;
    return new P(pusherConfig);
  } catch (err) {
    console.error("Failed to initialize Pusher Server:", err);
    return null;
  }
};

export const pusherServer = createPusherServer();


