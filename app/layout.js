import './globals.css';

export const metadata = {
  title: 'Döner-Bestellung',
  description: 'Gemeinsame Döner-Bestellliste für die Klasse',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
