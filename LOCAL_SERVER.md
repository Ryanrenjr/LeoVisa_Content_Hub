# LeoVisa local server mode

This mode makes this Windows PC the source of truth for the app.

Data locations:

- SQLite database: `prisma/dev.db`
- Uploaded files: `storage/topics`
- Backups: `C:\LeoVisa_Backups`

Start the app for colleagues:

```powershell
cd C:\LeoVisa\08_开发系统\LeoVisa_Content_Hub
npm run local:server
```

In a second PowerShell window, start the public tunnel:

```powershell
cd C:\LeoVisa\08_开发系统\LeoVisa_Content_Hub
npm run local:tunnel
```

Share the `https://*.trycloudflare.com` URL printed by cloudflared.

Recommended one-command helper:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-local-with-tunnel.ps1
```

This starts Cloudflare Tunnel first, reads the generated public URL, and then starts
Next.js with that URL configured for authentication redirects.

Backup manually:

```powershell
npm run local:backup
```

Operational notes:

- Keep both windows open while colleagues use the system.
- If this PC sleeps, shuts down, or loses internet, colleagues cannot access the app.
- For a stable custom URL, create a named Cloudflare Tunnel later and point it to `http://localhost:3000`.
