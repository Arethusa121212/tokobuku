"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface StoreInteractionProps {
  storeId: string;
  storeName: string | null;
}

export default function StoreInteraction({ storeId, storeName }: StoreInteractionProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleChat = () => {
    if (!session) {
      toast.error("Silakan login untuk memulai chat");
      router.push("/login");
      return;
    }
    
    // Redirect to messages with params to initiate chat
    router.push(`/messages?userId=${storeId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <button 
        onClick={handleChat}
        className="btn-primary" 
        style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      >
        💬 Chat Penjual
      </button>
    </div>
  );
}
