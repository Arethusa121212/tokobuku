"use client";

import { useState } from "react";
import ReviewModal from "./ReviewModal";

interface OrderRatingButtonProps {
  bookId: string;
  bookTitle: string;
}

export default function OrderRatingButton({ bookId, bookTitle }: OrderRatingButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  if (hasReviewed) {
    return (
      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>⭐ Sudah diulas</span>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        style={{ 
          padding: '0.3rem 0.7rem', borderRadius: '8px', 
          background: 'white', color: '#f59e0b', 
          border: '1.5px solid #f59e0b', fontSize: '0.75rem', 
          fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#fef3c7')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
      >
        ⭐ Beri Rating
      </button>

      {showModal && (
        <ReviewModal 
          bookId={bookId} 
          bookTitle={bookTitle} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => setHasReviewed(true)}
        />
      )}
    </>
  );
}
