import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const RECIPIENT = 'grants@mastil.com';
const DEFAULT_FROM = 'Choroni West Arts Grant <grants@wiixii.org>';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Submission email is not configured yet.' }, { status: 503 });
    }

    const body = await request.json();
    const applicantName = String(body.applicantName || '').trim();
    const applicantEmail = String(body.applicantEmail || '').trim();
    const projectTitle = String(body.projectTitle || '').trim();
    const grantRequest = Number(body.grantRequest || 0);
    const filename = String(body.filename || 'Choroni-West-Arts-Grant-Application.pdf');
    const pdfBase64 = String(body.pdfBase64 || '');

    if (!applicantName || !applicantEmail || !projectTitle || !pdfBase64) {
      return NextResponse.json({ error: 'The application is missing required submission data.' }, { status: 400 });
    }

    if (grantRequest < 1000 || grantRequest > 25000) {
      return NextResponse.json({ error: 'The grant request must be between $1,000 and $25,000.' }, { status: 400 });
    }

    if (pdfBase64.length > 8_000_000) {
      return NextResponse.json({ error: 'The generated PDF is unexpectedly large.' }, { status: 413 });
    }

    const subject = `Choroni West Arts Grant — ${applicantName} — ${projectTitle}`;
    const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(grantRequest);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [RECIPIENT],
        cc: [applicantEmail],
        reply_to: applicantEmail,
        subject,
        text: [
          'A Choroni West Arts Grant application has been submitted.',
          '',
          `Applicant: ${applicantName}`,
          `Email: ${applicantEmail}`,
          `Project: ${projectTitle}`,
          `Grant requested: ${amount}`,
          '',
          'The completed application PDF is attached. A copy of this submission has also been sent to the applicant.',
        ].join('\n'),
        attachments: [{ filename, content: pdfBase64 }],
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('Resend submission failed:', resendResponse.status, detail);
      return NextResponse.json({ error: 'Email delivery failed. Please try again.' }, { status: 502 });
    }

    const result = await resendResponse.json();
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    console.error('Grant submission error:', error);
    return NextResponse.json({ error: 'The application could not be submitted.' }, { status: 500 });
  }
}
