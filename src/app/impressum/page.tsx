import type { Metadata } from 'next'
import PageHero from '@/components/layout/PageHero'
import PageShell from '@/components/layout/PageShell'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Legal notice and contact details for Tournament.',
}

const legalSections = [
  {
    title: 'Anbieter',
    content: [
      'Tournament',
      'Privates Projekt innerhalb von Planary',
      '[Strasse und Hausnummer ergaenzen]',
      '[PLZ, Ort, Land ergaenzen]',
    ],
  },
  {
    title: 'Kontakt',
    content: [
      'Verantwortliche Kontaktperson: Mykyta Pantelei',
      'E-Mail: [Kontaktadresse ergaenzen]',
      'Telefon: [Telefonnummer optional ergaenzen]',
      'Website: [Domain ergaenzen]',
    ],
  },
  {
    title: 'Hinweis zur Organisation',
    content: [
      'Es besteht keine eingetragene Gesellschaft oder Handelsregistereintragung fuer dieses Projekt.',
      'Die Website Tournament wird organisatorisch unter dem Namen Planary gefuehrt.',
    ],
  },
  {
    title: 'Haftungshinweis',
    content: [
      'Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Fuer die Richtigkeit, Vollstaendigkeit und Aktualitaet der Inhalte wird jedoch keine Gewaehr uebernommen.',
      'Trotz sorgfaeltiger inhaltlicher Kontrolle uebernehmen wir keine Haftung fuer die Inhalte externer Links. Fuer den Inhalt der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.',
    ],
  },
]

export default function ImpressumPage() {
  return (
    <PageShell contentClassName="max-w-5xl">
      <PageHero
        badge="Rechtliches"
        title={<h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Impressum</h1>}
        description={
          <p>
            Diese Seite stellt die Anbieterkennzeichnung fuer <strong>Tournament</strong> bereit. Das Projekt gehoert organisatorisch zu <strong>Planary</strong>, wird jedoch nicht von einer eingetragenen Firma betrieben.
          </p>
        }
      />

      <section className="app-card rounded-[32px] p-8 md:p-10">
        <div className="app-banner-danger rounded-2xl px-4 py-3 text-sm">
          Einige Angaben sind noch als Platzhalter markiert und sollten vor dem Livegang mit den korrekten oeffentlichen Kontakt- und Adressdaten ersetzt werden.
        </div>

        <div className="mt-8 grid gap-4">
          {legalSections.map((section) => (
            <section key={section.title} className="app-card-elevated rounded-[24px] p-6">
              <h2 className="app-text-primary text-xl font-semibold tracking-tight">{section.title}</h2>
              <div className="app-text-secondary mt-4 space-y-2 text-sm leading-7">
                {section.content.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
