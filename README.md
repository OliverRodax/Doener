# Döner-Bestellung

Gemeinsame, tagesaktuelle Döner-Bestellliste für die Klasse. Jede*r trägt Name und Bestellung ein, alle sehen die Liste live – kein Login nötig.

## Setup

```bash
npm install
cp .env.local.example .env.local   # dann ADMIN_PASSWORD darin setzen
npm run build
npm run start
```

Standardmäßig läuft die App auf Port 3000 (`PORT=<port> npm run start` zum Ändern).

## Admin-Passwort

Das Admin-Passwort steht **nicht** im Code, sondern muss als Umgebungsvariable `ADMIN_PASSWORD` gesetzt werden (z. B. in `.env.local`, das gitignored ist). Ohne gesetztes Passwort ist `/admin` gesperrt.

## Wie es funktioniert

- Bestellungen liegen in einer lokalen SQLite-Datei (`data.db`), die neben der App entsteht und **nicht** ins Repo gehört (siehe `.gitignore`).
- Die Liste ist nach Datum gruppiert (Zeitzone `Europe/Berlin`). Bestellungen von vergangenen Tagen werden automatisch aus der Datenbank gelöscht (Prüfung läuft minütlich sowie bei jeder Anfrage) – es sammelt sich also nichts an.
- Wer selbst eine Bestellung eingetragen hat, bekommt lokal (per Browser) einen zufälligen Token gespeichert und kann darüber ausschließlich die eigene Bestellung wieder löschen.
- Unter `/admin` kann man sich mit `ADMIN_PASSWORD` anmelden und dort **jede** Bestellung des Tages löschen (z. B. Duplikate oder Fake-Einträge) – nicht nur die eigene.
- Die Bestellzeiten (Mo–Fr) stehen fest in `lib/deadlines.js` und werden auf der Startseite angezeigt, inklusive Hinweis, ob der heutige Bestellschluss schon vorbei ist.
- Beim Bestellen wählt man ein Lokal aus (`lib/restaurants.js`: Kebap Express, Mr Kebap, Traum Cafe, Pizza Mega). Ein kleines Balkendiagramm auf der Startseite zeigt live, wo heute die meisten bestellen.
- Die Seite pollt alle 4 Sekunden, damit alle denselben aktuellen Stand sehen.

## Deployment auf eigenem Server

1. Repo klonen, `npm install`, `npm run build`.
2. Prozess dauerhaft laufen lassen, z. B. mit `pm2 start npm --name doener -- start` oder als systemd-Service.
3. Reverse Proxy (nginx/Caddy) auf den Node-Port zeigen lassen, optional mit eigener Domain/HTTPS.
4. `data.db` regelmäßig sichern, falls die Bestellhistorie wichtig ist.
