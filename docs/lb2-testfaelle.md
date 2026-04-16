# LB2 Manuelle Testfaelle - TournamentHub

## Testfallstandard

Jeder Testfall ist nach folgendem Schema aufgebaut:

- Testfall-ID
- Titel
- Ziel
- Vorbedingungen
- Testdaten
- Testschritte
- Erwartetes Resultat

---

## TC-01 - Turnier erstellen mit gueltigen Daten

- **Ziel:** Pruefen, ob ein Turnier korrekt erstellt wird.
- **Vorbedingungen:** Benutzer ist eingeloggt.
- **Testdaten:** Name, Sportart, Datum, Modus, maximale Teilnehmerzahl.
- **Testschritte:**
  1. Login durchfuehren.
  2. Seite `Create Tournament` oeffnen.
  3. Alle Pflichtfelder korrekt ausfuellen.
  4. Auf `Save Tournament` klicken.
- **Erwartetes Resultat:** Turnier wird gespeichert, Benutzer wird zur Uebersicht weitergeleitet und das neue Turnier erscheint in der Liste.

## TC-02 - Turnier erstellen mit leeren Pflichtfeldern

- **Ziel:** Pruefen, ob Pflichtfelder validiert werden.
- **Vorbedingungen:** Benutzer ist eingeloggt.
- **Testdaten:** Leere Pflichtfelder.
- **Testschritte:**
  1. Seite `Create Tournament` oeffnen.
  2. Keine oder nur teilweise Daten eingeben.
  3. Auf `Save Tournament` klicken.
- **Erwartetes Resultat:** Das Turnier wird nicht gespeichert. Inline-Fehlermeldungen und ein allgemeiner Hinweis werden angezeigt.

## TC-03 - Teilnehmer manuell hinzufuegen

- **Ziel:** Pruefen, ob ein Organisator Teilnehmer per Name hinzufuegen kann.
- **Vorbedingungen:** Benutzer ist Organisator eines Turniers.
- **Testdaten:** Teilnehmername.
- **Testschritte:**
  1. Turnierdetailseite oeffnen.
  2. Im Feld `Add participant` einen Namen eingeben.
  3. Auf `+` klicken.
- **Erwartetes Resultat:** Teilnehmer wird gespeichert und in der Teilnehmerliste angezeigt.

## TC-04 - Teilnehmerlimit erreichen

- **Ziel:** Pruefen, ob das Teilnehmerlimit eingehalten wird.
- **Vorbedingungen:** Turnier mit kleiner Teilnehmergrenze vorhanden.
- **Testdaten:** Teilnehmer bis zum Maximum.
- **Testschritte:**
  1. Teilnehmer bis zum Limit hinzufuegen.
  2. Einen weiteren Teilnehmer hinzufuegen oder als Nutzer beitreten.
- **Erwartetes Resultat:** Weitere Anmeldung ist blockiert und es erscheint ein Hinweis, dass das Turnier voll ist.

## TC-05 - Bracket generieren mit genuegend Teilnehmern

- **Ziel:** Pruefen, ob ein Bracket erzeugt wird.
- **Vorbedingungen:** Mindestens 2 Teilnehmer sind vorhanden, Organisator ist eingeloggt.
- **Testdaten:** Turnier mit mindestens 2 Teilnehmern.
- **Testschritte:**
  1. Turnierdetailseite oeffnen.
  2. Auf `Generate Bracket` klicken.
- **Erwartetes Resultat:** Matches der ersten Runde werden erstellt und im Bracket angezeigt.

## TC-06 - Bracket generieren mit zu wenigen Teilnehmern

- **Ziel:** Pruefen, ob die Generierung bei weniger als 2 Teilnehmern gesperrt ist.
- **Vorbedingungen:** Turnier mit 0 oder 1 Teilnehmer.
- **Testdaten:** Keine speziellen Daten.
- **Testschritte:**
  1. Turnierdetailseite oeffnen.
  2. Versuchen, das Bracket zu generieren.
- **Erwartetes Resultat:** Es erscheint ein Hinweistext, dass mindestens 2 Teilnehmer benoetigt werden. Keine Matches werden erstellt.

## TC-07 - Resultat erfassen

- **Ziel:** Pruefen, ob Resultate gespeichert werden.
- **Vorbedingungen:** Bracket wurde generiert.
- **Testdaten:** Zwei gueltige Scores ohne Gleichstand.
- **Testschritte:**
  1. Ein Match oeffnen.
  2. Resultat eingeben.
  3. Auf `Save` klicken.
