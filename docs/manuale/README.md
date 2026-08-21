# Manuale utente

Il manuale destinato a chi usa il gestionale (proprietario, segreteria) vive qui.

| File | Cos'e |
|------|-------|
| `manuale.md` | **il testo**: e l'unico file da modificare per aggiornare il manuale |
| `stile.css` | impaginazione per la stampa su A4 |
| `immagini/` | le schermate riprese dall'interfaccia |
| `manuale-utente.pdf` | il PDF generato, quello da consegnare |

## Aggiornare il manuale

1. Modificare `manuale.md` con un qualunque editor di testo.
2. Rigenerare il PDF:

```bash
npm run manuale
```

Copertina, impaginazione e data di aggiornamento sono automatiche: la data che compare
in copertina e quella del giorno in cui si rigenera il file.

## Le schermate

Si inseriscono come immagini Markdown, con una riga in corsivo sotto che fa da
didascalia:

```text
![Testo alternativo](immagini/panoramica.png)

*Didascalia che spiega cosa guardare nella schermata.*
```

Le immagini vengono **incorporate** nel PDF, non collegate: il file si puo
spostare o inviare senza portarsi dietro la cartella.

Per rifarle basta aprire il gestionale e catturare la finestra del browser a una
larghezza di circa 1280 pixel, salvando il PNG in `immagini/`.

## Ortografia

Il manuale e destinato a chi usa il gestionale: gli accenti vanno scritti
correttamente (e, puo, gia, piu, perche, cosi, attivita, localita, unita).
Nel codice sorgente vale invece la convenzione opposta, senza accenti.

## Come si scrive il testo

Il formato e Markdown, che si legge anche cosi com'e.

| Per ottenere | Si scrive |
|--------------|-----------|
| Un capitolo (inizia su una pagina nuova) | `# Titolo` |
| Un paragrafo del capitolo | `## Titolo` |
| Un sotto-paragrafo | `### Titolo` |
| Testo in grassetto | `**testo**` |
| Un elenco puntato | righe che iniziano con `- ` |
| Un riquadro di avviso | `> **Attenzione.** testo` |
| Un blocco a larghezza fissa (indirizzi, comandi) | tre backtick prima e dopo |

Le tabelle si scrivono con le barre verticali:

```text
| Colonna | Altra colonna |
|---------|---------------|
| valore  | valore        |
```

## Requisiti

La generazione usa un browser gia installato sul sistema per la stampa in PDF. Vengono
cercati in ordine Chromium e Google Chrome nei percorsi consueti; se il browser e
altrove, si indica il percorso:

```bash
CHROME_BIN=/percorso/al/browser npm run manuale
```

Il comando controlla che il PDF prodotto abbia un numero ragionevole di pagine: un
browser installato in modo isolato (snap, flatpak) potrebbe non riuscire a leggere il
sorgente e produrre un PDF con dentro un messaggio di errore. In quel caso il comando si
ferma con una spiegazione invece di consegnare un manuale vuoto.
