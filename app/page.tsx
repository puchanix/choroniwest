import Link from 'next/link';
import { grantConfig } from '@/lib/config';

const facts = [
  ['Who', 'Emerging artists & creative producers'],
  ['What', 'Projects in any artistic discipline'],
  ['Awards', '$1,000–$25,000'],
  ['Deadline', grantConfig.deadline],
];

export default function Home() {
  return (
    <main>
      <section className="hero shell">
        <div className="hero-mark" aria-hidden="true"><span>✦</span><span>◌</span><span>∿</span></div>
        <p className="eyebrow">2026 · Invitation & referral round</p>
        <h1>Make the thing<br/><em>you keep imagining.</em></h1>
        <p className="hero-copy">The Choroni West Arts Grant supports emerging artists and creative producers with practical funding to move an idea from possibility to production.</p>
        <div className="hero-actions">
          <Link className="button primary" href="/apply">Start an application <span>→</span></Link>
          <a className="text-link" href="#about">How it works</a>
        </div>
        <div className="scribble" aria-hidden="true"></div>
      </section>

      <section className="facts shell" aria-label="Grant details">
        {facts.map(([label, value]) => <div className="fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <section className="manifesto shell">
        <div className="manifesto-card">
          <p className="kicker">A note before you begin</p>
          <h2>You’re an artist, not a grant writer.</h2>
          <p>Keep it simple. We’re interested in the work you want to make, why it matters to you, and what it would take to make it real. Short, clear answers are welcome.</p>
          <p>You may use AI to help organize or edit your application. Just make sure the final application genuinely reflects your own ideas, plans, and voice.</p>
          <Link className="button ink" href="/apply">Begin · about 30–45 minutes</Link>
        </div>
        <div className="manifesto-side" aria-hidden="true">
          <div className="poster poster-one">IDEA<br/>→<br/>WORK</div>
          <div className="poster poster-two">MAKE<br/>ROOM<br/>FOR<br/>RISK</div>
        </div>
      </section>

      <section className="about shell" id="about">
        <p className="eyebrow">About the fund</p>
        <div className="about-grid">
          <div><h2>Small grants.<br/>Serious intent.</h2></div>
          <div className="prose">
            <p>Choroni West was created by Ariel Poler and Cindy Weitzman to give emerging artists something that is often hard to find early in a creative life: enough resources, trust, and structure to make an ambitious idea real.</p>
            <p>Applicants request the amount they believe the work requires, from <strong>$1,000 to $25,000</strong>. A grant may cover <strong>up to 100% of a project’s costs.</strong> Choroni West may choose to fund a proposal in full or in part.</p>
          </div>
        </div>
        <div className="bio-grid">
          <article className="bio-card"><span>01</span><h3>Ariel Poler</h3><p>An entrepreneur, investor, and mentor who has spent much of his career helping people turn early ideas into durable ventures. He is especially interested in giving talented people the confidence and resources to take a first consequential step.</p></article>
          <article className="bio-card"><span>02</span><h3>Cindy Weitzman</h3><p>A supporter of the arts and emerging creative work who believes early encouragement can give artists room to experiment, take risks, and develop a voice of their own.</p></article>
        </div>
      </section>

      <section className="criteria shell">
        <p className="eyebrow">A few practical answers</p>
        <div className="criteria-list">
          <div className="criterion"><b>01</b><h3>Your labor counts</h3><p>Grant funds may pay you for your own creative or production work, as well as collaborators, materials, space, travel, equipment, and other reasonable project costs.</p></div>
          <div className="criterion"><b>02</b><h3>Underway is okay</h3><p>Your project may already be in progress. Tell us what has happened so far and what the grant would make possible next.</p></div>
          <div className="criterion"><b>03</b><h3>Plans can change</h3><p>If an awarded project falls through or changes materially, contact us before redirecting the funds. We’ll work with you on a sensible adjustment or return of unused funds.</p></div>
          <div className="criterion"><b>04</b><h3>You can reapply</h3><p>Applicants may apply again in a future round, whether or not a previous proposal was funded.</p></div>
        </div>
      </section>

      <section className="criteria shell">
        <p className="eyebrow">What happens after an award</p>
        <div className="criteria-list">
          <div className="criterion"><b>01</b><h3>Award & payment</h3><p>We’ll confirm the award amount, any conditions, and payment details in writing. Funding may be paid all at once or in stages depending on the project.</p></div>
          <div className="criterion"><b>02</b><h3>Keep basic records</h3><p>You do not need an elaborate accounting system, but keep receipts or other reasonable records for major project expenses in case we have a question.</p></div>
          <div className="criterion"><b>03</b><h3>Mid-project check-in</h3><p>Expect one short check-in during the project: what has happened, what has changed, and whether anything is getting in the way.</p></div>
          <div className="criterion"><b>04</b><h3>Short final report</h3><p>When the project wraps, send a brief reflection on what you made, how the funds were used, what you learned, and links or documentation of the finished work when available.</p></div>
        </div>
      </section>

      <section className="criteria shell">
        <p className="eyebrow">What we look for</p>
        <div className="criteria-list">
          {[
            ['Conviction', 'A clear sense of what you want to make and why you care about it.'],
            ['Initiative', 'Evidence that you are ready to move from idea to execution.'],
            ['Feasibility', 'A plan and budget that feel thoughtful enough to begin.'],
            ['Growth', 'A project that could meaningfully stretch your craft, career, or creative independence.'],
          ].map(([title, copy], i) => <div className="criterion" key={title}><b>0{i+1}</b><h3>{title}</h3><p>{copy}</p></div>)}
        </div>
      </section>

      <section className="closing shell">
        <p className="eyebrow">2026 round</p>
        <h2>Ready to put the idea<br/>on paper?</h2>
        <p>Applications are due {grantConfig.deadline}. Decisions are expected by {grantConfig.decisionDate}.</p>
        <Link className="button primary" href="/apply">Start an application <span>→</span></Link>
        <p style={{marginTop:24}}>Questions? <a className="text-link" href={`mailto:${grantConfig.contactEmail}`}>{grantConfig.contactEmail}</a></p>
      </section>

      <footer className="shell footer"><strong>{grantConfig.name}</strong><span>For emerging artists & creative producers · <a href={`mailto:${grantConfig.contactEmail}`}>{grantConfig.contactEmail}</a></span></footer>
    </main>
  );
}
