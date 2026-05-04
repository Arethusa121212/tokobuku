"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ReviewModalProps {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ bookId, bookTitle, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pilih rating terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, rating, comment }),
      });

      if (res.ok) {
        toast.success("Terima kasih atas ulasannya! ⭐");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal mengirim ulasan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (interactive = true) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1rem 0' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: 'pointer',
              fontSize: '2.5rem',
              color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
              transition: 'color 0.15s, transform 0.1s',
              transform: star <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', padding: '2.5rem', borderRadius: '24px',
        width: '100%', maxWidth: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Beri Rating Buku</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Bagaimana pengalaman Anda membaca <strong>{bookTitle}</strong>?</p>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStars()}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Ulasan Anda (Opsional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis ulasan Anda di sini..."
              rows={4}
              style={{
                width: '100%', padding: '1rem', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '1rem',
                resize: 'none', fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading || rating === 0}
              className="btn-primary"
              style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: loading || rating === 0 ? 0.7 : 1 }}
            >
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
