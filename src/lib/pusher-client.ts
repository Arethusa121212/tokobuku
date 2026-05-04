import PusherClient from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;

const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

const createPusherClient = () => {
  if (typeof window === 'undefined') return null;
  if (!pusherKey || !pusherCluster) {
    console.warn("Pusher keys are missing. Chat feature will be disabled.");
    return null;
  }
  
  try {
    // Handle potential .default issues in pusher-js
    const P = (PusherClient as any).default || PusherClient;
    return new P(pusherKey, { cluster: pusherCluster });
  } catch (err) {
    console.error("Failed to initialize Pusher:", err);
    return null;
  }
};

export const pusherClient = createPusherClient();


