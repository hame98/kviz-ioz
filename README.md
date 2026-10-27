# Kviz – Ispit općeg znanja FBiH (demo)

Kviz za učenje za Ispit općeg znanja (IOZ) Agencije za državnu službu FBiH.
Sadrži sva pitanja iz „Kataloga pitanja – Vodič za polaganje ispita općeg znanja“, raspoređena u šest oblasti, 42 pitanja iz primjera testa i 532 pitanja s ponuđenim odgovorima iz skripte „Pitanja 2025“ (ukupno 1.641).

## Pokretanje
Otvorite `index.html` duplim klikom. Ne treba ni internet ni instalacija.

## Izgled
Gore je meni s ekranima **Učenje** (postavke testa u 4 koraka i stalno vidljiv sažetak), **Pretraga** i **Simulacija ispita**, te polje za brzu pretragu (tipka `/`). Tokom testa desno je panel „Izvori i dokazi“, a slika stranice skripte se uvećava klikom. Interfejs prati svijetlu ili tamnu temu sistema i prilagođen je mobitelu.

## Mogućnosti
- **Redom (od–do):** svako pitanje ima redni broj (#1–#1641; pitanja iz skripte su #1110–#1641). Unesite raspon, npr. 1–20. Na kraju testa dugme „Sljedeći raspon“ nastavlja dalje, a kviz pamti dokle ste stigli.
- **Nasumično:** zadani broj pitanja, nasumično iz odabranog raspona.
- **Simulacija ispita:** 42 nasumična pitanja, 60 minuta, prolaz sa 28 tačnih odgovora.
- **Prikaz odgovora:** odmah nakon svakog pitanja ili tek na kraju testa.
- **Pretraga:** upišite bilo koju riječ ili dio pitanja (kvačice i padeži nisu bitni). Za svako pronađeno pitanje dobijete tačan odgovor, oznake „Na webu: DA/NE“ i „U skripti: DA/NE“ i dokaze: stranicu u Katalogu Agencije (`web/Katalog pitanja ADS FBiH.pdf`) i/ili skriptu, stranicu i sliku stranice.
- **Izvor pitanja:** „Sve“ (sva pitanja), „Web“ (Katalog Agencije i primjer testa, #1–#1109) ili „Skripta“ (pitanja koja postoje u skriptama iz foldera `skripte/`). Kad je odgovor prikazan, ispod pitanja stoji dokaz iz skripte: dokument, stranica, pitanje i odgovor kako su napisani u skripti, link na PDF i slika stranice („Prikaži stranicu“).
- **Filter po oblastima**, miješanje redoslijeda odgovora, pregled svih odgovora s objašnjenjem, „Ponovi samo netačna“.
- **Status provjere:** uz svako pitanje stoji oznaka „✓ provjereno u izvoru“ ili „⚠ nije provjereno“. Opcija „Samo pitanja provjerena u izvoru“ ograničava kviz na provjerena pitanja.
- **Tastatura:** A, B, C (ili 1, 2, 3) bira odgovor, strelice ← i → prelaze na prethodno ili sljedeće pitanje.

## Napomena o odgovorima
Agencija objavljuje samo pitanja, bez ponuđenih i tačnih odgovora. Ponuđene i tačne odgovore sastavio je autor kviza prema propisima: Ustav BiH i FBiH, ZUP i ZUS FBiH, Zakon o državnoj službi FBiH, Zakon o radu FBiH, Pravilnik o kancelarijskom poslovanju FBiH, Zakon o Vijeću ministara BiH i drugi. Uz svako pitanje je naveden izvor.
Kviz služi samo za učenje. Odgovori mogu sadržavati greške ili zastarjele podatke, pa ih provjerite u važećim propisima.

### Provjera odgovora (septembar 2026.)
Odgovori su upoređeni s tekstovima propisa, član po član. **926 od 1.109 pitanja** je označeno kao „provjereno u izvoru“, a **52 odgovora su ispravljena**.

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

## Struktura
- `index.html`, `style.css`, `app.js`: aplikacija
- `data/izvori-skripte.js`: dokazi iz skripti (dokument, stranica, pitanje i odgovor u skripti) za svako pitanje, a ključ je tekst pitanja. Ako promijenite tekst pitanja u `data/`, promijenite ga i ovdje, inače se dokaz neće prikazati.
- `skripte/`: skenirane skripte (PDF), a `skripte/stranice/`: slika svake stranice (JPG)
- `data/*.js`: pitanja po oblastima (`pitanja-7-skripta-2025.js`: pitanja iz skripte) u formatu `[pitanje, [A, B, C], indeks tačnog (0/1/2), objašnjenje, provjereno (1/0)]`

Pitanje ili odgovor možete ispraviti direktno u odgovarajućem fajlu u folderu `data/`.
