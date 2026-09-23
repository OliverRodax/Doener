'use client';

import { useEffect, useState } from 'react';
import { RESTAURANTS } from '../../lib/restaurants';

const STORAGE_KEY = 'doener_admin_pw';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState([]);
  const [day, setDay] = useState('');

  async function verify(pw) {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    return res.ok;
  }

  async function load() {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data.orders);
      setDay(data.day);
    } catch {
      // transient network hiccup during polling — next tick will retry
    }
  }

  useEffect(() => {
    (async () => {
      let saved = '';
      try {
        saved = sessionStorage.getItem(STORAGE_KEY) || '';
      } catch {
        // sessionStorage unavailable — fall back to manual login
      }
      if (saved && (await verify(saved))) {
        setPassword(saved);
        setAuthed(true);
        await load();
      }
      setChecking(false);
    })();
  }, []);

  useEffect(() => {
    if (!authed) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    const ok = await verify(password);
    if (!ok) {
      setLoginError('Falsches Passwort.');
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, password);
    } catch {
      // sessionStorage unavailable — session just won't persist across reloads
    }
    setAuthed(true);
    await load();
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAuthed(false);
    setPassword('');
    setOrders([]);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.status === 403) {
      handleLogout();
      setLoginError('Passwort abgelaufen, bitte erneut eingeben.');
      return;
    }
    await load();
  }

  if (checking) {
    return null;
  }

  if (!authed) {
    return (
      <main className="page">
        <header className="header">
          <h1>🔐 Admin</h1>
          <p className="date">Döner-Bestellung verwalten</p>
        </header>
        <form className="form" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="admin-password">Passwort</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          {loginError && <p className="error">{loginError}</p>}
          <button className="submit-btn" type="submit">
            Anmelden
          </button>
        </form>
      </main>
    );
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
        <h1>🔐 Admin</h1>
        <p className="date">{dateLabel}</p>
      </header>

      <section className="list">
        {orders.length === 0 ? (
          <p className="empty">Noch niemand hat heute bestellt.</p>
        ) : (
          <ul>
            {orders.map((o) => (
              <li key={o.id} className="order-row">
                <div className="order-info">
                  <div className="order-name-row">
                    <span className="order-name">{o.name}</span>
                    <span
                      className="order-restaurant"
                      style={{ '--badge-color': RESTAURANTS.find((r) => r.name === o.restaurant)?.color }}
                    >
                      {o.restaurant}
                    </span>
                  </div>
                  <span className="order-text">{o.order}</span>
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(o.id)}
                  aria-label={`Bestellung von ${o.name} löschen`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="count">
          {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'}
        </p>
      </section>

      <button type="button" className="logout-btn" onClick={handleLogout}>
        Abmelden
      </button>

      <p className="footer-link">
        <a href="/">Bestellliste</a> · <a href="/impressum">Impressum</a>
      </p>
    </main>
  );
}
