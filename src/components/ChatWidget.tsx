"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import toast from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  senderId: string;
  sender: { name: string; image: string };
  bookId?: string;
  book?: { title: string; imageUrl: string; price: number };
  createdAt: string;
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeBook, setActiveBook] = useState<{ id: string; title: string; imageUrl: string; price: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for global "openChat" event
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      const { sellerId, sellerName, book } = e.detail;
      setReceiver({ id: sellerId, name: sellerName });
      setActiveBook(book || null);
      setIsOpen(true);
      fetchMessages(sellerId);
    };

    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  // Fetch or init messages with a user
  const fetchMessages = async (targetId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/init?targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveRoom(data.roomId);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to init chat");
    }
  };

  // Subscribe to room
  useEffect(() => {
    if (!activeRoom || !pusherClient) return;

    const channel = pusherClient.subscribe(activeRoom);
    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      pusherClient.unsubscribe(activeRoom);
    };
  }, [activeRoom]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !receiver) return;

    const textToSend = inputText;
    setInputText("");

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: textToSend, 
          receiverId: receiver.id,
          bookId: activeBook?.id
        }),
      });
      // Message will come back via Pusher
      setActiveBook(null); // Clear context after first message in chat session
    } catch (err) {
      toast.error("Gagal mengirim pesan");
    }
  };

  if (!session || session.user.role === "SELLER") return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, fontFamily: 'var(--font-outfit)' }}>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '30px',
            background: 'var(--color-primary)', color: 'white',
            border: 'none', boxShadow: '0 8px 24px rgba(0,170,91,0.3)',
            cursor: 'pointer', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '380px', height: '550px', background: 'white',
          borderRadius: '24px', boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.2rem', background: 'var(--color-primary)', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'white', overflow: 'hidden' }}>
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${receiver?.name}`} alt="" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{receiver?.name || 'Chat'}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Online</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '4rem', fontSize: '0.85rem' }}>
                Belum ada pesan. Mulai percakapan sekarang!
              </div>
            )}
            
            {messages.map((msg, i) => {
              const isMe = msg.senderId === session.user.id;
              return (
                <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  {/* Book Context in Message */}
                  {msg.book && (
                    <div style={{
                      background: 'white', padding: '0.6rem', borderRadius: '12px',
                      border: '1px solid var(--color-border)', marginBottom: '0.4rem',
                      display: 'flex', gap: '0.6rem', alignItems: 'center'
                    }}>
                      <img src={msg.book.imageUrl || ''} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 700 }}>Tanya Stok:</div>
                        <div style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '150px' }}>{msg.book.title}</div>
                      </div>
                    </div>
                  )}
                  <div style={{
                    padding: '0.8rem 1rem', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isMe ? 'var(--color-primary)' : 'white',
                    color: isMe ? 'white' : 'var(--color-text-primary)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: '0.9rem', lineHeight: 1.4
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.3rem', textAlign: isMe ? 'right' : 'left' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {/* Product Context Bar (Before sending) */}
          {activeBook && (
            <div style={{
              padding: '0.8rem', background: '#fffbeb', borderTop: '1px solid #fde68a',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <img src={activeBook.imageUrl} style={{ width: '30px', height: '40px', borderRadius: '4px' }} />
                <div style={{ fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700 }}>Menanyakan buku ini...</div>
                  <div style={{ color: '#92400e' }}>{activeBook.title}</div>
                </div>
              </div>
              <button onClick={() => setActiveBook(null)} style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer' }}>×</button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.6rem' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan..." 
              style={{
                flex: 1, padding: '0.8rem', borderRadius: '12px',
                border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit" 
              style={{
                width: '45px', height: '45px', borderRadius: '12px',
                background: 'var(--color-primary)', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: '1.2rem'
              }}
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
