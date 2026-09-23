'use client';

import { useEffect, useState } from 'react';
import { ORDER_DEADLINES } from '../lib/deadlines';
import { RESTAURANTS } from '../lib/restaurants';

function berlinWeekdayAbbr(date) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: 'Europe/Berlin' })
    .format(date)
    .replace(/\.$/, '');
}

function berlinTimeHHMM(date) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin',
  }).format(date);
}

export default function Page() {
  const [orders, setOrders] = useState([]);
  const [day, setDay] = useState('');
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(null);
  const [filter, setFilter] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data.orders);
      setDay(data.day);
    } catch {
      // transient network hiccup during polling — next tick will retry
    }
    setNow(new Date());
  }

  useEffect(() => {
    const savedName = localStorage.getItem('doener_name');
    if (savedName) setName(savedName);
    const savedRestaurant = localStorage.getItem('doener_restaurant');
    if (savedRestaurant && RESTAURANTS.some((r) => r.name === savedRestaurant)) {
      setRestaurant(savedRestaurant);
    }

    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !order.trim() || !restaurant) {
      setError('Bitte Namen, Lokal und Bestellung eingeben.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, order, restaurant }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fehler beim Speichern.');
      }
      localStorage.setItem('doener_name', name);
      localStorage.setItem('doener_restaurant', restaurant);
      setOrder('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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

  const todayAbbr = now ? berlinWeekdayAbbr(now) : '';
  const todayDeadline = ORDER_DEADLINES.find((d) => d.abbr === todayAbbr);
  const pastDeadline = now && todayDeadline ? berlinTimeHHMM(now) >= todayDeadline.time : false;

  const restaurantCounts = RESTAURANTS.map((r) => ({
    ...r,
    count: orders.filter((o) => o.restaurant === r.name).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...restaurantCounts.map((r) => r.count));

  const visibleOrders = filter ? orders.filter((o) => o.restaurant === filter) : orders;

  return (
    <main className="page">
      <header className="header">
        <h1>🥙 Döner-Bestellung</h1>
        <p className="date">{dateLabel}</p>
      </header>

      <section className="deadlines">
        <ul className="deadline-list">
          {ORDER_DEADLINES.map((d) => (
            <li key={d.abbr} className={`deadline-chip${d.abbr === todayAbbr ? ' today' : ''}`}>
              <span className="deadline-day">{d.abbr}</span>
              <span className="deadline-time">{d.time}</span>
            </li>
          ))}
        </ul>
        {todayDeadline && (
          <p className={`deadline-note${pastDeadline ? ' past' : ''}`}>
            {pastDeadline
              ? `Bestellschluss für heute (${todayDeadline.time} Uhr) ist vorbei.`
              : `Heute noch bis ${todayDeadline.time} Uhr bestellen.`}
          </p>
        )}
      </section>

      {orders.length > 0 && (
        <section className="chart" aria-label="Bestellungen pro Lokal heute">
          <h2 className="chart-title">Wer bestellt wo?</h2>
          <ul className="chart-bars">
            {restaurantCounts.map((r) => (
              <li key={r.name} className="chart-row">
                <span className="chart-label">{r.name}</span>
                <div className="chart-track">
                  <div
                    className="chart-fill"
                    style={{ width: `${(r.count / maxCount) * 100}%`, background: r.color }}
                  />
                </div>
                <span className="chart-count">{r.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {orders.length > 0 && (
        <ul className="filter-list">
          <li>
            <button
              type="button"
              className={`filter-chip${filter === '' ? ' active' : ''}`}
              onClick={() => setFilter('')}
            >
              Alle
            </button>
          </li>
          {RESTAURANTS.map((r) => (
            <li key={r.name}>
              <button
                type="button"
                className={`filter-chip${filter === r.name ? ' active' : ''}`}
                style={filter === r.name ? { background: r.color, borderColor: r.color } : undefined}
                onClick={() => setFilter(filter === r.name ? '' : r.name)}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <section className="list">
        {visibleOrders.length === 0 ? (
          <p className="empty">
            {orders.length === 0
              ? 'Noch niemand hat heute bestellt. Sei die erste Person!'
              : 'Niemand hat heute bei diesem Lokal bestellt.'}
          </p>
        ) : (
          <ul>
            {visibleOrders.map((o) => (
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
              </li>
            ))}
          </ul>
        )}
        <p className="count">
          {visibleOrders.length} {visibleOrders.length === 1 ? 'Bestellung' : 'Bestellungen'}
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
          <label htmlFor="restaurant">Lokal</label>
          <select
            id="restaurant"
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            required
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {RESTAURANTS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
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

      <p className="footer-link">
        <a href="/admin">Admin</a> · <a href="/impressum">Impressum</a>
      </p>
    </main>
  );
}
