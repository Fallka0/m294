# LB2 Projektdokumentation - TournamentHub

## 1. Projektuebersicht

### 1.1 Projektidee

TournamentHub ist eine Webapplikation zur Verwaltung von Turnieren. Organisatoren koennen Turniere erstellen, bearbeiten, Teilnehmer verwalten und Brackets generieren. Oeffentliche Turniere koennen von anderen Nutzern entdeckt und bei offener Anmeldung direkt beigetreten werden.

### 1.2 Ziel des Projekts

Ziel des Projekts war es, eine moderne, gut lesbare und responsive Webanwendung zu entwickeln, welche die wichtigsten Turnierprozesse digital abbildet:

- Turnier erstellen
- Teilnehmer verwalten
- Bracket generieren
- Resultate erfassen
- Turnierstand oeffentlich anzeigen
- Profil und Authentifizierung fuer Organisatoren bereitstellen

### 1.3 Zielgruppen

- Organisatoren von Sport- und Gaming-Turnieren
- Teilnehmer, die sich fuer oeffentliche Turniere anmelden moechten
- Zuschauer, die den aktuellen Turnierstand verfolgen wollen

## 2. Gedanken zur Umsetzung

### 2.1 Umsetzungsansatz

Die Applikation wurde als Single-Page-nahe Webanwendung mit serverseitigem Routing umgesetzt. Der Fokus lag auf einer klaren Informationsstruktur, einfacher Bedienung und modularen Komponenten.

Die Anwendung ist so aufgebaut, dass zentrale Bereiche voneinander getrennt sind:

- Authentifizierung
- Dashboard und Turnieruebersicht
- Turnierdetails und Bracket
- Profilverwaltung
- geteilte UI-Komponenten

Durch diese Trennung konnte die Anwendung Schritt fuer Schritt erweitert werden, ohne die gesamte Struktur umbauen zu muessen.

### 2.2 Frontendtechnologien und Begruendung

#### Next.js

Next.js wurde als Framework verwendet, weil es Routing, Build-Prozess, Performance-Optimierungen und eine saubere Projektstruktur bereitstellt. Dadurch konnte die Anwendung in mehrere Seiten und dynamische Routen aufgeteilt werden, zum Beispiel:

- `/`
- `/auth`
- `/profile`
- `/tournaments/[id]`
- `/tournaments/[id]/edit`

#### React

React wurde fuer die komponentenbasierte Oberflaeche eingesetzt. Das erleichtert die Wiederverwendung von Elementen wie Header, Tournament Cards, Formularen und Bracket-Komponenten.

#### TypeScript

TypeScript wurde verwendet, um Datenstrukturen wie `Tournament`, `Participant`, `Match` und `Profile` explizit zu typisieren. Dadurch werden Fehler frueher erkannt und die Wartbarkeit verbessert.

#### Tailwind CSS

Tailwind wurde fuer das Styling genutzt, weil damit schnell konsistente und responsive Layouts gebaut werden koennen. Gleichzeitig wurden globale Design-Variablen genutzt, um Light Mode und Dark Mode einheitlich zu steuern.

#### Framer Motion

Framer Motion wurde fuer weiche Animationen und Statuswechsel eingesetzt, zum Beispiel bei Karten und Uebergaengen. Dadurch wirkt die Anwendung moderner und responsiver.

#### Supabase

Supabase wurde als Backend-Service fuer Authentifizierung und Datenhaltung eingesetzt. Damit konnten Benutzerkonten, OAuth, Turniere, Teilnehmer, Matches und Profile einfach verwaltet werden.

## 3. Architektur und Struktur

### 3.1 Wichtige Verzeichnisse

```text
src/
|- app/
|  |- auth/
|  |- profile/
|  |- organizers/[id]/
|  |- tournaments/
|     |- new/
|     |- [id]/
|        |- edit/
|        |- bracket/
|- components/
|  |- auth/
|  |- home/
|  |- profile/
|  |- theme/
|  |- tournaments/
|- lib/
```

### 3.2 Modulare Komponenten

Die Anwendung wurde bewusst modular aufgebaut. Beispiele:

