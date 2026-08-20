# Prima di iniziare

Questo gestionale tiene insieme tutto il lavoro dell'acquedotto: le anagrafiche dei
soci e dei clienti, i contatori installati negli edifici, le letture dei consumi, le
fatture che ne derivano e gli incassi.

Il programma funziona **dentro il browser**: non c'e nulla da installare sul computer.
Basta una connessione a internet e uno fra Chrome, Edge, Firefox o Safari aggiornati.
Funziona anche da telefono e da tablet: le tabelle diventano schede leggibili sullo
schermo piccolo.

## L'indirizzo

Il gestionale si apre a questo indirizzo:

```
https://acquedotto-cortina-client.netlify.app
```

Conviene salvarlo fra i preferiti del browser.

## Chi puo fare cosa

Esistono due tipi di accesso.

| Tipo | Chi lo usa | Cosa vede |
|------|------------|-----------|
| Amministratore | Proprietario, segreteria | Tutto il gestionale |
| Cliente | I clienti dell'acquedotto | Solo i propri dati: contatori, letture, fatture |

Gli accessi dei clienti si creano dalla scheda del singolo cliente, come spiegato piu
avanti. Il cliente non puo modificare nulla: puo solo consultare e scaricare le proprie
fatture.

> **Nota.** I dati sono conservati online e restano disponibili da qualunque
> postazione. Non serve fare copie sul proprio computer.

---

# Entrare e uscire

## Accedere

All'apertura compare la schermata di accesso: si inseriscono nome utente e password e
si preme **Accedi**.

In alto a destra c'e un piccolo indicatore con la scritta **API**: quando il pallino e
verde il gestionale sta comunicando correttamente con il server. Se e rosso, vedere il
capitolo *Se qualcosa non funziona*.

## La sessione scade

Per sicurezza l'accesso resta valido **otto ore**. Dopo, il gestionale riporta alla
schermata di accesso spiegando che la sessione e scaduta: basta rientrare con le stesse
credenziali. Il lavoro gia salvato non si perde mai, perche ogni modifica viene
registrata nel momento in cui si preme il pulsante di salvataggio.

## Uscire

In fondo al menu a sinistra c'e **Logout**. Conviene usarlo quando si lascia un computer
condiviso.

## Cambiare la propria password

Dal menu, voce **Admin**, si aprono i dati del proprio accesso: si possono cambiare nome
utente, email, numero di telefono e password.

---

# Come e fatto il gestionale

## Il menu

Il menu a sinistra e diviso in due parti, separate da una linea.

- **La parte alta e il lavoro di tutti i giorni:** Clienti, Contatori, Edifici, Letture,
  Fatture, Scadenze.
- **La parte bassa riguarda le tariffe:** Articoli, Listini, Fasce. Sono le voci che si
  toccano una o due volte l'anno, quando cambiano i prezzi.

Su telefono il menu si apre con il pulsante a tre righe in alto a destra.

## La panoramica

La prima schermata, **Panoramica**, e il punto di partenza della giornata. In alto
mostra tre numeri, e ognuno e cliccabile e porta direttamente all'elenco corrispondente:

- **Da incassare** — quanto denaro e ancora da riscuotere e su quante scadenze;
- **Letture da fatturare** — quante letture aspettano di diventare fattura;
- **Fatture in bozza** — quante fatture sono state create ma non ancora confermate.

Sotto ci sono tre riquadri:

- **Anzianita del credito scaduto**, che mostra da quanto tempo aspettano i soldi non
  ancora incassati, diviso in quattro fasce. Piu la barra e scura, piu il credito e
  vecchio e difficile da recuperare.
- **Da sollecitare**, con i cinque crediti scaduti piu grossi: sono le telefonate da
  fare per prime. Ogni riga porta alla scheda del cliente.
- **Ultime modifiche**, che mostra chi ha cambiato cosa e quando.

## Gli elenchi

Tutte le voci del menu funzionano allo stesso modo.

