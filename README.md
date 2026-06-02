# Gorj Booking Backend

Acest proiect conține un backend Node.js/Express pentru autentificare și salvarea rezervărilor într-o bază de date SQLite.

## Cum rulezi
1. Instalează Node.js (includând npm).
2. Deschide terminalul în directorul `Aplicatie web 2\Aplicatie web`.
3. Rulează:
   ```bash
   npm install
   npm start
   ```
4. Deschide browserul la:
   ```
   http://localhost:3000
   ```

## Ce am implementat
- API `POST /api/register` pentru crearea conturilor
- API `POST /api/login` pentru autentificare
- API `GET /api/profile` pentru datele utilizatorului
- API `POST /api/bookings` pentru crearea rezervărilor
- API `GET /api/bookings` pentru lista rezervărilor
- Frontendul actualizat să folosescă token JWT și să afișeze istoricul rezervărilor în cont

## Notă
Dacă `npm` nu este disponibil local pe mașina ta, instalează Node.js de pe https://nodejs.org/ și apoi rulează comenzile de mai sus.