- `Header.tsx` fuer Navigation und Theme-Steuerung
- `TournamentForm.tsx` fuer Erstellen und Bearbeiten
- `TournamentBracket.tsx` fuer die Bracket-Darstellung
- `AuthProvider.tsx` fuer den globalen Auth-Zustand
- `ThemeProvider.tsx` fuer Light/Dark Mode

Diese Struktur verbessert Lesbarkeit, Wiederverwendung und Wartbarkeit.

## 4. Umsetzung des Frontends

### 4.1 Lesbarkeit und Professionalitaet

Bei der Gestaltung wurde auf folgende Punkte geachtet:

- klare Hierarchien in Schriftgroessen und Kontrasten
- konsistente Buttons und Hover-Zustaende
- eindeutig erkennbare Statusanzeigen
- getrennte Informationsbereiche auf Detailseiten
- sichtbare Fehlermeldungen und Hinweise

### 4.2 Responsives Design

Die Oberflaeche passt sich an verschiedene Bildschirmgroessen an:

- Desktop-Navigation mit voller Aktionsleiste
- mobile Burger-Navigation
- flexible Karten- und Grid-Layouts
- mobile Form- und Bracket-Darstellung

### 4.3 Fehlertoleranz und Stabilitaet

Es wurden mehrere Schutzmechanismen eingebaut:

- Pflichtfelder in Formularen
- sichtbare Validierung bei der Turniererstellung
- Begrenzung der Teilnehmerzahl
- Hinweise bei zu wenigen Teilnehmern fuer Bracket-Generierung
- Schutz vor ungueltigen Resultaten wie negativen Scores oder Unentschieden
- Weiterleitung auf Login-Seite bei geschuetzten Bereichen

## 5. Abweichungen zum urspruenglichen Konzept

Im Laufe der Umsetzung gab es einige bewusste oder technische Abweichungen:

### 5.1 Share-Link fuer Anmeldung

Geplant war ein expliziter oeffentlicher Anmeldelink. Aktuell erfolgt die Anmeldung ueber die oeffentliche Turnierseite und den Button `Join Tournament`. Funktional ist die Anmeldung vorhanden, aber nicht als separater teilbarer Link-Generator umgesetzt.

### 5.2 Turniermodi

Die Applikation unterstuetzt mehrere Modus-Auswahlen im Formular (`group`, `knockout`, `both`), die Bracket-Logik ist aktuell jedoch hauptsaechlich auf Knockout-Verlaeufe ausgelegt. Der Modus ist also in der Oberflaeche vorhanden, aber noch nicht fuer alle Varianten vollumfaenglich umgesetzt.

### 5.3 Oeffentliche Turnieransicht

Die oeffentliche Turnierdetailseite zeigt Status, Teilnehmer und Bracket. Eine separate Liste fuer kommende und bereits abgeschlossene Spiele ist derzeit noch nicht als eigener Bereich umgesetzt.

### 5.4 Auth-Redirects

Durch die Kombination aus lokaler Entwicklung, Vercel-Deployment und Supabase OAuth mussten Redirects teilweise explizit konfiguriert werden. Diese technische Abweichung wurde dokumentiert und stabilisiert, da sie in der Entwicklungsphase mehrfach Probleme verursachte.

## 6. Bewertung der aktuellen Umsetzung

### 6.1 Starke Punkte

- moderne und saubere UI
- modulare Codebasis
- funktionierende Authentifizierung mit OAuth
- Profilanpassung fuer Organisatoren
- funktionierende Bracket-Bearbeitung mit Ergebnisfortschreibung
- responsive Nutzung fuer mobile Geraete

### 6.2 Offene Verbesserungsmoeglichkeiten

- vollstaendige Unterstuetzung weiterer Bracket-Typen
- expliziter Link-Generator fuer Anmeldungen
- weiter ausgebautes Test-Setup mit automatisierten Tests
- noch detailliertere Status- und Matchansichten fuer Zuschauer

## 7. Fazit

TournamentHub erfuellt die wichtigsten Anforderungen an eine professionelle, gut lesbare und modulare Webapplikation. Die technische Umsetzung mit Next.js, React, TypeScript, Tailwind und Supabase ist schluessig und nachvollziehbar. Gleichzeitig wurden Abweichungen zum Konzept offen dokumentiert, damit die aktuelle Version realistisch und ehrlich beurteilt werden kann.
