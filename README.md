# Kviz – Ispit općeg znanja FBiH (demo)

Kviz za učenje za Ispit općeg znanja (IOZ) Agencije za državnu službu FBiH.
Sadrži sva pitanja iz „Kataloga pitanja – Vodič za polaganje ispita općeg znanja“, raspoređena u šest oblasti, 42 pitanja iz primjera testa i 532 pitanja s ponuđenim odgovorima iz skripte „Pitanja 2025“ (ukupno 1.641).

## Pokretanje
Otvorite `index.html` duplim klikom. Ne treba ni internet ni instalacija.

## Izgled
Gore je meni s ekranima **Učenje** (postavke testa u 4 koraka i stalno vidljiv sažetak), **Pretraga** i **Simulacija ispita**, te polje za brzu pretragu (tipka `/`). Tokom testa desno je panel „Izvori i dokazi“, a slika stranice skripte se uvećava klikom. Interfejs prati svijetlu ili tamnu temu sistema.

**Na mobitelu** je pri dnu ekrana stalna traka: ← · **Dokazi (broj)** · Sljedeće. Dugme „Dokazi“ izvlači panel odozdo s izvorima: stranicom kataloga i stranicama skripti preko cijele širine. Dodir na stranicu je uvećava, a panel se zatvara povlačenjem prema dolje, dugmetom ✕ ili dodirom izvan panela. Prije odgovora panel upozorava da dokaz otkriva tačan odgovor i nudi „Prikaži dokaz“. U simulaciji ispita dokazi su dostupni tek u pregledu na kraju.

