# Decoding HCM — BSF HCM Normalization Calculator

A mobile-first Vite + TypeScript calculator with optional Supabase storage and Google AdSense placeholders.

## What it does
- Accepts raw marks.
- Applies the formula from the supplied handwritten image:
  A = [12.96 / (Tq - Sq)] × (B - Sq) + 76.54
- Shows all six shift-wise Method 1 results.
- Method 2 aligns all results using 2 Sep 3rd Shift as the easy/reference shift:
  M2_i = M1_i + (B - M1_easy)
- Logs calculations to Supabase when configured.
- Keeps built-in shift data as fallback if Supabase is unavailable.

## Important assumption
The supplied image does not mathematically spell out Method 2. This implementation interprets the note as: calculate the shortfall/excess of the easy/reference shift versus the raw mark and add that same correction to every Method 1 shift result. This makes the easy/reference shift equal to the raw mark. If your intended Method 2 is different, edit `src/calculator.ts` only.

## Local setup
1. Install Node.js LTS.
2. Copy `.env.example` to `.env.local`.
3. Add Supabase URL + anon key.
4. In Supabase SQL Editor, run `supabase.sql`.
5. Run `npm install`.
6. Run `npm run dev`.

## Vercel
Import this GitHub repository into Vercel. Build command: `npm run build`. Output is detected automatically.
Add these Production + Preview variables in Vercel:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ADSENSE_CLIENT
- VITE_SITE_URL

Do not put a Supabase service-role key in frontend code. Only use the anon/publishable key.

## AdSense
Replace the placeholder publisher client in `index.html` with the exact AdSense code/client provided by Google. Replace `public/ads.txt` with the exact ads.txt line shown in your AdSense account. Update canonical URL, robots.txt and sitemap.xml after your real domain is known.

## Branding
YouTube: https://youtube.com/@decoding_hcm?si=xExH2PeEjsnDMRSD
Telegram: https://t.me/decoding_hcm

## Production checklist
- Verify every Tq/Sq against the source/official data you intend to publish.
- Test raw marks such as 0, 50, 80, 90, 100.
- Confirm Method 2 logic before advertising the results as an estimate.
- Add Privacy Policy, Terms, Contact/About and educational explanatory content before AdSense review.
- Never describe this calculator as an official BSF normalization/result service.
