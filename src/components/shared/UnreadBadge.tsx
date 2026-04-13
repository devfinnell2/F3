'use client';

import { useEffect, useState } from 'react';

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res  = await fetch('/api/messages/conversations');
        const data = await res.json();
        const total = (data.conversations ?? []).reduce(
          (s: number, c: { unread: number }) => s + c.unread, 0
        );
        setCount(total);
      } catch { /* ignore */ }
    };

    fetch_();
    const id = setInterval(fetch_, 5000);
    return () => clearInterval(id);
  }, []);

  if (count === 0) return null;

  return (
    <span
      className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded"
      style={{ background: '#f472b6', color: '#fff' }}
    >
      {count}
    </span>
  );
}