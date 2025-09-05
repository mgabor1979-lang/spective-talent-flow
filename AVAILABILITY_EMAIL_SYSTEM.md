# Availability Email Reminder System

## Áttekintés

Ez a dokumentum leírja a Spective alkalmazás availability email reminder rendszerét, amely automatikusan kezeli a szakemberek elérhetőségi emlékeztetőit.

## Rendszer Összetevők

### 1. Database Tábla: `scheduled_availability_emails`

```sql
CREATE TABLE scheduled_availability_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  available_date TIMESTAMP WITH TIME ZONE NOT NULL,
  email_data JSONB NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resend_email_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Státuszok:
- `pending` - Az email várja a feldolgozást és nincs még resend_id
- `scheduled` - Az email el lett küldve és van resend_id
- `failed` - Az email küldése sikertelen volt

### 2. Email Template: Availability Reminder

Az email template az `EmailTemplates.availabilityReminderEmail()` függvényben található:
- Személyre szabott üdvözlés
- Emlékeztető az elérhetőségi dátumról
- Link a profilhoz (opcionális)
- Professzionális design

### 3. Cron Job: Napi Feldolgozás

**Ütemezés**: Minden nap hajnali 6:00-kor (Europe/Budapest időzóna)

**Feladatok**:
1. Lekérdezi az összes `pending` státuszú rekordot a `scheduled_availability_emails` táblából
2. Szűri azokat, amelyeknek nincs `resend_email_id`-juk
3. Csak azokat dolgozza fel, amelyek `available_date` értéke már elért vagy elmúlt
4. Minden egyes rekordra:
   - Elküldi az availability reminder emailt
   - Frissíti a rekordot a Resend email ID-val
   - Átállítja a státuszt `scheduled`-re
   - Frissíti a professional profilt `available: true`-ra

### 4. Frontend Integráció

A rendszer a `EditAvailabilityModal.tsx` komponensben kerül használatra:
- Amikor egy szakember beállítja magát elérhetetlennek jövőbeli dátummal
- Automatikusan létrehoz egy rekordot a `scheduled_availability_emails` táblában
- Ha a dátum 30 napon belül van, azonnal ütemezi az emailt Resend-del
- Ha távolabb van, `pending` státusszal tárolja a cron job-nak

## Használat

### Development

```bash
# Csak a cron job indítása
npm run dev:cron

# Minden szolgáltatás indítása (frontend + API + cron)
npm run dev:full

# Cron job logika manuális tesztelése
npm run test:cron
```

### Production

```bash
# Cron job indítása production-ben
npm run start:cron
```

**Fontos**: Production környezetben használjon Supabase Service Role Key-t az `SUPABASE_SERVICE_ROLE_KEY` környezeti változóban!

### Környezeti Változók

```bash
# .env fájl
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
API_PORT=3001
```

## Működési Folyamat

### Scenario 1: Közeli Dátum (30 napon belül)
1. Felhasználó beállítja availability dátumot 10 napra
2. Frontend azonnal ütemezi az emailt Resend-del
3. Rekord létrejön `scheduled` státusszal és resend_email_id-val
4. Cron job kihagyja (már van resend_id)
5. Resend automatikusan küldi az emailt a megadott napon

### Scenario 2: Távoli Dátum (30+ nap)
1. Felhasználó beállítja availability dátumot 60 napra  
2. Frontend létrehoz rekordot `pending` státusszal, resend_id nélkül
3. Cron job naponta ellenőrzi
4. Amikor a dátum elérkezik, cron job:
   - Elküldi az emailt
   - Frissíti a rekordot resend_id-val
   - Átállítja `scheduled` státuszra
   - Aktiválja a profilt

## Monitoring és Hibakezelés

### Logok
- `🕖` - Cron job kezdete
- `📬` - Nincs feldolgozandó email
- `📧` - Emailek feldolgozása folyamatban
- `✅` - Sikeres műveletek
- `❌` - Hibák
- `⚠️` - Figyelmeztetések
- `🎉` - Feldolgozás befejezve

### Hibakezelés
- Email küldési hibák esetén a rekord `failed` státuszt kap
- A cron job folytatja a többi rekord feldolgozását
- Részletes hibaloggok minden lépésnél

## Bővítési Lehetőségek

1. **Retry Logic**: Exponenciális backoff failed emailekhez
2. **Batch Processing**: Nagy mennyiségű email hatékony feldolgozása
3. **Health Check Endpoint**: Cron job állapotának monitorozása
4. **Multiple Templates**: Különböző email template-ek
5. **Timezone Support**: Felhasználói időzóna alapú ütemezés

## Biztonsági Megfontolások

- **Service Role Key**: Production-ben mindig service role key-t használjon
- **Rate Limiting**: Resend API limitekre figyeljen
- **Database Access**: Megfelelő RLS (Row Level Security) szabályok
- **Environment Variables**: Soha ne commitolja a .env fájlt

## Tesztelés

```bash
# Cron job logika azonnali tesztelése
npm run test:cron

# Development környezetben teljes rendszer
npm run dev:full
```

A teszt script manuálisan futtatja a cron job logikáját és részletes információkat ad a scheduled_availability_emails tábla tartalmáról.