**I filtri** sono i pulsanti arrotondati sopra l'elenco: scelgono cosa vedere. Per
esempio, in Scadenze si puo scegliere fra *Scadute*, *Da incassare*, *In arrivo* e
*Saldate*. Il filtro attivo e evidenziato; **Tutte** toglie il filtro.

**La ricerca** e la casella accanto: si scrive una parola e si preme il pulsante di
ricerca. Cerca in tutti i campi della scheda, quindi funziona con un cognome, un
indirizzo, un numero di matricola.

**L'ordinamento** si cambia cliccando sull'intestazione di una colonna. Un secondo clic
inverte l'ordine.

**Le pagine** si scorrono con i pulsanti in fondo all'elenco.

> **Suggerimento.** L'indirizzo nella barra del browser tiene conto di filtro, pagina e
> ordinamento. Si puo quindi salvare fra i preferiti una vista usata spesso, per esempio
> le scadenze scadute, e ritrovarla con un clic.

**Apri** entra nella scheda del record. **Elimina** lo cancella, sempre chiedendo
conferma. **Nuovo** crea una scheda vuota.

## Le schede

La scheda mostra tutti i dati di un record e, sotto, i collegamenti alle schede
correlate: dal cliente si arriva ai suoi contatori e alle sue fatture, dal contatore alle
sue letture, e cosi via.

Il pulsante in fondo riporta indietro e ricorda da dove si e arrivati: se si e aperta la
scheda di un contatore partendo da un cliente, dira *Torna alla scheda cliente*.

## Le note e gli allegati

Le schede che hanno un campo **Note** permettono anche di allegare file: fotografie di un
contatore, un documento firmato, un foglio di calcolo. Si accettano immagini, PDF, file
di testo, Word, Excel e OpenDocument, fino a 6 MB ciascuno. Gli allegati restano legati
alla scheda e sono scaricabili da chiunque abbia accesso.

---

# Clienti

La voce **Clienti** contiene l'anagrafica: dati personali, indirizzi di residenza e di
fatturazione, recapiti, codice fiscale e partita IVA, modalita di pagamento, IBAN.

## Filtri utili

- **Soci** — i clienti che sono anche soci della cooperativa.
- **Con email** — utile prima di un invio di comunicazioni.
- **Fattura elettronica** — chi riceve la fattura in formato elettronico.

## Creare un cliente

Si preme **Nuovo** e si compilano i campi. Per una persona fisica si usano *Cognome* e
*Nome*; per una societa si compila *Ragione sociale*, che ha la precedenza ovunque
compaia il nome del cliente.

Sono importanti anche:

- **Destinazione e indirizzo di fatturazione**, se la fattura va spedita a un indirizzo
  diverso dalla residenza;
- **Pagamento** e **IBAN**, se il cliente paga con addebito;
- **Email**, indispensabile per dargli accesso all'area riservata.

## Dare a un cliente l'accesso all'area riservata

Nella scheda del cliente c'e il riquadro **Accesso portale**. Si inseriscono un nome
utente e una password provvisoria di almeno otto caratteri, e l'accesso e creato. Il
cliente potra cambiare la password da solo dopo il primo ingresso.

Dallo stesso riquadro si puo in seguito **disattivare** l'accesso, senza cancellare
nulla: il cliente non potra piu entrare, ma i suoi dati restano.

## Vedere quanto c'e da fatturare per un cliente

Sempre nella scheda, il riquadro **Calcolo fattura** mostra le letture del cliente non
ancora fatturate e quanto verrebbe la fattura. Da li si puo generare direttamente la
bozza per quel singolo cliente.

---

# Contatori ed edifici

## Contatori

Ogni contatore e collegato a tre cose: il **cliente** che lo usa, l'**edificio** dove si
trova e il **listino** con cui si calcolano i suoi consumi.

> **Attenzione.** Un contatore senza listino non puo essere fatturato: al momento della
> generazione il gestionale si ferma e lo segnala. Conviene verificarlo appena si
> inserisce un contatore nuovo.

I filtri disponibili sono *Attivi*, *Inattivi* e *Condominiali*.

Il campo **Quota riparto (%)** riguarda solo i contatori condominiali: indica la
percentuale di consumo attribuita a quella utenza. Sui contatori normali si lascia
vuoto.

