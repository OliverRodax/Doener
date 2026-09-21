# Döner-Bestellung

Gemeinsame, tagesaktuelle Döner-Bestellliste für die Klasse. Jede*r trägt Name und Bestellung ein, alle sehen die Liste live – kein Login nötig.

## Setup

```bash
npm install
npm run build
npm run start
```

Standardmäßig läuft die App auf Port 3000 (`PORT=<port> npm run start` zum Ändern).

## Wie es funktioniert

- Bestellungen liegen in einer lokalen SQLite-Datei (`data.db`), die neben der App entsteht und **nicht** ins Repo gehört (siehe `.gitignore`).
- Die Liste ist nach Datum gruppiert (Zeitzone `Europe/Berlin`) und leert sich dadurch automatisch jeden Tag – alte Tage bleiben in der Datenbank erhalten.
- Wer selbst eine Bestellung eingetragen hat, bekommt lokal (per Browser) einen zufälligen Token gespeichert und kann darüber ausschließlich die eigene Bestellung wieder löschen.
- Die Seite pollt alle 4 Sekunden, damit alle denselben aktuellen Stand sehen.

## Deployment auf eigenem Server

1. Repo klonen, `npm install`, `npm run build`.
2. Prozess dauerhaft laufen lassen, z. B. mit `pm2 start npm --name doener -- start` oder als systemd-Service.
3. Reverse Proxy (nginx/Caddy) auf den Node-Port zeigen lassen, optional mit eigener Domain/HTTPS.
4. `data.db` regelmäßig sichern, falls die Bestellhistorie wichtig ist.
