export const metadata = {
  title: 'Impressum – Döner-Bestellung',
};

export default function ImpressumPage() {
  return (
    <main className="page">
      <header className="header">
        <h1>Impressum</h1>
        <p className="subtitle">Offenlegung gemäß § 25 Mediengesetz und Angaben gemäß § 5 E-Commerce-Gesetz</p>
      </header>

      <section className="legal">
        <dl className="legal-facts">
          <div>
            <dt>Medieninhaber und Herausgeber</dt>
            <dd>Oliver Rodax</dd>
          </div>
          <div>
            <dt>Anschrift</dt>
            <dd>
              Auf der Wiese 7
              <br />
              2824 Schiltern
              <br />
              Österreich
            </dd>
          </div>
          <div>
            <dt>Kontakt</dt>
            <dd>
              <a href="mailto:oliver.rodax@gmail.com">oliver.rodax@gmail.com</a>
            </dd>
          </div>
          <div>
            <dt>Für den Inhalt verantwortlich</dt>
            <dd>Oliver Rodax</dd>
          </div>
          <div>
            <dt>Unternehmensgegenstand</dt>
            <dd>Private, nicht-kommerzielle Website zur Organisation von Döner-Bestellungen für eine Schulklasse.</dd>
          </div>
        </dl>

        <div className="legal-text">
          <h2>Haftung für Inhalte</h2>
          <p>
            Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
            Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
          </p>

          <h2>Urheberrecht</h2>
          <p>Die auf dieser Website veröffentlichten Inhalte unterliegen dem österreichischen Urheberrecht.</p>

          <h2>Datenschutz</h2>
          <p>
            Diese Website speichert die Angaben, die du im Bestellformular einträgst (Name, ausgewähltes Lokal,
            Bestelltext), in einer Datenbank auf dem Server, um die tagesaktuelle Bestellliste anzuzeigen. Einträge
            werden automatisch gelöscht, sobald der jeweilige Tag vorbei ist. Es werden keine Cookies gesetzt und
            keine externen Analyse- oder Tracking-Dienste eingebunden. Schriftarten werden von Google Fonts geladen,
            wobei die IP-Adresse an Google übertragen wird. Das Löschen einzelner Bestellungen ist ausschließlich
            über den passwortgeschützten Admin-Bereich möglich.
          </p>
        </div>
      </section>

      <p className="footer-link">
        <a href="/">Zurück zur Bestellliste</a>
      </p>
    </main>
  );
}
