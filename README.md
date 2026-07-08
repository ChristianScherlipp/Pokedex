# Pokédex Web App

Eine interaktive Pokédex-Webanwendung, die Daten der [PokéAPI](https://pokeapi.co/) nutzt, um Pokémon anzuzeigen, zu durchsuchen und detaillierte Informationen abzurufen.

## Features

- **Übersichtsseite** mit allen Pokémon als Karten
- **Detail-Dialog** mit vier Tabs:
  - About (Basisinformationen)
  - Base Stats (Werte)
  - Evolution (Entwicklungskette)
  - Moves (Attacken)
- **Navigation** innerhalb des Dialogs mit Wrap-Around-Verhalten (nach dem letzten Pokémon geht es zurück zum ersten und umgekehrt)
- **Suche/Filter**, um gezielt nach Pokémon zu suchen
- **Ladebildschirm** mit garantierter Mindestanzeigedauer, damit kein Flackern bei schnellen Ladezeiten entsteht
- **Body Scroll-Lock**, damit der Hintergrund nicht scrollt, während der Detail-Dialog geöffnet ist

## Projektstruktur

```
├── index.html      # Grundgerüst der Seite
├── script.js       # Gesamte Logik (Datenabruf, Event-Handling, State)
├── template.js      # Reine HTML-Templates (keine Logik, keine Schleifen)
└── database.js      # Datenhaltung / Zwischenspeicherung der API-Daten
```

## Architekturprinzipien

Dieses Projekt folgt bewusst klaren Trennregeln:

- **Separation of Concerns**: Jegliche Logik lebt ausschließlich in `script.js`. `template.js` liefert nur reines HTML zurück – keine Berechnungen, keine Schleifen.
- **Kurze Funktionen**: Funktionen bleiben unter 14 Zeilen; bei Bedarf wird in Hilfsfunktionen ausgelagert.
- **Klassische Schleifen**: Statt `.map()`, `.filter()` oder `.join()` werden bewusst `for`-Schleifen mit `.length` verwendet.

## Technologien

- Vanilla JavaScript (keine Frameworks)
- [PokéAPI](https://pokeapi.co/) als Datenquelle
- CSS-Filterketten zur Einfärbung der SVG-Typ-Icons entsprechend aller 18 Pokémon-Typen

## Bekannte Probleme

- `ReferenceError` in `getEvolutionChainData`: `data.chain` wird referenziert, bevor `data` deklariert ist (Temporal Dead Zone). Fix steht noch aus.

## Setup

1. Repository klonen oder Dateien herunterladen
2. `index.html` im Browser öffnen
3. Keine weiteren Abhängigkeiten oder Build-Schritte nötig

## Autor

Chris – im Rahmen der Umschulung zum Fachinformatiker für Anwendungsentwicklung
