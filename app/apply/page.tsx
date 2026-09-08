'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { grantConfig } from '@/lib/config';

type BudgetItem = { id: string; label: string; amount: string };
type TimelineItem = { id: string; date: string; milestone: string };

type Application = {
  name: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  discipline: string;
  referral: string;
  projectTitle: string;
  projectSummary: string;
  projectFormat: string;
  projectLocation: string;
  artisticVision: string;
  whyNow: string;
  applicantRole: string;
  collaborators: string;
  openRoles: string;
  grantRequest: string;
  otherFunding: string;
  audience: string;
  reachPlan: string;
  growthImpact: string;
  success: string;
  risks: string;
  extraLink: string;
  budget: BudgetItem[];
  timeline: TimelineItem[];
  certification: boolean;
  submittedAt?: string;
};

const emptyApplication: Application = {
  name: '', email: '', phone: '', city: '', website: '', discipline: '', referral: '',
  projectTitle: '', projectSummary: '', projectFormat: '', projectLocation: '',
  artisticVision: '', whyNow: '', applicantRole: '', collaborators: '', openRoles: '',
  grantRequest: '', otherFunding: '', audience: '', reachPlan: '', growthImpact: '',
  success: '', risks: '', extraLink: '', certification: false,
  budget: [{ id: 'b1', label: '', amount: '' }],
  timeline: [{ id: 't1', date: '', milestone: '' }],
};

const sections = [
  { id: 'applicant', label: 'You', title: 'About you' },
  { id: 'project', label: 'Project', title: 'The project' },
  { id: 'vision', label: 'Vision', title: 'Artistic vision' },
  { id: 'team', label: 'Team', title: 'Your role & team' },
  { id: 'budget', label: 'Budget', title: 'Budget' },
  { id: 'timeline', label: 'Timeline', title: 'Timeline' },
  { id: 'impact', label: 'Impact', title: 'Audience & impact' },
  { id: 'review', label: 'Review', title: 'Review & submit' },
] as const;

type SectionId = typeof sections[number]['id'];

const requiredBySection: Record<SectionId, (keyof Application)[]> = {
  applicant: ['name', 'email', 'city', 'discipline'],
  project: ['projectTitle', 'projectSummary'],
  vision: ['artisticVision', 'whyNow'],
  team: ['applicantRole'],
  budget: ['grantRequest'],
  timeline: [],
  impact: ['growthImpact'],
  review: ['certification'],
};