- **Erwartetes Resultat:** Resultat wird gespeichert, Gewinner wird markiert und das Bracket aktualisiert sich.

## TC-08 - Resultat aendern und Folge-Runde aktualisieren

- **Ziel:** Pruefen, ob sich nach einer Aenderung frueherer Ergebnisse spaetere Runden korrekt anpassen.
- **Vorbedingungen:** Mehrere Runden existieren bereits.
- **Testdaten:** Match in Runde 1 und Folge-Match in Runde 2.
- **Testschritte:**
  1. In Runde 1 ein bestehendes Resultat aendern.
  2. Gewinner wechseln.
  3. Speichern.
- **Erwartetes Resultat:** Der Teilnehmer in der naechsten Runde wird aktualisiert. Falls ein spaeteres Resultat dadurch ungueltig wird, wird dieses zurueckgesetzt.

## TC-09 - Oeffentliche Turnieransicht ohne Login

- **Ziel:** Pruefen, ob Turnierdetails oeffentlich zugreifbar sind.
- **Vorbedingungen:** Ein oeffentliches Turnier existiert.
- **Testdaten:** Keine.
- **Testschritte:**
  1. Ohne Login die URL eines oeffentlichen Turniers oeffnen.
- **Erwartetes Resultat:** Turnierdetails und Bracket sind sichtbar, ohne dass ein Login erforderlich ist.

## TC-10 - Turnier bearbeiten

- **Ziel:** Pruefen, ob Organisatoren Turnierdaten aendern koennen.
- **Vorbedingungen:** Benutzer ist Eigentuemmer des Turniers.
- **Testdaten:** Neuer Name, neues Datum oder neue Einstellungen.
- **Testschritte:**
  1. Turnier bearbeiten.
  2. Werte aendern.
  3. Speichern.
- **Erwartetes Resultat:** Aenderungen werden gespeichert und auf der Detailseite angezeigt.

## TC-11 - Turnier loeschen

- **Ziel:** Pruefen, ob ein Turnier bestaetigt geloescht wird.
- **Vorbedingungen:** Benutzer ist Eigentuemmer des Turniers.
- **Testdaten:** Keine.
- **Testschritte:**
  1. Auf `Delete Tournament` klicken.
  2. Dialog bestaetigen.
- **Erwartetes Resultat:** Turnier wird geloescht und Benutzer wird auf die Uebersicht weitergeleitet.

## TC-12 - Oeffentlichem Turnier beitreten

- **Ziel:** Pruefen, ob ein eingeloggter Nutzer einem oeffentlichen Turnier beitreten kann.
- **Vorbedingungen:** Nutzer ist eingeloggt und noch kein Teilnehmer.
- **Testdaten:** Oeffentliches, offenes Turnier mit freiem Platz.
- **Testschritte:**
  1. Turnierdetailseite oeffnen.
  2. Auf `Join Tournament` klicken.
- **Erwartetes Resultat:** Nutzer wird als Teilnehmer eingetragen und ein Erfolgshinweis erscheint.

## TC-13 - Turnier verlassen

- **Ziel:** Pruefen, ob ein beigetretener Nutzer das Turnier wieder verlassen kann.
- **Vorbedingungen:** Nutzer ist Teilnehmer eines oeffentlichen Turniers.
- **Testdaten:** Keine.
- **Testschritte:**
  1. Turnierdetailseite oeffnen.
  2. Auf `Leave Tournament` klicken.
  3. Den Bestaetigungsdialog bestaetigen.
- **Erwartetes Resultat:** Teilnehmer wird entfernt und die Erfolgsmeldung `You left the tournament.` wird angezeigt.

## TC-14 - Responsives Verhalten auf Mobile

- **Ziel:** Pruefen, ob die Anwendung auch auf kleineren Bildschirmen benutzbar bleibt.
- **Vorbedingungen:** Browser mit Device-Toolbar oder Mobile-Geraet.
- **Testdaten:** Keine.
- **Testschritte:**
  1. Startseite auf kleiner Bildschirmbreite oeffnen.
  2. Navigation pruefen.
  3. Auth-Seite und Turnierdetailseite pruefen.
- **Erwartetes Resultat:** Inhalte bleiben lesbar, Navigation ist ueber Burger-Menue erreichbar und Formulare sind bedienbar.