## Edifici

Gli edifici raccolgono i dati dell'immobile: indirizzo, localita, dati catastali, numero
di unita abitative, posti letto.

Se l'edificio ha latitudine e longitudine, compare sulla **mappa** in cima all'elenco.
Cliccando un segnaposto sulla mappa la riga corrispondente viene evidenziata
nell'elenco, e viceversa.

---

# Letture

Le letture sono il punto di partenza della fatturazione: senza letture non ci sono
fatture.

> **Da leggere con attenzione.** Nel campo **Lettura contatore** va scritto il **numero
> che si legge sul quadrante**, cioe il totale progressivo, **non** il consumo del
> periodo. Il consumo da fatturare lo calcola il gestionale come differenza rispetto
> alla lettura precedente dello stesso contatore. Se si inserisse il consumo al posto
> dell'indice, la fattura risulterebbe sbagliata.

## Inserire una lettura

Si preme **Nuovo** dall'elenco Letture, oppure si parte dalla scheda del contatore, che
e piu sicuro perche il contatore risulta gia collegato. Si compilano:

- **Data lettura** — il giorno del rilevamento;
- **Lettura contatore** — il numero letto sul quadrante;
- **Unita di misura** — normalmente `m3`;
- **Tipo** e **Note** — facoltativi, utili per annotare letture stimate o anomalie.

## Filtri

- **Da fatturare** — le letture che entreranno nella prossima fatturazione;
- **Fatturate** — quelle gia diventate fattura.

Una lettura risulta *fatturata* automaticamente quando viene inclusa in una fattura.
Se quella fattura viene cancellata, la lettura torna disponibile.

---

# Fatturare

E l'operazione piu importante, e conviene farla nell'ordine descritto qui.

## 1. Controllare cosa e pronto

Dal menu **Fatture** si apre **Genera da letture**, oppure si clicca il riquadro
*Letture da fatturare* nella panoramica.

La pagina raggruppa **per cliente** tutte le letture non ancora fatturate e mostra per
ciascuno l'imponibile, l'IVA e il totale previsto. In cima si vedono i totali generali e
il numero di anomalie.

## 2. Decidere la quota fissa

L'interruttore **Quota fissa annuale** decide se includere la quota fissa nelle fatture
che si stanno per generare. Il gestionale sa gia quali contatori l'hanno gia pagata
nell'anno in corso e non la applica due volte.

## 3. Generare

Ci sono due modi.

**Un cliente alla volta:** il pulsante *Genera bozza* nel riquadro del cliente. Alla fine
il gestionale apre direttamente la fattura creata.

**Molti clienti insieme:** si spuntano le caselle *Seleziona* dei clienti desiderati,
oppure si usa *Seleziona tutti* in cima, e si preme **Genera N bozze**. Il gestionale
procede un cliente alla volta mostrando l'avanzamento, e si puo **interrompere** in
qualsiasi momento: le fatture gia create restano.

Alla fine compare un riepilogo con quante bozze sono state create e, soprattutto,
**l'elenco dei clienti non fatturati con il motivo**. Un cliente che fallisce non blocca
gli altri.

## 4. Se un cliente da errore

I motivi piu comuni sono:

| Messaggio | Cosa significa | Cosa fare |
|-----------|----------------|-----------|
| Il listino non ha fasce consumo valide per questa data | Il listino del contatore non ha tariffe valide al giorno della lettura | Aggiungere o correggere le fasce del listino |
| Il listino copre X mc su Y mc | Le fasce non coprono tutto il consumo | Estendere la fascia piu alta |
| Articolo ACQUA mancante | Manca una voce obbligatoria del catalogo articoli | Contattare l'assistenza |
| La lettura deve avere un contatore con listino associato | Il contatore non ha un listino | Aprire il contatore e assegnarlo |
| Questa lettura usa un riparto condominiale | Va calcolata sul contatore condominiale | Trattare la lettura manualmente |

Le fatture generate nascono sempre come **bozza**: nulla e definitivo finche non si
conferma.

---

# Fatture

## Bozza e confermata

