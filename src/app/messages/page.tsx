import { Suspense } from "react";
import MessagesContent from "@/components/MessagesContent";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Memuat pesan...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
