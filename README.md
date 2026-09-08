# Choroni West Arts Grant

A lightweight, Git-friendly grant application site built with Next.js and TypeScript.

## What it does

- Arts-focused public landing page
- Multi-step application workspace
- Automatic local draft saving in the applicant's browser
- Section completion states and overall completion percentage
- Editable budget and timeline builders
- Dedicated work-sample section
- Review / validation before submission
- Client-side PDF generation
- Automatic delivery of the completed PDF to `grants@mastil.com` through Resend
- No database, authentication service, or file-storage service

## Grant settings

Grant-specific public settings live in `lib/config.ts`, including:

- deadline and decision date
- grant range ($1,000–$25,000)
- contact email
- submission email

## Resend / automatic submission

The app sends completed application PDFs through a Next.js route at `app/api/submit/route.ts`.

The verified sending domain is expected to be `wiixii.org`. By default the site sends from:

```text
Choroni West Arts Grant <grants@wiixii.org>
```

and delivers applications to:

```text
grants@mastil.com
```

### Required Vercel environment variable

In **Vercel → Project → Settings → Environment Variables**, add:

```text
RESEND_API_KEY=re_...
```

Add it to Production and Preview if you want submissions to work in both environments.

### Optional sender override

If you want to use a different sender address on the verified domain, add:

```text
RESEND_FROM_EMAIL=Choroni West Arts Grant <another-address@wiixii.org>
```

If omitted, the default `grants@wiixii.org` sender is used.

After adding or changing environment variables, redeploy the project so the new values are available to the deployment.

## Applicant flow

1. Applicant completes the multi-step application.
2. Draft answers are stored locally in the browser while they work.
3. The site generates a PDF in the browser at submission time.
4. The PDF is posted to the server-side submission route.
5. Resend emails the PDF to `grants@mastil.com`.
6. The applicant sees a submission confirmation and can download their own PDF copy.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For local submission testing, create `.env.local`:

```text
RESEND_API_KEY=re_...
# Optional:
# RESEND_FROM_EMAIL=Choroni West Arts Grant <grants@wiixii.org>
```

## Deploy with Git + Vercel

This repository is intended to be the source of truth.

1. Push changes to GitHub.
2. Connect the repository to Vercel.
3. Use the **Next.js** framework preset.
4. Leave **Output Directory** unset; Next.js manages its own build output.
5. Add `RESEND_API_KEY` in Vercel environment variables.
6. Deploy.

## Maintenance

Most grant-specific content is in:

- `lib/config.ts` — dates, grant range, and contact/submission settings
- `app/page.tsx` — public grant page, eligibility, and post-award terms
- `app/apply/page.tsx` — application questions, PDF output, and application UX
- `app/api/submit/route.ts` — automatic email delivery through Resend
- `app/globals.css` — visual design

## Applicant privacy

Draft answers are stored in `localStorage` on the applicant's browser. They are sent to the server only when the applicant presses **Submit application**, at which point the generated PDF and minimal submission metadata are sent to Resend for delivery to the grant inbox. No application database or permanent file store is used by this site.
