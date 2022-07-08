# Phraser

## Nutzung

### Wörter hinzufügen

- manuell im Tab "Mein Vokabular"
- im Wikipedia-Reader, Linksklick auf ein Wort (vielleicht kurz warten, braucht manchmal etwas) und bei einer Definition auf speichern drücken

### Wikipedia-Reader

1) Namen eines Wikipedia-Artikels eingeben
2) Auf den darunter erscheinenden Vorschlag klicken
3) Warten, bis die Seite geladen ist
4) Nun kann auf Wörter geklickt werden, um die Definition laut wiktionary.com zu sehen

## Dateistruktur

- `/assets/`: beinhaltet icons und sonstige assets
- `/lib/`: beinhaltet externe Javascript und CSS Bibliotheken für den Renderer Prozess
- `/src/`: beinhaltet den tatsächlichen Source-Code in Typescript; wird später kompiliert in JavaScript in `/js_dist/`
- `/ui/`: beinhaltet Dateien zur Darstellung des GUI
    - `/css/`: CSS-Deklarationen
    - `/html/`: HTML-Dokumente
- `.gitignore`: Deklariert Dateien und Ordner, die nicht in das Git-Repository gehören
- `package.json`: NodePackageManager Paketdatei
- `README.md`: Diese Datei
- `tsconfig.json`: TypescriptCompiler Config Datei

## Bibliotheken

- [Materialize](https://materializecss.com/) siehe `/lib/materialize-v1.0.0`

## Eigene Module

`js-wiktionary-scraper` siehe [auf npmjs.org](https://www.npmjs.com/package/js-wiktionary-scraper)

## Funktion

VocTrainer nutzt das NodeJS Modul [Electron](https://www.electronjs.org/) zur Darstellug von interaktiven Web-Dokumenten als Benutzeroberfläche (entspricht einer Web-App für Computer)

Als Programmiersprache wird Typescript benutzt, das zu JavaScript (CommonJS) konvertiert wird. Die Typescript Compiler Optionen sind in `tsconfig.json` zu finden.

Das NodeJS package wird in `package.json` definiert

## Speicher

Die Vokabeln werden in einer .db-Datei im Appdata/Roaming Verzeichnis des aktuellen Nutzers gespeichert. (auffindbar durch `%APPDATA%/phraser_trainer`)

## Packaging

Es wird benötigt:
- NodeJS + [Node Package Manager](https://nodejs.org/) (npm)
- [Typescript](https://www.typescriptlang.org/) Compiler (tsc)

Danach müssen alle benötigten NodeJS Module installiert werden:

`> npm install`

Das Projekt kann mit dem Shell Command `npm run dist` gepackaged werden.

## Startargumente

- `--debug`: Startet das Programm im Debug-Modus (mit Chrome Developer Tools)