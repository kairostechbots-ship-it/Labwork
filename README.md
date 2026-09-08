<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6643f446-da99-4d74-90c9-9b004c901762

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Neon database

1. Create a Neon Postgres database and copy its pooled connection string.
2. Add it to `.env.local` as `DATABASE_URL`.
3. Generate and apply migrations:
   `npm run db:generate`
   `npm run db:migrate`
4. Verify the connection at `/api/health/database`.

Never commit `.env.local` or a real database connection string.
