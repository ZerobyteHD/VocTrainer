# VocTrainer

## To-dos

- [x] Popup als eigene Klasse, Ladeanimation fehlt
- [x] Trainingstab
- [ ] Trainingstab funktionsfähig machen
- [ ] Graph?
- [x] WiktionaryAPI verbessern

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

## Packaging

Es wird benötigt:
- NodeJS + [Node Package Manager](https://nodejs.org/) (npm)
- [Typescript](https://www.typescriptlang.org/) Compiler (tsc)

Danach müssen alle benötigten Node Module installiert werden:

`> npm install`

Das Projekt kann mit dem Shell Command `npm run dist` gepackaged werden.

## Startargumente

- `--debug`: Startet das Programm im Debug-Modus (mit Chrome Developer Tools)