<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1uih5KUw8Yr4YIXU2njAM5K2FIWkTpexp

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Configure frontend environment variables (public, build-time):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_IMAGE_API_URL` (points to your Cloud Run Function/HTTP service root)
3. Run the app:
   `npm run dev`

## Environment variables and security

- Use `.env.local` for local development of the frontend only and do not commit it.
- Public (client) variables use the `VITE_` prefix. See [`./.env.example`](./.env.example) for the expected keys:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_IMAGE_API_URL` (Cloud Run Function URL)
- Server-only secrets must NOT be in the frontend env:
  - `GEMINI_API_KEY` must be configured on the Cloud Run Function (prefer Google Secret Manager) and never exposed to the browser.
- If any key is committed by mistake, rotate it immediately (e.g., Supabase Dashboard → Project Settings → API → Rotate anon key).
