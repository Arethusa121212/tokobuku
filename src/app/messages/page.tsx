"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import toast from "react-hot-toast";
import Link from "next/link";

interface Conversation {
  id: string;
  user1: any;
  user2: any;
  messages: any[];
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, [session?.user?.id]);

  const fetchRooms = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/chat/rooms");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
        setUnreadCounts(data.unreadCounts);
      }
    } catch (err) {
      toast.error("Gagal memuat pesan");
    }
  };

  const selectRoom = async (room: any) => {
    setActiveRoom(room.id);
    try {
      const res = await fetch(`/api/chat/messages/${room.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Reset unread count locally
        setUnreadCounts(prev => prev.map(c => c.conversationId === room.id ? { ...c, count: 0 } : c));
      }
    } catch (err) {
      toast.error("Gagal memuat detail pesan");
    }
  };

  // Subscribe to all rooms and notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = pusherClient?.subscribe(`user-${session.user.id}`);
    channel?.bind("new-notification", (data: any) => {
      fetchRooms(); // Refresh list to show latest message and unread count
      if (data.conversationId === activeRoom) {
        // If we are currently in that room, messages will be handled by the room subscription
      }
    });

    return () => {
      pusherClient?.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id, activeRoom]);

  // Subscribe to active room
  useEffect(() => {
    if (!activeRoom || !pusherClient) return;

    const channel = pusherClient.subscribe(activeRoom);
    channel.bind("new-message", (newMessage: any) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      pusherClient.unsubscribe(activeRoom);
    };
  }, [activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const room = conversations.find(c => c.id === activeRoom);
    const receiverId = room.user1Id === session?.user?.id ? room.user2Id : room.user1Id;

    const text = inputText;
    setInputText("");

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, receiverId }),
      });
    } catch (err) {
      toast.error("Gagal mengirim pesan");
    }
  };

  if (!session) return <div style={{ textAlign: 'center', padding: '4rem' }}>Silakan login untuk melihat pesan.</div>;

  return (
    <div style={{ height: 'calc(100vh - 150px)', display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
      {/* Sidebar: Conversations List */}
      <div style={{
        width: '350px', background: 'white', borderRadius: '24px',
        border: '1px solid var(--color-border)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pusat Pesan</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada pesan masuk.</div>
          ) : (
            conversations.map((room) => {
              const otherUser = room.user1Id === session.user.id ? room.user2 : room.user1;
              const unread = unreadCounts.find(c => c.conversationId === room.id)?.count || 0;
              const lastMsg = room.messages[0]?.text || "Mulai chat...";
              
              return (
                <div 
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  style={{
                    padding: '1.2rem', cursor: 'pointer',
                    background: activeRoom === room.id ? 'var(--color-bg)' : 'white',
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'center'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${otherUser.name}`} 
                      style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9' }} 
                    />
                    {otherUser.isOnline && (
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px',
                        borderRadius: '50%', background: '#22c55e', border: '2px solid white'
                      }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{otherUser.name}</span>
                      {unread > 0 && (
                        <span style={{
                          background: '#EF144A', color: 'white', fontSize: '0.65rem',
                          fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '10px'
                        }}>{unread}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '180px' }}>
                      {lastMsg}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div style={{
        flex: 1, background: 'white', borderRadius: '24px',
        border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {!activeRoom ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</span>
            <p>Pilih percakapan untuk membalas pesan.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <img 
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${conversations.find(c => c.id === activeRoom)?.user1Id === session.user.id ? conversations.find(c => c.id === activeRoom)?.user2.name : conversations.find(c => c.id === activeRoom)?.user1.name}`} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9' }} 
              />
              <div style={{ fontWeight: 800 }}>
                {conversations.find(c => c.id === activeRoom)?.user1Id === session.user.id ? conversations.find(c => c.id === activeRoom)?.user2.name : conversations.find(c => c.id === activeRoom)?.user1.name}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg) => {
                const isMe = msg.senderId === session.user.id;
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    {msg.book && (
                      <div style={{
                        background: 'white', padding: '0.8rem', borderRadius: '12px',
                        border: '1px solid var(--color-border)', marginBottom: '0.5rem',
                        display: 'flex', gap: '0.8rem', alignItems: 'center'
                      }}>
                        <img src={msg.book.imageUrl} style={{ width: '40px', height: '55px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700 }}>Produk Terkait:</div>
                          <div style={{ color: 'var(--color-text-secondary)' }}>{msg.book.title}</div>
                        </div>
                      </div>
                    )}
                    <div style={{
                      padding: '0.8rem 1.2rem', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isMe ? 'var(--color-primary)' : 'white',
                      color: isMe ? 'white' : 'var(--color-text-primary)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: '0.95rem'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis balasan..." 
                style={{
                  flex: 1, padding: '1rem', borderRadius: '16px',
                  border: '1.5px solid var(--color-border)', outline: 'none'
                }}
              />
              <button className="btn-primary" style={{ padding: '0 2rem', borderRadius: '16px' }}>Kirim</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
