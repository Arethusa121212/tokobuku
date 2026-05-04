import Pusher from "pusher";

const pusherConfig = {
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
};

// Handle potential import issues in different environments
export const pusherServer = (Pusher as any).default 
  ? new (Pusher as any).default(pusherConfig)
  : new Pusher(pusherConfig);

