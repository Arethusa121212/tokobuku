import PusherClient from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

const createPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  // Handle potential .default issues in pusher-js
  const P = (PusherClient as any).default || PusherClient;
  return new P(pusherKey, { cluster: pusherCluster });
};

export const pusherClient = createPusherClient();


