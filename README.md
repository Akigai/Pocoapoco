# Poco a Poco — PWA setup (about 10 minutes)

Alisha's Spanish app as an installable phone app with daily push reminders.

## Step 1 — Put it online (GitHub Pages)

1. Create a free account at github.com (if you don't have one).
2. Click **+** (top right) → **New repository**. Name it `poco-a-poco`, keep it **Public**, click **Create repository**.
3. Click **uploading an existing file** and drag in these files, then click **Commit changes**:
   - index.html
   - manifest.webmanifest
   - sw.js
   - icon-192.png
   - icon-512.png
   - send-push.js
   - subscriptions.json
   - (do NOT upload PRIVATE-KEY.txt)
4. Go to **Settings → Pages**. Under "Branch" choose `main` and `/ (root)`, click **Save**.
5. After a minute or two the app is live at:
   `https://YOUR-USERNAME.github.io/poco-a-poco/`

That link is what you send Alisha. On her phone she opens it and uses **Add to Home Screen** (iPhone: Share button → Add to Home Screen; Android: browser menu → Install app).

## Step 2 — Turn on the daily reminders

1. In the repo: **Add file → Create new file**. As the file name type exactly:
   `.github/workflows/push.yml`
   Paste in the contents of `github-workflow-push.yml` (from this folder) and commit.
2. Go to **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `VAPID_PRIVATE_KEY`
   - Value: the key inside `PRIVATE-KEY.txt`
   Then delete PRIVATE-KEY.txt from your computer — never upload it to the repo.
3. On Alisha's phone (opened from the home-screen icon): in the app's **Hoy** tab, open the **Notificaciones** card and tap **Activar notificaciones**. A code appears — she copies it and WhatsApps it to you.
4. In the repo, open `subscriptions.json` → click the pencil (Edit) → make it look like this, pasting her code inside the brackets:

   ```
   [
   PASTE-HER-CODE-HERE
   ]
   ```

   (If you activate notifications on your phone too, separate the two codes with a comma.)
5. Commit. Done — she'll now get a push at **07:45** (morning journal) and **20:30** (evening journal + Corrección), Barcelona time.

## Step 3 — Built-in Claude AI (5 min)

One API key powers everything AI in the app (Claude Haiku):

- **Corrección con Claude** — in-app journal corrections with explanations in Malayalam and practice tasks. Each correction also teaches the app her error patterns (its "learner model").
- **Ideas para hoy** — personalised writing starters each morning.
- **Sugerencias de hoy** — 10 tap-to-add daily words themed to her week (Barça days, food days, F1 days...).
- **Prompt de hoy** — regenerates the ChatGPT voice-conversation prompt daily from her current week, her recurring mistakes, and her newest words.
- **Frases de hoy** — 8 daily shadowing sentences the phone reads aloud in Spanish (uses the phone's built-in voice, free).
- **Generar repaso** (Plan tab) — the Sunday weekly report: what improved, stubborn errors, mini-quiz, and an advance-or-repeat verdict.
- **Medir mi progreso** (Plan tab) — an honest distance-to-B1 estimate from her actual writing.

Everything is cached per day, so repeat taps cost nothing. Total cost stays around a dollar or two per month at most.

Setting up the key:

1. Go to console.anthropic.com and sign in (create an account if needed).
2. Add billing under **Settings → Billing** ($5 of credit will last months — each correction costs a fraction of a cent). Set a low monthly spend limit there too, e.g. $5.
3. **Settings → API keys → Create key**. Name it `poco-a-poco`, copy the key (starts `sk-ant-`).
4. WhatsApp the key to Alisha. The first time she taps **Corrección con Claude**, the app asks for it once, then remembers it.

Security notes: the key lives only in the app on her phone — it is never in the GitHub repo, so nobody else can use it. NEVER paste the key into any repo file. If the key ever leaks, delete it in the console and make a new one.

No key handy? The button offers a fallback that copies the entry plus teacher prompt for pasting into the Claude app.

## Testing and tweaks

- Test right now: repo → **Actions** tab → "Daily reminders" → **Run workflow**. Her phone should ping within a minute.
- Change the times: edit `.github/workflows/push.yml`. The two cron lines are in UTC (Barcelona summer = UTC+2, winter = UTC+1). Example: `45 5 * * *` = 07:45 Barcelona in summer.
- iPhone note: web push needs iOS 16.4 or newer, and the app must be opened from the home-screen icon (not Safari) when she taps Activar.
- If notifications ever stop (subscription expired), she just taps Activar again and sends you the new code.

## What's what

| File | Purpose |
|---|---|
| index.html | The whole app |
| manifest.webmanifest, icons | Make it installable with the orange icon |
| sw.js | Offline support + receives the pushes |
| send-push.js + workflow | GitHub sends the two daily reminders |
| subscriptions.json | Whose phones get the reminders |
