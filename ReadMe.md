# Hinweise zum Programmierbeispiel

<Juergen.Zimmermann@HS-Karlsruhe.de>

> Diese Datei ist in Markdown geschrieben und kann mit `<Strg><Shift>v` in
> Visual Studio Code leicht gelesen werden.
>
> Näheres zu Markdown gibt es in einem [Wiki](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
>
> Nur in den ersten beiden Vorlesungswochen kann es Unterstützung bei
> Installationsproblemen geben.

## Download- und ggf. Upload-Geschwindigkeit

Durch das Kommando `fast` kann man in einer Powershell die akktuelle
Download-Geschwindigkeit ermitteln.

Mit der zusätzlichen Option `--upload` kann auch noch die aktuelle
Upload-Geschwindigkeit ermittelt werden.

## Vorbereitung der Installation

- Das Beispiel _nicht_ in einem Pfad mit _Leerzeichen_ installieren.
  Viele Javascript-Bibliotheken werden unter Linux entwickelt und dort benutzt
  man keine Leerzeichen in Pfaden. Ebenso würde ich das Beispiel nicht auf dem
  _Desktop_ auspacken bzw. installieren.

- Bei [GitHub](https://github.com) registrieren, falls man dort noch nicht
  registriert ist.

## Künftige Routineaufgaben

### Starten und Herunterfahren der lokalen MongoDB-Installation

```CMD
    npm run mongo
    npm run mongo stop
```

Eine (Anwendungs-) DB mit Name `acme` (= a company that makes everything) ist
vorhanden.

### Datenbankbrowser _Compass_

Defaultwerte für MongoDB beibehalten zzgl. Authentifizierung:

```YAML
    Server:         localhost
    Port:           27017
    Authentication: admin/p
```

### Evtl. Übersetzung durch den TypeScript-Compiler in einer Powershell

```CMD
    npm run tsc
```

- Zuerst die Codequalität mit _tslint_ prüfen und dann
- .ts-Dateien durch _tsc_ in das Verzeichnis `dist` übersetzen

## Starten des Appservers (mit Node.js und Express)

### Entwicklung mit _nodemon_ und _ts-node_ in einer Powershell

Durch _nodemon_ (= Node Monitor) wird der Appserver so gestartet, dass er z.B.
JavaScript-Dateien im laufenden Betrieb nachlädt, wenn sie später aktualisiert
werden. Zusätzlich wird _ts-node_ verwendet, damit geänderte TypeScript-Dateien
sofort in JavaScript-Dateien übersetzt werden. Eine explizite Übersetzung der
TypeScript-Dateien (s.o.) ist also _nicht_ notwendig!

Beim Starten des Appservers wird mit _mongoose_ auf _MongoDB_ zugegriffen.
Wenn eine lokale Installation von MongoDB verwendet wird, dann ist Benutzername
und Passwort auf `admin` und `p` in der Date `src\shared\config\db.ts`
(Zeile 40) voreingestellt. Wenn man MongoDB mit _Atlas_ (s.u.) statt einer
lokalen Installation benutzen möchte, muss man in der Datei `.env` die
Konfigurationsdaten für Atlas eintragen und die jeweiligen Kommentare entfernen.
Es ist empfehlenswert, zuerst das Beispiel mit einer lokalen
MongoDB-Installation zum Laufen zu bringen, um die Fehlerquellen zu reduzieren.

Mit dem nachfolgenden Kommando startet man den Appserver mit _nodemon_ und
_ts-node_, der eine REST-Schnittstelle und eine GraphQL-Schnittstelle hat:

```CMD
    npm run start:dev
```

### _REST Client_ für eine REST- und eine GraphQL-Schnittstelle

Im Unterverzeichnis `restclient` befinden sich mehrere Dateien mit der Extension
`.rest` oder `.http`. In diesen Dateien sind Interaktionsmöglichkeiten für die
REST- und die GraphQL-Schnittstelle.

Wenn man eine dieser Dateien in VS Code öffnet, dann sieht man bei jedem
Beispiel bzw. Abschnitt, der mit `###` beginnt, eine künstliche Zeile mit
_Send Request_ (keine Zeilennummer!). Auf _Send Request_ kann man klicken und
der Request wird ausgeführt, wozu natürlich der Server erfolgreich gestartet
sein sollte.

Alternativ kann man im Webbrowser GET-Requests für die REST-Schnittstelle
aufrufen oder auch GraphQL mittels _GraphiQL_ benutzen. Die URL für GraphQL
lautet `https://localhost:8443/api`. Beispielhafte _Queries_ und _Mutations_
für GraphQL gibt es in der Datei `restclient\buecher.graphql.http`.

Für GET-Requests mit Chrome empfiehlt sich die Erweiterung _JSON Formatter_.

## Tests aufrufen

### Voraussetzungen

- Der MongoDB-Server muss laufen oder Atlas muss in .env konfiguriert sein.
- Der Appserver darf _nicht_ laufen

### Aufruf in einer Powershell

```CMD
    npm t
```

## AsciiDoctor und PlantUML

Mit AsciiDoctor und PlantUML ist die Dokumentation geschrieben.

### Preview von PlantUML-Dateien

Durch das Tastaturkürzel `<Alt>d`. Dazu ist eine Internet-Verbindung notwendig.
Beispiele für PlantUML und AsciiDoctor sind im Unterverzeichnis `doc`.

### Einstellungen für Preview von AsciiDoctor-Dateien

Zunächst müssen einmalig die Einstellungen (_Settings_) von VS Code geändert
werden. Dazu geht man über zum Menüpunkt _Datei > Einstellungen > Einstellungen_
und gibt im Suchfeld _Asciidoc_ ein. Nun klickt man im Abschnitt
_Asciidoc > Preview: Attributes_ auf den Link _In "settings.json" bearbeiten_.
Jetzt ergänzt man in der JSON-Datei folgenden Eintrag:

```JSON
  "asciidoc.preview.attributes": {
    "plantuml-server-url": "http://plantuml.com/plantuml"
  }
```

Wenn man zum ersten Mal eine `.adoc`-Datei im Editor öffnet, muss man noch
die Verbindung zum PlantUML-Server zulassen, damit die eingebundenen
`.puml`-Dateien in `.svg`-Dateien konvertiert werden. Dazu gibt man zunächst
das Tastaturkürzel `<Strg><Shift>p` ein und schickt im Eingabefeld das
Kommando _AsciiDoc: Change Preview Security Settings_ durch `<Enter>` ab.
Danach wählt man den Unterpunkt _Allow insecure content_ aus.

### Preview von AsciiDoctor-Dateien

Durch das Tastaturkürzel `<Strg><Shift>v`. Dazu ist eine Internet-Vrbindung
notwendig.

### Dokumentation im Format HTML

Die Dokumentation im Format HTML wird in einer Powershell folgendermaßen
im Verzeichnis `doc\html` erstellt:

```CMD
    npm run asciidoc
```

## Empfohlene Entwicklungsumgebung

### Visual Studio Code oder WebStorm

[Visual Studio Code](https://code.visualstudio.com/Download) kann man
kostenfrei herunterladen.

> Tipps:
>
> - `<Strg>kc` : Markierte Zeilen werden auskommentiert (wie bei Visual Studio)
> - `<Strg>ku` : Bei markierten Zeilen wird der Kommentar entfernt
> - `<Strg><Shift>p`: Die Kommandopalette erscheint
> - `<Strg><Shift>v`: Vorschau für MarkDown und AsciiDoctor
> - `<Alt>d`: Vorschau für PlantUml

Für WebStorm gibt es bei [JetBrains](http://jetbrains.com/student) auf
Initiative von Jürgen Zimmermann eine Studenten-Lizenz, die für 1 Jahr gültig
ist.

## Empfohlene Code-Konventionen

In Anlehnung an die [Guidelines von TypeScript](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)

- "Feature Filenames", z.B. buch.service.ts
- Klassennamen und Enums mit PascalCase,
- Attribute und Funktionen mit camelCase,
- private Properties _nicht_ mit vorangestelltem **\_**,
- Interfaces _nicht_ mit vorangestelltem **I**
- _Barrel_ für häufige Imports, z.B.
  - `shared\index.ts` erstellen:

```javascript
    export * from './bar';
    export * from './foo';
```

- einfaches Importieren:

```javascript
    import { Bar, Foo } from 'shared';
```

- [...].forEach() und [...].filter() statt for-Schleife
- Arrow-Functions statt function()
- undefined verwenden, nicht: null
- Geschweifte Klammern bei if-Anweisungen
- Maximale Dateigröße: 400 Zeilen
- Maximale Funktionsgröße: 75 Zeilen

### `JSON5.stringify()` statt `JSON.stringify()`

Wenn man bei der String-Ausgabe von JSON-Objekten oder -Arrays nicht die
puristische Ausgabe mit Anführungszeichen bei den Schlüsseln haben möchte,
dann kann man `JSON5.stringify()` statt `JSON.stringify()` verwenden:

```javascript
    import JSON5 from 'json5';
    ...
    JSON5.stringify(obj);
```

## Atlas

### Atlas von MongoDB

Atlas ist vom Unternehmen [MongoDB, Inc.](https://www.mongodb.com/cloud/atlas)
und bietet _Database as a Service_. Als zugrundeliegende Infrastruktur kann
zwischen _AWS_ (Amazon Web Services), _Microsoft Azure_ und
_GCP_ (= Google Cloud Platform) gewählt werden.

Atlas ist ursprünglich von Unternehmen _mLab_, das 2018 von MongoDB, Inc.
übernommen wurde.

### Registrierung bei Atlas

Zu Beginn muss man sich unter https://www.mongodb.com/cloud registrieren, indem
man zunächst den Button _Sign In_ und danach den Link _Register_ anklickt.
Nun kann man das Registrierungsformular mit Emailadresse (als künftiger
_Username_), Passwort und "Company Name" (als zukünftige _Organization_)
ausfüllen und abschicken.

### Einloggen

Unter https://cloud.mongodb.com/user kann man sich jetzt mit der
mit der _Emailadresse_ als _Username_ einloggen.

### Projekt erstellen

Nachdem man sich eingeloggt hat, erstellt man ein Projekt, indem der Button
_New Project_ angeklickt wird. Für das Projekt muss man einen Namen angeben.
Der Projektname ist nur für Verwaltungszwecke und hat keine Auswirkungen auf
die spätere "Connection URL" der DB.
Man kann auch weitere "Member" mit ihrer Emailadresse hinzufügen, was aber
nicht erforderlich ist.

Mit dem Button _Create Project_ wird das Projekt nun angelegt.

### Cluster erstellen

Nachdem das Projekt erstellt ist, wird ein Cluster angelegt, indem man auf den
Button _Build a Cluster_ klickt. Nun kann man durch den Button
_Create a Cluster_ unterhalb von "Starter Clusters" einen kostenlosen Cluster
anlegen.

Danach wählt man den "Provider", z.B. _aws_ (Amazon Web Services), und die
"Region", z.B. Frankfurt, aus. Durch den Button _Create Cluster_ wird der
kostenlose Cluster schließlich angelegt, was einige Minuten dauern kann.

### DB-Benutzer erstellen

Jetzt wählt man das Untermenü _SECURITY > Database Access_ aus, um einen
DB-Benutzer zu erstellen. Dort klickt man auf den Button _ADD NEW USER_.

Im Formular füllt man die beiden Felder für "Username" und "Password" aus.
Danach schickt man mit dem Button _Add User_ das Formular ab und wartet,
bis die Statusmeldung "We are deploying your changes" verschwunden ist.

### Zulässige IP-Adressen für die DB-Clients

Jetzt wählt man das Untermenü _SECURITY > Network Access_ aus, um zu
konfigurieren, welche IP-Adressen für die DB-Clients zulässig sein sollen
("Whitelist"). Dazu klickt man auf den Button _ADD IP ADDRESS_.
Bei "Whitelist Entry" kann man `0.0.0.0/0` eingeben, um den Zugriff von
allen IP-Adressen zuzulassen, d.h. "Access from anywhere".
Dies vereinfacht den Zugang von einer Cloud, wie z.B. _Heroku_ oder  _OpenShift_
sowie bei dynamischen IP-Adressen in einem öffentlichen WLAN.

Abschließend wird der Button _Confirm_ angeklickt.

### URL für künftige DB-Verbindungen

Jetzt wählt man das Untermenü _ATLAS > Clusters_ aus, um die URL
für künftige DB-Verbindungen zu erhalten. Dazu klickt man zunächst auf den
Button _Connect_ und dann auf den Menüpunkt _Connect Your Application_.
Nun kann man auf den Button _Copy_ klicken und hat die URL im "Copy Buffer",
so dass man die URL mit `<Strg>V` kopieren bzw. sichern kann. Die URL sieht
im Prinzip so aus:

```TXT
mongodb+srv://...:<password>@cluster0-?????.mongodb.net/test?retryWrites=true&w=majority
```

_CAVEAT_: Das eigene Passwort wird aus Sicherheitsgründen nicht angezeigt,
sondern der Platzhalter `<password>`. Diesen Platzhalter muss man natürlich
ersetzen, wenn man die URL im eigenen Appserver (als DB-Client) nutzt.

### Ausloggen bei Atlas

Rechts oben kann man sich über den Menüpunkt _Sign Out_ ausloggen.

### Datenbank _acme_ erstellen

Um nicht die DB `test` (s.o. in der URL) im künftigen Appserver zu benutzen,
erstellt man in einer Powershell mit der Mongo CLI eine eigene DB (z.B. `acme`)
mit einer leeren Collection (z.B. `Buch`):

```TXT
mongo "mongodb+srv://<<MEINE_KENNUNG>>:<<MEIN_PASSWORT_>>@cluster0-....mongodb.net/test?replicaSet=Cluster0-shard-0&w=majority&ssl=true"
  use acme
  db.createCollection('Buch')
  exit
```

In der DB-URL kann `retryWrites=true` weggelassen werden (s.o.), weil es der
Default-Wert ist.

## Heroku

### Heroku von Salesforce

_Heroku_ ist eine Cloud-Plattform und funktioniert als PaaS
(= Plattform as a Service), so dass man eine Programmier- und Laufzeitumgebung
in der Cloud hat: https://www.heroku.com/platform. Heroku wird seit 2007
entwickelt und wurde 2010 vom CRM-Anbieter
[Salesforce](https://www.salesforce.com/de/products/platform/products/heroku/)
übernommen.

Mit Heroku lassen sich Anwendungen für z.B. _Node_ oder _Java_ entwickeln.
Als Datenbank kann man z.B. _PostgreSQL_ oder _MongoDB_ verwenden.
Das Deployment erfolgt auf der Basis von _Git_ (s.u.).

### dyno, slug und buildpack

Heroku-Anwendungen laufen in mehreren leichtgewichtigen _Linux-Containern_, die
_dyno_ heißen. Bekannte Linux-Container sind z.B. [_LXC_](https://linuxcontainers.org)
und vor allem [libcontainer](https://github.com/docker/libcontainer) von _Docker_.
Ein _Web dyno_ wird in der Datei `Procfile` mit dem Prozess-Typ _web_ deklariert,
Nur Web dynos können HTTP-Requests empfangen und -Responses senden.

Nachdem die eigene Anwendung gepackt und komprimiert ist, wird sie als _slug_
bezeichnet. Ein _slug_ kann danach in einem _dyno_ ausgeführt werden.
Die maximale Größe für ein _slug_ beträgt 500 MB.

Mit Hilfe von einem _buildpack_ wird die eigene Anwendung zu einem _slug_
transformiert. Dazu benötigt Heroku diverse Skripte, die von der jeweiligen
Programmiersprache, z.B. JavaScript oder Java, abhängen. Mit diesen Skripten
wird z.B. die Fremdsoftware (_dependencies_) geladen, die man innerhalb der
eigenen Anwendung nutzt, und es wird ggf. der Compiler aufgerufen.

Wenn es im Wurzelverzeichnis eine Datei `package.json` gibt, verwendet Heroku
das _Node.js buildpack_ und ergänzt seine Umgebungsvariable `PATH` um die Pfade
für `node`, `npm` und `node_modules/.bin`.

### Registrierung bei Heroku

Zu Beginn muss man sich bei https://signup.heroku.com registrieren, indem man
das Formular ausfüllt, mit dem Button _CREATE FREE ACCOUNT_ abschickt und
abschließend den Link in der Bestätigungsemail anklickt.

### Einmalig: Git-Repository erstellen

In VS Code sind folgende Einstellungen empfehlenswert, nachdem man das Beispielprojekt
in VS Code geöffnet hat, indem man VS Code startet und über _Datei_ und den Unterpunkt
_Ordner öffnen_ das Verzeichnis mit dem Beispielprojekt geöffnet hat. Jetzt kann
man über _Datei_, den Unterpunkt _Einstellungen_ und nochmals _Einstellungen_ im
Eingabefeld `Git` eingeben. Nun sieht man die Konfigurationsmöglichkeiten für Git
und setzt die Haken bei `Git: Enable Smart Commit` und bei `Git: Suggest Smart Commit`.

Jetzt klickt man auf das Icon _Quellcodeverwaltung_ am linken Rand und anschließend
auf den Button `Repository initialisieren`.

Man bleibt in der _Quellcodeverwaltung_ und sieht nun viele Dateien markiert mit
`U` (ncommitted). Im Eingabefeld steht der Hinweis _Nachricht_, wo man z.B.
`Initiale` Version eingibt und dann auf den Haken (Tooltipp: _Commit_) klickt.

### Einloggen und Token erstellen mit der Heroku CLI

Mit dem Tastaturkürzel `<Strg><Shift>P` öffnet man die Kommando*P*alette.
Dort gibt man `heroku login` ein und über das nun geöffnete Powershell-Terminal
wird der Webbrowser mit der Login-URL für Heroku gestartet, so dass man sich
dort einloggen kann, wozu man die Emailadresse und das Passwort von der
zuvor erfolgten Registrierung verwendet.

Nach dem erfolgreichen Einloggen gibt es zur Verwaltung das Verzeichnis
`C:\Users\<MEINE_KENNUNG>\AppData\Local\heroku`.

### Leere Anwendung für Heroku erstellen

In der Kommandopalette durch `<Strg><Shift>P` gibt man `heroku create` ein.
Die Ausgabe im Powershell-Terminal sieht dann prinzipiell folgendermaßen aus:

```TEXT
https://gener-iert-12345.herokuapp.com/ | https://git.heroku.com/gener-iert-12345-53594.git
```

Jetzt gibt es also eine generierte Domain für die eigene Anwendung, die künftig
über z.B. https://gener-iert-12345.herokuapp.com/ erreichbar sein wird.

Die ausgegebene URL nimmt man, um in _package.json_ innerhalb von `"scripts": {`
die dortige URL `https://gener-iert-12345.herokuapp.com/` bei den Skripten
`curl:heroku` und `open:heroku` zu überschreiben.

### Umgebungsvariable für Heroku

Mit der Kommandopalette durch `<Strg><Shift>P` gibt man `heroku config:set` und
anschließend prinzipiell `DB_HOST=cluster0-?????.mongodb.net`, wobei die ?
gemäß der obigen Atlas-Konfiguration ersetzt werden müssen. Dabei kann man im
Powershell-Terminal die Interaktion mit Heroku verfolgen.

Das wiederholt man dann noch für die Umgebungsvariable mit den passenden
Werten für Benutzername und Passwort aus der Atlas-Konfiguration:

- DB_USER=?????
- DB_PASS=?????
- DB_POPULATE=true

### Deployment für Heroku

Für das erstmalige Deployment und nach künftigen Codeänderungen gibt man
in der Kommandopalette (durch `<Strg><Shift>P`) das Kommando
`git push heroku master` ein. Durch diese Push-Operation von Git wird in Heroku
ein _slug_ erstellt. Dabei wird die Anwendung gepackt und komprimiert, so dass
sie einschließend in einem _dyno_ (leichtgewichtiger Linux-Container) ablaufen
kann. Im PowerShell-Terminal kann man dabei den Ablauf mitverfolgen.

Nur die in Git versionierten Dateien werden für das Deployment verwendet,
weshalb nur die TypeScript-Dateien zu Heroku hochgeladen werden, die dann dort
zu lauffähigen JavaScript-Dateien übersetzt werden müssen. Dazu gibt es das
npm-Skript `heroku-postbuild`, das innerhalb von Heroku aufgerufen wird und
nicht manuell aufgerufen werden muss.

Wer _husky_ kennt und zusammen mit Git verwenden möchte, muss es noch
konfigurieren. Z.Zt. ist _husky_ nur in `package.json` eingetragen, weshalb
man beim Deployment einen vernachlässigbaren Fehler erhält.

Nach einem erfolgreichen Deployment sollte man (als Student/in) die
Heroku-Anwendung durch das Kommando `heroku ps:scale web=1` so skalieren, dass
sie nur _1_ Web dyno nutzt. Analog kann man durch `heroku ps:scale web=0` die
eigene Anwendung deaktieren.

Durch das Kommando `heroku buildpacks` kann man sich auflisten lassen, welche
buildpacks beim Erstellen von einem slug verwendet werden.

### Status-Informationen zu Heroku

Mit `heroku ps` kann man sich anzeigen lassen, wieviele freie "Dyno-Stunden"
man im aktuellen Monat noch hat und wieviele bereits verbraucht sind.
Persönliche Accounts verfügen monatlich über 550 freie "Dyno-Stunden":
https://devcenter.heroku.com/articles/free-dyno-hours.

### Verfügbarkeit der eigenen Heroku-Anwendung

Nach dem Deployment ist die eigene Anwendung verfügbar und kann benutzt
werden. Beispielsweise kann man in einer eigenen Powershell das Kommando
`npm run curl:heroku` aufrufen. Dabei wird mit `curl` auf die URL
`https://gener-iert-12345.herokuapp.com/buecher/00000000-0000-0000-0000-000000000001`
zugegriffen.

Alternative kann man auch `npm run open:heroku` aufrufen, dann wird der Response
in einem Webbrowser angezeigt.

### Heroku-Console

Mit der Kommandopalette durch `<Strg><Shift>P` kann man `heroku logs --tail`
eingeben und die Logging-Ausgaben auf der Heroku-Console mitverfolgen, ähnlich
wie bei Linux mit `tail -f`.

### Dashboard für die Verwaltung der eigenen Heroku-Anwendung(en)

Unter https://dashboard.heroku.com kann man die eigene Anwendung verwalten.

Wenn man dort die eigene Anwendung selektiert bzw. anklickt, kann man z.B. über
den Karteireiter _Settings_ eine Anwendung vom Netz nehmen, indem man den
_Maintenance Mode_ einschaltet (am Seitenende). Auch kann man dort die
Anwendung ggf. löschen.

### Sonstige Heroku-Kommandos

Mit `heroku run ...` kann man ein einzelnes Kommando als REPL
(= Read-eval-print loop) laufen lassen. So zeigt z.B. das Kommando
`heroku run --app gener-iert-12345 node --version` an, welche Node-Version für
die Heroku-Anwendung verwendet wird.
Oder mit `heroku run  --app gener-iert-12345 printenv` kann man sich die
Umgebungsvariable für die Heroku-Anwendung anzeigen lassen.

Mit `heroku addons` kann man sich zusätzlich installierte Add-ons anzeigen
lassen. Beispielsweise könnte man das Add-on _mLab MongoDB_ statt _Atlas_
verwenden.

## Debugging mit Visual Studio Code

- Das _Debug Icon_ in der _Activity Bar_ anklicken
- Den Tab _Terminal_ auswählen, dort in das Projektverzeichnis wechseln und
  dann `nodemon` als (Remote) Server starten:

```cmd
    cd <Projektverzeichnis>
    nodemon -V
```

`nodemon` ruft dann die JS-Datei auf, die in `package.json` bei der Property
_main_ steht, d.h. `dist\index.js`, d.h. die Übersetzung durch TypeScript muss
vorher manuell durchgeführt werden.

Nun kann man Breakpoints setzen, indem man bei einer geöffneten .ts-Datei links
von der Zeilennummer klickt. Beim Übersetzen hat nämlich der TypeScript-Compiler
Dateien für das _Source Mapping_ generiert.

Jetzt muss man nur noch links oben bei "Debugging starten" auf den linken grünen
Button klicken (siehe auch .vscode\launch.json).

_Am Ende nicht vergessen, im Terminal den Server mit `<Strg>C` zu beenden!_

[Dokumentation zum Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
