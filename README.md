# Kviz – Ispit općeg znanja FBiH (demo)

Kviz za učenje za Ispit općeg znanja (IOZ) Agencije za državnu službu FBiH.
Sadrži sva pitanja iz „Kataloga pitanja – Vodič za polaganje ispita općeg znanja“, raspoređena u šest oblasti, i 42 pitanja iz primjera testa (ukupno 1.109).

## Pokretanje
Otvorite `index.html` duplim klikom. Ne treba ni internet ni instalacija.

## Mogućnosti
- **Redom (od–do):** svako pitanje ima redni broj (#1–#1109). Unesite raspon, npr. 1–20. Na kraju testa dugme „Sljedeći raspon“ nastavlja dalje, a kviz pamti dokle ste stigli.
- **Nasumično:** zadani broj pitanja, nasumično iz odabranog raspona.
- **Simulacija ispita:** 42 nasumična pitanja, 60 minuta, prolaz sa 28 tačnih odgovora.
- **Prikaz odgovora:** odmah nakon svakog pitanja ili tek na kraju testa.
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

## Struktura
- `index.html`, `style.css`, `app.js`: aplikacija
- `data/*.js`: pitanja po oblastima u formatu `[pitanje, [A, B, C], indeks tačnog (0/1/2), objašnjenje, provjereno (1/0)]`

Pitanje ili odgovor možete ispraviti direktno u odgovarajućem fajlu u folderu `data/`.