## Mogućnosti
- **Redom (od–do):** svako pitanje ima redni broj (#1–#1641; pitanja iz skripte su #1110–#1641). Unesite raspon, npr. 1–20. Na kraju testa dugme „Sljedeći raspon“ nastavlja dalje, a kviz pamti dokle ste stigli.
- **Nasumično:** zadani broj pitanja, nasumično iz odabranog raspona.
- **Simulacija ispita:** 42 nasumična pitanja, 60 minuta, prolaz sa 28 tačnih odgovora.
- **Prikaz odgovora:** odmah nakon svakog pitanja ili tek na kraju testa.
- **Pretraga:** upišite bilo koju riječ ili dio pitanja (kvačice i padeži nisu bitni). Za svako pronađeno pitanje dobijete tačan odgovor, oznake „Na webu: DA/NE“ i „U skripti: DA/NE“ i dokaze: stranicu u Katalogu Agencije (`web/Katalog pitanja ADS FBiH.pdf`) i/ili skriptu, stranicu i sliku stranice.
- **Izvor pitanja:** „Sve“ (sva pitanja), „Web“ (Katalog Agencije i primjer testa, #1–#1109) ili „Skripta“ (pitanja koja postoje u skriptama iz foldera `skripte/`). Kad je odgovor prikazan, ispod pitanja stoji dokaz iz skripte: dokument, stranica, pitanje i odgovor kako su napisani u skripti, link na PDF i slika stranice („Prikaži stranicu“).
- **Bez duplikata:** opcija u koraku 1 i dugme u pretrazi. Isto pitanje koje postoji u katalogu, primjeru testa i/ili skripti „Pitanja 2025“ prikazuje se samo jednom (ukupno 1.293 različita pitanja od 1.641). Prednost ima službeni primjer testa, zatim skripta (ponuđeni odgovori kao na ispitu), pa katalog. Izuzetak su pitanja kod kojih je skripta pogriješila, gdje se prikazuje tačna verzija. Grupe istih pitanja su ručno pregledane i nalaze se u `data/duplikati.js`. U pretrazi uz svako pitanje piše „Isto pitanje i kao: #…“.
- **Filter po oblastima**, miješanje redoslijeda odgovora, pregled svih odgovora s objašnjenjem, „Ponovi samo netačna“.
- **Status provjere:** uz svako pitanje stoji oznaka „✓ provjereno u izvoru“ ili „⚠ nije provjereno“. Opcija „Samo pitanja provjerena u izvoru“ ograničava kviz na provjerena pitanja.
- **Tastatura:** A, B, C (ili 1, 2, 3) bira odgovor, strelice ← i → prelaze na prethodno ili sljedeće pitanje.

## Napomena o odgovorima
Agencija objavljuje samo pitanja, bez ponuđenih i tačnih odgovora. Ponuđene i tačne odgovore sastavio je autor kviza prema propisima: Ustav BiH i FBiH, ZUP i ZUS FBiH, Zakon o državnoj službi FBiH, Zakon o radu FBiH, Pravilnik o kancelarijskom poslovanju FBiH, Zakon o Vijeću ministara BiH i drugi. Uz svako pitanje je naveden izvor.
Kviz služi samo za učenje. Odgovori mogu sadržavati greške ili zastarjele podatke, pa ih provjerite u važećim propisima.

### Provjera odgovora (septembar 2026.)
Odgovori su upoređeni s tekstovima propisa, član po član. **926 od 1.109 pitanja** je označeno kao „provjereno u izvoru“ (nakon usklađivanja sa skriptom u oktobru 2026. ukupno ih je 905), a **52 odgovora su ispravljena**.

| Oblast | Provjereno | Glavni izvori |
|---|---|---|
| 1. Ustavni sistem | 165 / 166 | Ustav BiH, Ustav FBiH, Ustav RS, Izborni zakon BiH, Statut BD, EKLJP |
| 2. Organizacija uprave | 146 / 184 | ZOOU FBiH, Zakon o Vladi FBiH, Zakon o federalnim ministarstvima, Zakon o principima lokalne samouprave FBiH, Zakon o VM BiH, Zakon o upravi BiH, Zakon o ministarstvima BiH, Etički kodeks (63/20), Statut i Zakon o Vladi BD |
| 3. Upravni postupak | 174 / 176 | ZUP FBiH (uklj. 61/22), ZUS FBiH, ZUP BiH, ZUS BiH, ZOUP RS, ZUS RS |
| 4. Radni odnosi | 187 / 202 | ZDS FBiH, ZOR FBiH (26/16, 89/18, 44/22), Zakon o namještenicima FBiH, ZDS BiH, Zakon o radu u institucijama BiH, Zakon o radu RS, Zakon o državnim službenicima RS, Zakon o PIO FBiH |
| 5. Kancelarijsko poslovanje | 153 / 162 | Pravilnik o kancelarijskom poslovanju u FBiH (96/19, 91/23) |
| 6. Evropske integracije | 64 / 177 | UEU i UFEU (EUR-Lex), pregledi historije EU i pristupanja BiH |
| Primjer testa | 37 / 42 | kao gore |

Pitanja označena sa „⚠ nije provjereno“ uglavnom se odnose na propise RS, Brčko distrikta, Zakon o plaćama FBiH i opća pitanja o EU, za koja izvorni tekst nije bio dostupan. Njih posebno provjerite.

### Pitanja iz skripte 2025 (oktobar 2026.)
Fajl `data/pitanja-7-skripta-2025.js` sadrži 532 pitanja iz skenirane skripte „Pitanja 2025“. Ponuđeni odgovori su onakvi kakvi se pojavljuju na ispitu, a duplikati su uklonjeni. Tačan je odgovor koji je u skripti podebljan. Tekst je dobiven OCR-om, pa su moguće sitne pravopisne greške.
Sva ova pitanja su označena „⚠ nije provjereno“. U objašnjenju svakog pitanja navedena je strana skripte i, gdje postoji, broj sličnog pitanja u kvizu. Kod 10 pitanja skripta i kviz daju različit tačan odgovor; ta pitanja u objašnjenju imaju oznaku „PAŽNJA“.

### Novi ponuđeni odgovori po uzoru na skriptu (oktobar 2026.)
Kod **795 pitanja iz kataloga** koja nemaju ponuđene odgovore iz skripte, netačni odgovori su napisani ponovo, po uzoru na skriptu „Pitanja 2025“. Sva tri odgovora su iste građe i slične dužine, a razlikuju se u jednom bitnom detalju (broj, rok, institucija, uslov). Ranije je tačan odgovor bio najduži u 73% tih pitanja, a sada u 50%, što je blizu skripte (47%) i službenog primjera testa (33%). Položaj tačnog odgovora je ravnomjerno raspoređen na A, B i C.
Tačni odgovori su zadržani po značenju. Kod 30 pitanja tačan odgovor je malo preformulisan ili skraćen. Kod 19 od njih, gdje je skraćenje veće, puni raniji tekst je dodan u objašnjenje („Potpun odgovor: …“). Oznaka provjere i izvor u objašnjenju su ostali isti.

### Ponuđeni odgovori usklađeni sa skriptom (oktobar 2026.)
Od svih skripti samo „Pitanja 2025“ ima ponuđene odgovore (a, b, c). Ostalih šest skripti (Ustav, Državna uprava, Upravni postupak, Radni odnosi, Kancelarijsko poslovanje, EU integracije) imaju samo kratke odgovore.
Kod **272 pitanja iz kataloga** (#1–#1067) koja postoje i u skripti „Pitanja 2025“, ponuđeni odgovori su zamijenjeni odgovorima iz skripte. Svaki par je ručno pregledan, a pitanja koja se samo naizgled poklapaju nisu mijenjana. Primjer testa (#1068–#1109) nije mijenjan jer je službeni.
- **234 pitanja**: tačan odgovor iz skripte znači isto što i raniji, pa je oznaka provjere ostala. U objašnjenju piše i strana skripte.
- **20 pitanja**: skripta nudi drugi skup odgovora, pa je tačan odgovor druga činjenica. Ta pitanja su označena „nije provjereno“, a u objašnjenju stoji raniji odgovor.
- **16 pitanja**: skripta i raniji odgovor u kvizu se ne slažu. Ta pitanja preuzimaju odgovor iz skripte, označena su „nije provjereno“, a u objašnjenju stoji „PAŽNJA“ i raniji odgovor.
- **2 pitanja** (#577 prekovremeni rad u RS, #985 zakonodavna inicijativa u EU): skripta je kao tačno označila pogrešan odgovor, pa je zadržan odgovor prema propisu, uz napomenu.

Kopija podataka prije ove izmjene: `.backup/data-prije-uskladjivanja-2026-10-28/`.

## Struktura
- `index.html`, `style.css`, `app.js`: aplikacija
- `data/izvori-skripte.js`: dokazi iz skripti (dokument, stranica, pitanje i odgovor u skripti) za svako pitanje, a ključ je tekst pitanja. Ako promijenite tekst pitanja u `data/`, promijenite ga i ovdje, inače se dokaz neće prikazati.
- `skripte/`: skenirane skripte (PDF), a `skripte/stranice/`: slika svake stranice (JPG)
- `data/*.js`: pitanja po oblastima (`pitanja-7-skripta-2025.js`: pitanja iz skripte) u formatu `[pitanje, [A, B, C], indeks tačnog (0/1/2), objašnjenje, provjereno (1/0)]`

Pitanje ili odgovor možete ispraviti direktno u odgovarajućem fajlu u folderu `data/`.
