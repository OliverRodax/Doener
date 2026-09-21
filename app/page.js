'use client';

import { useEffect, useRef, useState } from 'react';

function getOrCreateToken() {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('doener_token');
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('doener_token', token);
  }
  return token;
}

export default function Page() {
  const [orders, setOrders] = useState([]);
  const [day, setDay] = useState('');
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tokenRef = useRef('');

  async function load() {
    try {
      const res = await fetch(`/api/orders?token=${encodeURIComponent(tokenRef.current)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setOrders(data.orders);
      setDay(data.day);
    } catch {
      // transient network hiccup during polling — next tick will retry
    }
  }

  useEffect(() => {
    tokenRef.current = getOrCreateToken();
    const savedName = localStorage.getItem('doener_name');
    if (savedName) setName(savedName);

    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !order.trim()) {
      setError('Bitte Namen und Bestellung eingeben.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, order, token: tokenRef.current }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fehler beim Speichern.');
      }
      localStorage.setItem('doener_name', name);
      setOrder('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`/api/orders/${id}?token=${encodeURIComponent(tokenRef.current)}`, {
        method: 'DELETE',
      });
      await load();
    } catch {
      // ignore — list refresh will self-correct on next poll
    }
  }

  const dateLabel = day
    ? new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Berlin',
      }).format(new Date(`${day}T12:00:00`))
    : '';

  return (
    <main className="page">
      <header className="header">
        <h1>🥙 Döner-Bestellung</h1>
        <p className="date">{dateLabel}</p>
      </header>

      <section className="list">
        {orders.length === 0 ? (
          <p className="empty">Noch niemand hat heute bestellt. Sei die erste Person!</p>
        ) : (
          <ul>
            {orders.map((o) => (
              <li key={o.id} className="order-row">
                <div className="order-info">
                  <span className="order-name">{o.name}</span>
                  <span className="order-text">{o.order}</span>
                </div>
                {o.mine && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(o.id)}
                    aria-label={`Bestellung von ${o.name} löschen`}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="count">
          {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'}
        </p>
      </section>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="z. B. Alex"
            onFocus={(e) => e.target.select()}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="order">Bestellung</label>
          <input
            id="order"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            maxLength={200}
            placeholder="z. B. Dürüm, scharf, ohne Zwiebeln"
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Speichern…' : 'Bestellung eintragen'}
        </button>
      </form>
    </main>
  );
}