Una fattura nasce **bozza**: si puo correggere e cancellare liberamente. Quando i dati
sono giusti la si **conferma**, e da quel momento e un documento emesso.

Una fattura confermata resta protetta: modificarla o cancellarla richiede una
**conferma esplicita**, e il gestionale registra chi lo ha fatto e quando. Serve per
correggere un errore, non per la modifica ordinaria.

I filtri dell'elenco sono *Bozze*, *Confermate* e *Senza scadenza*.

## La numerazione

Le fatture emesse da questo gestionale hanno un numero progressivo che riparte da 1 ogni
anno, e un codice nella forma `2026/A/1`: anno, serie, numero. Le fatture importate dal
vecchio programma mantengono la numerazione di allora e non si mescolano con le nuove.

## Il PDF

Dalla scheda della fattura il pulsante apposito genera il **PDF** pronto da stampare o
inviare, con i dati della cooperativa, gli estremi bancari e il dettaglio delle righe.

## Verificare che i conti tornino

Nella scheda della fattura, il riquadro **Calcolo fattura** confronta le righe salvate
con quello che il listino attuale produrrebbe oggi e segnala le differenze. Da qui si
puo anche aggiungere la quota fissa se manca ed e dovuta.

Il riquadro **Storico modifiche** elenca ogni intervento sulla fattura, con l'autore.

## Cancellare una fattura

Cancellando una fattura il gestionale rimuove anche le sue righe e la scadenza
collegata, e **rimette le letture fra quelle da fatturare**. E l'operazione da usare
quando una bozza e sbagliata: si cancella e si rigenera.

---

# Scadenze e incassi

Ogni fattura genera una **scadenza**: e li che si tiene traccia dei pagamenti.

I filtri sono:

- **Scadute** — la data e passata e non risultano pagate. E l'elenco da cui partire.
- **Da incassare** — tutte le non pagate, comprese quelle non ancora scadute.
- **In arrivo** — non ancora scadute.
- **Saldate** — gia incassate.

## Registrare un pagamento

Si apre la scadenza, si spunta **Saldo** e si inserisce la **Data pagamento**. Il ritardo
smette di crescere e si ferma ai giorni effettivi.

## Il ritardo

Il campo **Ritardo** e calcolato dal gestionale e non si modifica a mano: per le
scadenze non pagate cresce ogni giorno, per quelle pagate resta fermo ai giorni fra
scadenza e pagamento.

Il campo **Solleciti** serve ad annotare quanti avvisi sono gia stati mandati.

---

# Tariffe

Sono le tre voci in fondo al menu. Si toccano di rado, ma determinano quanto pagano
tutti i clienti.

## Articoli

Il catalogo delle voci fiscali, ognuna con la propria aliquota IVA. Alcuni codici sono
**obbligatori** perche il calcolo li usa: `ACQUA` e `ACQUAF` per i consumi e la quota
fissa, `COND` e `CONDF` per i contatori condominiali, `GG_DELAY` per la mora.

> **Attenzione.** Non cancellare ne rinominare questi codici: senza di loro la
> generazione delle fatture si ferma.

## Listini

Un listino e un piano tariffario, per esempio *domestico residente* o *societa*. Non
contiene prezzi: raccoglie le fasce. Ogni contatore e collegato a un listino.

## Fasce

Le fasce sono gli scaglioni di consumo con il relativo prezzo. Ogni fascia ha un minimo,
un massimo, un prezzo e un periodo di validita.

Gli estremi sono **inclusivi** e le fasce devono essere **contigue**: se una arriva a
100, la successiva parte da 101. Un buco fra le fasce fa fallire la fatturazione con il
messaggio *il listino copre X mc su Y mc*.

Le fasce il cui tipo contiene la parola *fisso* sono la **quota fissa**: valgono una
volta l'anno per contatore, a prescindere dal consumo.

## Cambiare un prezzo

Il modo corretto per aumentare una tariffa da una certa data **non** e modificare la
fascia esistente, ma:

1. mettere una **data di scadenza** alla fascia in vigore, per esempio il 31 dicembre;
2. creare una **nuova fascia** con gli stessi estremi, il prezzo nuovo e la validita che
   inizia il giorno dopo.