function id(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

function money(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
}

function isFilled(value: unknown) {
  if (typeof value === 'boolean') return value;
  return typeof value === 'string' && value.trim().length > 0;
}

function safeText(value: string) {
  return value.trim() || '—';
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <div className="field"><label>{label}{required && <span className="required"> *</span>}</label>{hint && <div className="hint">{hint}</div>}{children}</div>;
}

function TextArea({ value, onChange, rows = 4, max = 900, placeholder = '' }: { value: string; onChange: (v: string) => void; rows?: number; max?: number; placeholder?: string }) {
  return <><textarea rows={rows} maxLength={max} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/><div className="char-note">{value.length}/{max}</div></>;
}

export default function ApplyPage() {
  const [application, setApplication] = useState<Application>(emptyApplication);
  const [section, setSection] = useState<SectionId>('applicant');
  const [savedAt, setSavedAt] = useState<string>('Draft saving automatically');
  const [hydrated, setHydrated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('choroni-west-arts-grant-draft');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Application;
        setApplication({ ...emptyApplication, ...parsed });
        if (parsed.submittedAt) setSubmitted(true);
      } catch {}
    }
    const hash = window.location.hash.replace('#', '') as SectionId;
    if (sections.some(s => s.id === hash)) setSection(hash);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSavedAt('Saving…');
    saveTimer.current = setTimeout(() => {
      localStorage.setItem('choroni-west-arts-grant-draft', JSON.stringify(application));
      setSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
    }, 350);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [application, hydrated]);

  const update = <K extends keyof Application>(key: K, value: Application[K]) => setApplication(prev => ({ ...prev, [key]: value }));

  const sectionComplete = (id: SectionId) => {
    if (id === 'budget') {
      const hasRequest = !!application.grantRequest.trim();
      const hasBudget = application.budget.some(row => row.label.trim() && Number(row.amount) > 0);
      return hasRequest && hasBudget;
    }
    if (id === 'timeline') return application.timeline.some(row => row.date.trim() && row.milestone.trim());
    const fields = requiredBySection[id];
    if (!fields.length) return true;
    return fields.every(key => isFilled(application[key]));
  };

  const scoredSections = sections.filter(s => s.id !== 'review');
  const completedCount = scoredSections.filter(s => sectionComplete(s.id)).length;
  const percent = Math.round((completedCount / scoredSections.length) * 100);
  const remaining = scoredSections.length - completedCount;

  const budgetTotal = useMemo(() => application.budget.reduce((sum, row) => sum + (Number(row.amount) || 0), 0), [application.budget]);
  const otherFundingNum = Number(application.otherFunding) || 0;
  const grantRequestNum = Number(application.grantRequest) || 0;
  const fundingGap = Math.max(0, budgetTotal - otherFundingNum - grantRequestNum);

  const go = (id: SectionId) => {
    setSection(id);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const currentIndex = sections.findIndex(s => s.id === section);
  const next = () => currentIndex < sections.length - 1 && go(sections[currentIndex + 1].id);
  const prev = () => currentIndex > 0 && go(sections[currentIndex - 1].id);

  const missing = useMemo(() => {
    const items: string[] = [];
    if (!application.name.trim()) items.push('Your name');
    if (!application.email.trim()) items.push('Email');
    if (!application.city.trim()) items.push('City / location');
    if (!application.discipline.trim()) items.push('Primary discipline');
    if (!application.projectTitle.trim()) items.push('Project title');
    if (!application.projectSummary.trim()) items.push('Project overview');
    if (!application.artisticVision.trim()) items.push('Artistic vision');
    if (!application.whyNow.trim()) items.push('Why now');
    if (!application.applicantRole.trim()) items.push('Your role');
    if (!application.grantRequest.trim()) items.push('Grant request');
    if (!application.budget.some(r => r.label.trim() && Number(r.amount) > 0)) items.push('At least one budget item');
    if (!application.timeline.some(r => r.date.trim() && r.milestone.trim())) items.push('At least one timeline milestone');
    if (!application.growthImpact.trim()) items.push('Creative / professional impact');
    if (!application.certification) items.push('Application certification');
    return items;
  }, [application]);

  const addBudget = () => update('budget', [...application.budget, { id: id('b'), label: '', amount: '' }]);
  const setBudgetRow = (rowId: string, key: 'label'|'amount', value: string) => update('budget', application.budget.map(r => r.id === rowId ? { ...r, [key]: value } : r));
  const removeBudget = (rowId: string) => update('budget', application.budget.filter(r => r.id !== rowId));
  const addTimeline = () => update('timeline', [...application.timeline, { id: id('t'), date: '', milestone: '' }]);
  const setTimelineRow = (rowId: string, key: 'date'|'milestone', value: string) => update('timeline', application.timeline.map(r => r.id === rowId ? { ...r, [key]: value } : r));
  const removeTimeline = (rowId: string) => update('timeline', application.timeline.filter(r => r.id !== rowId));

  const buildPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const margin = 54;
    const width = 504;
    let y = 58;
    const lineHeight = 14;

    const ensure = (needed = 70) => { if (y + needed > 735) { doc.addPage(); y = 58; } };
    const line = () => { doc.setDrawColor(210); doc.line(margin, y, margin + width, y); y += 18; };
    const heading = (text: string) => { ensure(50); doc.setFont('times', 'bold'); doc.setFontSize(17); doc.text(text, margin, y); y += 24; };
    const item = (label: string, value: string) => {
      ensure(55);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(95); doc.text(label.toUpperCase(), margin, y); y += 13;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(25);
      const lines = doc.splitTextToSize(safeText(value), width);
      doc.text(lines, margin, y); y += Math.max(lines.length * lineHeight, lineHeight) + 14;
    };

    doc.setFont('times', 'bold'); doc.setFontSize(25); doc.setTextColor(25); doc.text(grantConfig.name, margin, y); y += 25;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100); doc.text(`${grantConfig.year} Application · ${application.projectTitle || 'Untitled project'}`, margin, y); y += 24; line();

    heading('Applicant');
    item('Name', application.name); item('Email', application.email); item('Phone', application.phone); item('Location', application.city); item('Discipline', application.discipline); item('Website / portfolio', application.website); item('Referral', application.referral);
    line(); heading('Project');
    item('Project title', application.projectTitle); item('Overview', application.projectSummary); item('Format / discipline', application.projectFormat); item('Location', application.projectLocation);
    line(); heading('Artistic vision'); item('What should the work feel like?', application.artisticVision); item('Why now?', application.whyNow);
    line(); heading('Role & team'); item('Applicant role', application.applicantRole); item('Collaborators', application.collaborators); item('Roles still to fill', application.openRoles);
    line(); heading('Budget'); item('Grant requested', money(grantRequestNum)); item('Other funding', money(otherFundingNum));
    application.budget.forEach(r => { if (r.label.trim() || r.amount) item(r.label || 'Budget item', money(Number(r.amount) || 0)); });
    item('Total project budget', money(budgetTotal));
    line(); heading('Timeline');
    application.timeline.forEach(r => { if (r.date.trim() || r.milestone.trim()) item(r.date || 'Date TBD', r.milestone); });
    line(); heading('Audience & impact'); item('Who is it for?', application.audience); item('How will people find it?', application.reachPlan); item('What could this unlock?', application.growthImpact); item('What would success look like?', application.success); item('Risks', application.risks); item('Optional link', application.extraLink);
    ensure(45); line(); doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(100); doc.text(`Generated from the ${grantConfig.name} application portal.`, margin, y);
    return doc;
  };

  const downloadPdf = () => {
    const doc = buildPdf();
    const slug = (application.name || 'applicant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    doc.save(`choroni-west-arts-grant-${slug}.pdf`);
  };

  const shareApplication = async () => {
    const doc = buildPdf();
    const blob = doc.output('blob');
    const filename = `Choroni-West-Arts-Grant-${(application.name || 'Application').replace(/[^a-z0-9]/gi, '-')}.pdf`;
    const file = new File([blob], filename, { type: 'application/pdf' });
    const subject = `Choroni West Arts Grant application — ${application.name || application.projectTitle}`;
    const recipient = grantConfig.submissionEmails.join(',');
    const body = `Attached is my ${grantConfig.year} Choroni West Arts Grant application for “${application.projectTitle || 'my project'}.”`;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ title: subject, text: body, files: [file] }); return; } catch {}
    }
    downloadPdf();
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\nThe PDF has been downloaded to my device so I can attach it to this email.`)}`;
  };

  const submit = () => {
    if (missing.length) return;
    const nextApp = { ...application, submittedAt: new Date().toISOString() };
    setApplication(nextApp);
    localStorage.setItem('choroni-west-arts-grant-draft', JSON.stringify(nextApp));
    setSubmitted(true);
  };

  const renderSection = () => {
    if (submitted && section === 'review') {
      return <div className="success-card"><div className="success-mark">✦</div><h2>Application ready.</h2><p>Your application has been finalized on this device. Send or save the PDF below.</p><div className="success-actions"><button className="button primary" onClick={shareApplication}>Email / share application</button><button className="button secondary" onClick={downloadPdf}>Download PDF</button></div>{grantConfig.submissionEmails.length === 0 && <div className="soft-note" style={{textAlign:'left',marginTop:28}}>This preview does not yet contain submission email addresses. Add them in <code>lib/config.ts</code> before launch; the share button already works independently.</div>}</div>;
    }

    switch (section) {
      case 'applicant': return <>
        <span className="section-no">01</span><h1>About you</h1><p className="section-intro">Just enough context to know who you are. No formal artist statement or CV required.</p>
        <Field label="Name" required><input value={application.name} onChange={e=>update('name',e.target.value)} autoComplete="name"/></Field>
        <div className="row2"><Field label="Email" required><input type="email" value={application.email} onChange={e=>update('email',e.target.value)} autoComplete="email"/></Field><Field label="Phone"><input value={application.phone} onChange={e=>update('phone',e.target.value)} autoComplete="tel"/></Field></div>
        <div className="row2"><Field label="City / location" required><input value={application.city} onChange={e=>update('city',e.target.value)}/></Field><Field label="Primary discipline" required hint="For example: theater, film, music, dance, visual art, writing, multidisciplinary."><input value={application.discipline} onChange={e=>update('discipline',e.target.value)}/></Field></div>
        <Field label="Website, portfolio, reel, or profile"><input value={application.website} onChange={e=>update('website',e.target.value)} placeholder="Optional link"/></Field>
        <Field label="How are you connected to the Choroni West community?" hint="A name or one sentence is enough."><input value={application.referral} onChange={e=>update('referral',e.target.value)}/></Field>
      </>;
      case 'project': return <>
        <span className="section-no">02</span><h1>The project</h1><p className="section-intro">What do you want to make? It can be a production, performance, exhibition, recording, film, workshop, new work, or something we have not anticipated.</p>
        <Field label="Working title" required><input value={application.projectTitle} onChange={e=>update('projectTitle',e.target.value)} placeholder="A working title is perfectly fine"/></Field>
        <Field label="Give us the 30-second version" required hint="What are you making? What form will it take? What would actually happen?"><TextArea value={application.projectSummary} onChange={v=>update('projectSummary',v)} max={700} placeholder="A few sentences is plenty."/></Field>
        <div className="row2"><Field label="Format / discipline"><input value={application.projectFormat} onChange={e=>update('projectFormat',e.target.value)} placeholder="e.g. 3-night play, short film, EP"/></Field><Field label="Where will it happen?"><input value={application.projectLocation} onChange={e=>update('projectLocation',e.target.value)} placeholder="City, venue, online, TBD…"/></Field></div>
      </>;
      case 'vision': return <>
        <span className="section-no">03</span><h1>Artistic vision</h1><p className="section-intro">This is not a writing contest. Tell us what excites you about the work in language you would actually use with another artist.</p>
        <div className="soft-note"><strong>Keep it human.</strong> Short answers are welcome. AI can help you organize or edit, but the ideas should still sound and feel like yours.</div>
        <Field label="What do you want the audience to experience?" required hint="What is distinctive about the idea, interpretation, story, sound, look, or approach?"><TextArea value={application.artisticVision} onChange={v=>update('artisticVision',v)} max={900}/></Field>
        <Field label="Why this project, and why now?" required><TextArea value={application.whyNow} onChange={v=>update('whyNow',v)} max={700}/></Field>
      </>;
      case 'team': return <>
        <span className="section-no">04</span><h1>Your role & team</h1><p className="section-intro">Projects can begin before every collaborator is confirmed. Tell us what you know today.</p>
        <Field label="What will your role be?" required hint="Actor, director, producer, writer, musician, designer, several roles, etc."><input value={application.applicantRole} onChange={e=>update('applicantRole',e.target.value)}/></Field>
        <Field label="Who else is already involved?" hint="Names + roles are enough. If nobody yet, say so."><TextArea value={application.collaborators} onChange={v=>update('collaborators',v)} rows={3} max={600}/></Field>
        <Field label="What roles or collaborators do you still need?" hint="Optional."><TextArea value={application.openRoles} onChange={v=>update('openRoles',v)} rows={3} max={500}/></Field>
      </>;
      case 'budget': return <>
        <span className="section-no">05</span><h1>Budget</h1><p className="section-intro">Use realistic estimates, not false precision. A grant may cover up to 100% of a project’s costs. Choroni West may fund a proposal in full or in part.</p>
        <div className="row2"><Field label="Grant amount requested" required><input type="number" min="0" step="100" value={application.grantRequest} onChange={e=>update('grantRequest',e.target.value)} placeholder="0"/></Field><Field label="Other confirmed / expected funding"><input type="number" min="0" step="100" value={application.otherFunding} onChange={e=>update('otherFunding',e.target.value)} placeholder="0"/></Field></div>
        <Field label="What will the money pay for?" required hint="Add only the categories that matter. Rough estimates are fine."><div className="budget-list">{application.budget.map(row=><div className="budget-row" key={row.id}><input aria-label="Budget item" placeholder="e.g. Venue rental" value={row.label} onChange={e=>setBudgetRow(row.id,'label',e.target.value)}/><input aria-label="Amount" type="number" min="0" step="50" placeholder="$" value={row.amount} onChange={e=>setBudgetRow(row.id,'amount',e.target.value)}/><button className="icon-btn" aria-label="Remove budget row" onClick={()=>removeBudget(row.id)} disabled={application.budget.length===1}>×</button></div>)}</div><button className="add-row" onClick={addBudget}>+ Add budget item</button></Field>
        <div className="budget-summary"><div><span>Total project budget</span><strong>{money(budgetTotal)}</strong></div><div><span>Grant requested</span><strong>{money(grantRequestNum)}</strong></div><div><span>Other funding</span><strong>{money(otherFundingNum)}</strong></div><div className="total"><span>Unfunded gap</span><strong>{money(fundingGap)}</strong></div></div>
      </>;
      case 'timeline': return <>
        <span className="section-no">06</span><h1>Timeline</h1><p className="section-intro">A handful of milestones is enough. We are looking for evidence that you have thought about the path from “idea” to “happening.”</p>
        <Field label="Key milestones" required hint="Dates can be approximate: “October,” “Winter 2027,” etc."><div className="timeline-list">{application.timeline.map(row=><div className="timeline-row" key={row.id}><input aria-label="Date" placeholder="When" value={row.date} onChange={e=>setTimelineRow(row.id,'date',e.target.value)}/><input aria-label="Milestone" placeholder="What happens" value={row.milestone} onChange={e=>setTimelineRow(row.id,'milestone',e.target.value)}/><button className="icon-btn" aria-label="Remove timeline row" onClick={()=>removeTimeline(row.id)} disabled={application.timeline.length===1}>×</button></div>)}</div><button className="add-row" onClick={addTimeline}>+ Add milestone</button></Field>
      </>;
      case 'impact': return <>
        <span className="section-no">07</span><h1>Audience & impact</h1><p className="section-intro">We care about the audience, but this does not need to be a giant audience. We also care about what making the work could unlock for you.</p>
        <Field label="Who do you hope experiences the work?" hint="Optional, and “people who love weird intimate theater” is a valid kind of answer."><TextArea value={application.audience} onChange={v=>update('audience',v)} rows={3} max={500}/></Field>
        <Field label="How might those people find it?" hint="A simple plan is fine."><TextArea value={application.reachPlan} onChange={v=>update('reachPlan',v)} rows={3} max={500}/></Field>
        <Field label="What could completing this project unlock for you?" required hint="Think about craft, confidence, collaborators, career momentum, a body of work, or something else."><TextArea value={application.growthImpact} onChange={v=>update('growthImpact',v)} max={700}/></Field>
        <Field label="What would make you feel the project was successful?" hint="Ticket sales can be part of the answer, but they do not need to be."><TextArea value={application.success} onChange={v=>update('success',v)} rows={3} max={500}/></Field>
        <Field label="What are the biggest things that could get in the way?" hint="One or two risks + how you would handle them is enough."><TextArea value={application.risks} onChange={v=>update('risks',v)} rows={3} max={500}/></Field>
        <Field label="Anything you'd like us to see?"><input value={application.extraLink} onChange={e=>update('extraLink',e.target.value)} placeholder="Optional link to work sample, mood board, script, deck, etc."/></Field>
      </>;
      case 'review': return <>
        <span className="section-no">08</span><h1>Review & submit</h1><p className="section-intro">Read it once. Fix anything that does not feel like you. Then you are done.</p>
        {missing.length > 0 && <div className="missing-box"><strong>{missing.length} item{missing.length===1?'':'s'} still needed:</strong> {missing.join(' · ')}</div>}
        <Review title="Applicant" items={[['Name',application.name],['Email',application.email],['Location',application.city],['Discipline',application.discipline],['Portfolio',application.website]]}/>
        <Review title="Project" items={[['Title',application.projectTitle],['Overview',application.projectSummary],['Format',application.projectFormat],['Location',application.projectLocation]]}/>
        <Review title="Vision" items={[['Audience experience',application.artisticVision],['Why now',application.whyNow]]}/>
        <Review title="Team" items={[['Your role',application.applicantRole],['Collaborators',application.collaborators],['Open roles',application.openRoles]]}/>
        <Review title="Budget" items={[['Grant requested',money(grantRequestNum)],['Project budget',money(budgetTotal)],['Other funding',money(otherFundingNum)]]}/>
        <Review title="Impact" items={[['Audience',application.audience],['Reach plan',application.reachPlan],['What this unlocks',application.growthImpact],['Success',application.success],['Risks',application.risks]]}/>
        <div className="field"><label style={{display:'flex',gap:10,alignItems:'flex-start',fontWeight:650,lineHeight:1.5}}><input type="checkbox" style={{width:18,marginTop:3}} checked={application.certification} onChange={e=>update('certification',e.target.checked)}/><span>I confirm that this application accurately represents the project I want to pursue and the information is true to the best of my knowledge.</span></label></div>
        <button className="button primary" disabled={missing.length>0} onClick={submit} style={{opacity:missing.length?0.45:1,cursor:missing.length?'not-allowed':'pointer'}}>Finalize application <span>→</span></button>
      </>;
    }
  };

  return <main className="app-shell">
    <aside className="app-nav">
      <Link className="brand" href="/">Choroni West<br/>Arts Grant</Link>
      <div className="app-progress"><div className="progress-meta"><span>{percent}% complete</span><span>{remaining ? `${remaining} remaining` : 'Ready to review'}</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div></div>
      <nav className="steps" aria-label="Application sections">{sections.map((s,i)=><button key={s.id} className={`step-btn ${s.id===section?'active':''} ${sectionComplete(s.id)?'complete':''}`} onClick={()=>go(s.id)}><span className="n">{String(i+1).padStart(2,'0')}</span><span>{s.label}</span><span className="state"/></button>)}</nav>
      <div className="save-status">{savedAt}</div>
    </aside>
    <div className="app-main">
      <div className="app-top"><Link href="/">← Grant overview</Link></div>
      <section className="section-card">{renderSection()}</section>
      {!submitted && <div className="nav-actions">{currentIndex>0?<button className="button secondary" onClick={prev}>← Previous</button>:<span/>}{currentIndex<sections.length-1&&<button className="button primary next" onClick={next}>Save & continue →</button>}</div>}
    </div>
  </main>;
}

function Review({ title, items }: { title: string; items: [string,string][] }) {
  return <section className="review-section"><h3>{title}</h3><dl className="review-grid">{items.map(([label,value])=><div key={label} style={{display:'contents'}}><dt>{label}</dt><dd>{safeText(value)}</dd></div>)}</dl></section>;
}
