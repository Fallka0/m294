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
      'Meienstrasse 4',
      '3052, Zollikofen, BE, Schweiz',
    ],
  },
  {
    title: 'Kontakt',
    content: [
      'Verantwortliche Kontaktperson: Mykyta Pantelei',
      'E-Mail: mykytapantelei@gmail.com',
      'Website: planary.ch',
    ],
  },
  {
    title: 'Hinweis zur Organisation',
    content: [
      'Es besteht keine eingetragene Gesellschaft oder Handelsregistereintragung für dieses Projekt.',
      'Die Website Tournament wird organisatorisch unter dem Namen Planary geführt.',
    ],
  },
  {
    title: 'Haftungshinweis',
    content: [
      'Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.',
      'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.',
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
            Diese Seite stellt die Anbieterkennzeichnung für <strong>Tournament</strong> bereit. Das Projekt gehört organisatorisch zu <strong>Planary</strong>, wird jedoch nicht von einer eingetragenen Firma betrieben.
          </p>
        }
      />

      <section className="app-card rounded-[32px] p-8 md:p-10">

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
