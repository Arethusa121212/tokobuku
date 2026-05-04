"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ReviewSectionProps {
  bookId: string;
}

export default function ReviewSection({ bookId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Silakan login untuk memberikan review");
      return;
    }
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
        toast.success("Review berhasil ditambahkan! ⭐");
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal menambahkan review");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div style={{ display: 'flex', gap: '0.2rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? '1.8rem' : '1rem',
              color: star <= (interactive ? (hoverRating || rating) : value) ? '#f59e0b' : '#d1d5db',
              transition: 'color 0.15s, transform 0.15s',
              transform: interactive && star <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ⭐ Ulasan & Rating
      </h2>

      {/* Summary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem',
        background: 'var(--color-bg)', borderRadius: '16px', marginBottom: '2rem',
        border: '1.5px solid var(--color-border)'
      }}>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {avgRating.toFixed(1)}
          </div>
          {renderStars(Math.round(avgRating))}
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>
            {totalReviews} ulasan
          </div>
        </div>
      </div>

      {/* Review Form */}
      {session && (
        <form onSubmit={handleSubmit} style={{
          padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '16px',
          marginBottom: '2rem', border: '1.5px solid var(--color-border)'
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Tulis Ulasan</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Rating</label>
            {renderStars(rating, true)}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Komentar (Opsional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              rows={3}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '10px',
                border: '1.5px solid var(--color-border)', fontSize: '0.95rem',
                resize: 'vertical', fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="btn-primary"
            style={{ padding: '0.7rem 1.5rem', opacity: loading || rating === 0 ? 0.6 : 1 }}
          >
            {loading ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </form>
      )}

      {/* Review List */}
      {fetching ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Memuat ulasan...</p>
      ) : reviews.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem', background: 'var(--color-bg)',
          borderRadius: '12px', color: 'var(--color-text-secondary)'
        }}>
          Belum ada ulasan untuk buku ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{
              padding: '1.2rem', background: 'var(--color-surface)', borderRadius: '12px',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}`}
                  alt={review.user.name || "User"}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.user.name || "Pengguna"}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {renderStars(review.rating)}
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(review.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
