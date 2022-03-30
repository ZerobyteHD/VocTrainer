# VocTrainer

## Dateistruktur

- `/assets/`: beinhaltet icons
- `/lib/`: beinhaltet externe Javascript und CSS Bibliotheken für den Renderer Prozess
- `/src/`: beinhaltet tatsächlichen Source-Code in Typescript; wird später kompiliert in `/js_dist/`
- `/ui/`: beinhaltet Dateien zur Darstellung der GUI
- `/ui/css/`: CSS-Deklarationen
- `/ui/html/`: HTML-Dokumente
- `.gitignore`: Deklariert Dateien und Ordner, die nicht in das Git-Repository gehören
- `package.json`: NodePackageManager Deklarationsdatei
- `README.md`: Diese Datei
- `tsconfig.json`: TypescriptCompiler Config Datei

## Eigene Module

`js-wiktionary-scraper` siehe https://www.npmjs.com/package/js-wiktionary-scraper

## Funktion

VocTrainer nutzt das NODEJS Modul electron.js zur Darstellug von interaktiven Web-Dokumenten
Als Programmiersprache wird Typescript benutzt, dass zu JavaScript (CommonJS) konvertiert wird. Die Typescript Compiler Optionen sind in `tsconfig.json` zu finden. Zum Kompilieren wird der Typescriptcompiler (tsc) benötigt
Die package Definition ist in `package.json` zu finden

## Distribution

### Building
Es wird benötigt:
- Node Package Manager (npm + nodeJS)
- Typescript Compiler (tsc)

Danach müssen alle benötigten Node Module installiert werden:

`> npm install`

Das Projekt kann mit dem Shell Command `npm run dist` gepackaged werden.