Cosi le fatture vecchie restano ricalcolabili con le tariffe di allora, e le nuove usano
il prezzo aggiornato.

> **Ogni modifica alle tariffe viene registrata.** Il gestionale conserva chi ha
> cambiato cosa, il valore precedente e quello nuovo. Le modifiche compaiono anche nel
> riquadro *Ultime modifiche* della panoramica.

---

# L'area riservata ai clienti

Il cliente che ha ricevuto un accesso entra dallo stesso indirizzo, con le proprie
credenziali, e vede una schermata sola con:

- i propri dati anagrafici e i recapiti;
- i propri contatori;
- le proprie letture piu recenti;
- le proprie fatture, con l'importo ancora da pagare in evidenza e il **PDF scaricabile**.

Il cliente non puo modificare nulla e non vede in alcun modo i dati degli altri clienti.

---

# Controlli consigliati

## Ogni volta che si fattura

Dopo aver generato le bozze, aprire **Fatture** e usare **Controlli**: il gestionale
elenca le fatture con anomalie, per esempio un totale che non corrisponde alle righe, una
quota fissa dovuta e mancante o un cliente non collegato.

## Una volta al mese

Aprire la panoramica e guardare l'**anzianita del credito**. Se la fascia *oltre un anno*
cresce, e il momento di intervenire sui solleciti.

## Prima di una fatturazione importante

Controllare che i listini abbiano fasce valide per l'anno in corso: e la causa piu
frequente di generazioni fallite.

---

# Se qualcosa non funziona

**Il pallino API e rosso, oppure gli elenchi non si caricano.**
Il gestionale non sta raggiungendo il server. Il servizio potrebbe essere in fase di
riavvio: attendere un minuto e ricaricare la pagina. Se il problema resta, contattare
l'assistenza.

**Mi chiede di accedere di nuovo.**
La sessione dura otto ore, poi scade. E normale: basta rientrare.

**Un elenco sembra vuoto.**
Molto probabilmente e attivo un filtro o una ricerca. Il gestionale lo dice sotto
l'elenco, per esempio *Nessun record nella vista "scadute"*: premere **Tutte** o
svuotare la casella di ricerca.

**Non riesco a modificare una fattura.**
E confermata. Si puo comunque intervenire: il gestionale chiede una conferma esplicita e
registra l'operazione.

**Ho cancellato per sbaglio una fattura.**
Le letture collegate sono tornate disponibili, quindi si puo rigenerare la fattura dalla
pagina di generazione. Il numero, pero, non viene riusato: la nuova fattura avra il
numero successivo.

**Il totale di una fattura non torna.**
Aprire la fattura e guardare il riquadro *Calcolo fattura*: confronta le righe salvate
con quelle che il listino produrrebbe oggi e indica dove sta la differenza.

---

# Assistenza e aggiornamenti

## Per il passaggio dal vecchio sistema

> **Importante.** Il travaso dei dati dal gestionale precedente a questo — anagrafiche,
> contatori, letture, storico delle fatture — **non va eseguito da soli**. E
> un'operazione delicata: un import ripetuto puo duplicare i dati o rendere fatturabili
> consumi gia fatturati.
>
> **Per qualunque aggiornamento o migrazione dal sistema attuale verso quello nuovo,
> contattare Nicola Zandegiacomo, che se ne occupa direttamente.**

## Per tutto il resto

Per malfunzionamenti, richieste di modifica, nuovi accessi o dubbi sull'uso, il
riferimento e sempre lo stesso.

Quando si segnala un problema, aiuta molto indicare:

- cosa si stava facendo e su quale schermata;
- il messaggio comparso, copiato o fotografato;
- il cliente, la fattura o la lettura interessati, con anno e numero.

## Questo manuale

Il manuale viene generato da un unico file di testo conservato insieme al programma. Per
aggiornarlo si modifica quel file e si rigenera il PDF: impaginazione, copertina e data
si aggiornano da sole. Le istruzioni tecniche sono nel file `docs/manuale/README.md`.
