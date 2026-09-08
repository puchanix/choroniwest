# Choroni West Arts Grant

A lightweight, Git-friendly grant application site built with Next.js and TypeScript.

## What it does

- Arts-focused public landing page
- Multi-step application workspace
- Automatic local draft saving in the applicant's browser
- Section completion states and overall completion percentage
- Editable budget and timeline builders
- Review / validation before finalizing
- Client-side PDF generation
- Native share-sheet support for sending the PDF when the browser/device supports file sharing
- Email-client fallback with a prefilled subject and message
- No database, authentication service, storage service, or email provider required

## Important submission note

The zero-infrastructure version cannot silently attach a file to an email using `mailto:` because browsers prohibit that for security reasons.

The flow is:

1. Applicant finalizes the application.
2. The site creates the PDF locally.
3. On devices/browsers that support the Web Share API with files, **Email / share application** opens the native share sheet with the PDF attached.
4. Otherwise, the PDF downloads and the applicant's email client opens with a prefilled message; the applicant attaches the downloaded PDF.

If you later want fully automatic server-side email submission, Resend can be added with one Vercel Marketplace integration and a small API route. It is intentionally not included here.

## Before launch

Open `lib/config.ts` and add the destination email address(es):

```ts
submissionEmails: ['your@email.com', 'other@email.com']
```

You can also change the deadline and decision date there.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy with Git + Vercel

1. Create a new GitHub repository.
2. Copy this project into the repository and push it.
3. In Vercel, choose **Add New → Project**.
4. Import the GitHub repository.
5. Vercel should detect Next.js automatically.
6. Click **Deploy**.

No environment variables are required.

## Maintenance

Most grant-specific content is in:

- `lib/config.ts` — dates and submission email recipients
- `app/page.tsx` — public grant page and About copy
- `app/apply/page.tsx` — application questions, PDF output, and application UX
- `app/globals.css` — visual design

## Applicant privacy

Draft answers are stored only in `localStorage` on the applicant's own browser. Nothing is sent to a server by this version of the site. Applicants should download/send the final PDF before clearing browser data or changing devices.
