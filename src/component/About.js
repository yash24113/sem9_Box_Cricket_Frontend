// src/pages/About.jsx
import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import author1 from "../assets/yash.jpg";

const About = () => {
  const targets = { matches: 1500, players: 8000, ratings: 4.8 };
  const [counts, setCounts] = useState({ matches: 0, players: 0, ratings: 0 });

  useEffect(() => {
    const animate = (key, end, duration = 1000) => {
      const start = 0;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const val =
          key === "ratings"
            ? (start + (end - start) * p).toFixed(1)
            : Math.floor(start + (end - start) * p);
        setCounts((c) => ({ ...c, [key]: Number(val) }));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    animate("matches", targets.matches, 1200);
    animate("players", targets.players, 1200);
    animate("ratings", targets.ratings, 1200);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      document.querySelectorAll(".about .reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80)
          el.classList.add("in");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{css}</style>

      <div className="about">
        {/* HERO */}
        <div className="about__wrap about__hero">
          <div className="about__heroCard reveal">
            <img src={logo} alt="Box Cricket Logo" className="about__heroLogo" />
            <div>
              <div className="about__tag">About • Box Cricket</div>
              <h1 className="about__title">
                Fast-paced, enclosed-cage cricket built for today.
              </h1>
              <p className="about__p">
                We run premium box-cricket cages with rebound nets, LED floodlights,
                and digital scoring — plus a smooth booking experience online or on
                WhatsApp.
              </p>
              <div className="about__cta">
                <a href="/" className="about__btn about__btn--outline">Home</a>
                <a href="/arealist" className="about__btn about__btn--primary">Book a Cage</a>
              </div>
            </div>
          </div>
        </div>

        {/* MISSION */}
        <section className="about__section">
          <div className="about__wrap reveal">
            <h2 className="about__h2">Our Mission</h2>
            <p className="about__p">
              Make cricket more accessible with short, exciting formats in safe,
              modern cages — perfect for friends, families, and corporate teams.
            </p>
            <div className="about__stats">
              <div className="about__stat">
                <b>{counts.matches}+</b>
                Matches Hosted
              </div>
              <div className="about__stat">
                <b>{counts.players}+</b>
                Players Served
              </div>
              <div className="about__stat">
                <b>{counts.ratings}★</b>
                Average Rating
              </div>
            </div>
          </div>
        </section>

        {/* WHAT IS BOX CRICKET */}
        <section className="about__section">
          <div className="about__wrap reveal">
            <h2 className="about__h2">What is Box Cricket?</h2>
            <div className="about__grid about__grid--3">
              <div className="about__card">
                <h3 className="about__h3">Enclosed Cages</h3>
                <p className="about__p">
                  High nets and side walls keep play safe and dynamic — rebounds are part of the game.
                </p>
              </div>
              <div className="about__card">
                <h3 className="about__h3">Short Formats</h3>
                <p className="about__p">
                  5v5 or 6v6 teams with typical 6-over innings — more action per minute.
                </p>
              </div>
              <div className="about__card">
                <h3 className="about__h3">Digital Scoring</h3>
                <p className="about__p">
                  Scoreboards, ball-by-ball logs, and umpire/scorer add-ons for leagues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="about__section">
          <div className="about__wrap reveal">
            <h2 className="about__h2">Values We Play By</h2>
            <div className="about__grid about__grid--3">
              {[
                { t: "Safety First", d: "Cushioned turf, strict gear checks, and clear rules." },
                { t: "Fair Play", d: "Neutral officials on request and transparent scoring." },
                { t: "Community", d: "Weekend mixers, office leagues, and beginner-friendly slots." },
              ].map((v, i) => (
                <div className="about__card about__val" key={i}>
                  <span className="about__dot" />
                  <div>
                    <h3 className="about__h3">{v.t}</h3>
                    <p className="about__p" style={{ margin: 0 }}>{v.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="about__section">
          <div className="about__wrap reveal">
            <h2 className="about__h2">Our Journey</h2>
            <div className="about__timeline">
              <div className="about__milestone"><b>2023:</b> First cage launched with premium turf and LED lights.</div>
              <div className="about__milestone"><b>2024:</b> Introduced digital scoring + mini-leagues for startups.</div>
              <div className="about__milestone"><b>2025:</b> Expanded to multi-cage format; WhatsApp booking & tournaments.</div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="about__section">
          <div className="about__wrap reveal">
            <h2 className="about__h2">Meet the Team</h2>
            <p className="about__p">A tight crew that loves cricket and clean execution.</p>
            <div className="about__team">
              <div className="about__card about__member">
                <img src={author1} alt="Yash Khalas" className="about__avatar" />
                <div className="about__name">Yash Khalas</div>
                <div className="about__role">Backend + Frontend Developer</div>
              </div>
              <div className="about__card about__member">
                <img
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
                  alt="Hardik Chauhan"
                  className="about__avatar"
                />
                <div className="about__name">Hardik Chauhan</div>
                <div className="about__role">Frontend + Project Guide</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about__section">
          <div className="about__wrap reveal">
            <h2 className="about__h2">Ready to Play?</h2>
            <p className="about__p">Book a quick 6-over match or plan a weekend league — we’ll handle the rest.</p>
            <div className="about__cta">
              <a href="/arealist" className="about__btn about__btn--primary">Book a Cage</a>
              <a href="/arealist" className="about__btn about__btn--outline">See Pricing</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;

/* ===== Scoped CSS (does not touch header) ===== */
const css = `
.about{ /* isolate typography + spacing so header never stretches */
  --text:#0e1a2b; --muted:#64748b; --brand:#2c4c97; --gold:#d6a74b; --surface:#ffffff;
  --shadow:0 12px 30px rgba(0,0,0,.10); --max:1100px;
}
.about *{ box-sizing:border-box }

.about__wrap{ max-width:var(--max); margin:0 auto; padding:0 20px }
.about__hero{ padding:32px 0 24px } /* no top margins that could “collapse” into header */

.about__heroCard{
  background:linear-gradient(135deg,#eef2ff,#ffffff);
  border:1px solid rgba(17,35,56,.08);
  border-radius:24px; padding:24px;
  display:grid; grid-template-columns:120px 1fr; gap:18px; align-items:center;
  box-shadow:var(--shadow)
}
@media (max-width:576px){ .about__heroCard{ grid-template-columns:1fr; text-align:center } }

.about__heroLogo{
  width:100px; height:100px; object-fit:contain; border-radius:16px; background:#fff;
  border:1px solid rgba(0,0,0,.06)
}

.about__title{ margin:0 0 6px; font-size:clamp(22px,3.5vw,34px); color:var(--text); line-height:1.12 }
.about__tag{
  display:inline-flex; gap:8px; align-items:center;
  background:rgba(44,76,151,.06); border:1px solid rgba(44,76,151,.2);
  color:#1d2a44; padding:6px 10px; border-radius:999px; font-weight:700
}
.about__p{ margin:0; color:var(--muted) }

.about__section{ padding:34px 0 } /* section spacing only inside .about */
.about__h2{ margin:0 0 10px; font-size:clamp(20px,3vw,28px); color:var(--text) }
.about__h3{ margin:0 0 6px; color:var(--text) }

.about__grid{ display:grid; gap:16px }
.about__grid--3{ grid-template-columns:repeat(3,1fr) }
@media (max-width:992px){ .about__grid--3{ grid-template-columns:repeat(2,1fr) } }
@media (max-width:576px){ .about__grid--3{ grid-template-columns:1fr } }

.about__card{
  background:var(--surface); border:1px solid rgba(17,35,56,.08); border-radius:16px;
  padding:18px; box-shadow:var(--shadow); transition:transform .2s, box-shadow .3s
}
.about__card:hover{ transform:translateY(-2px) }

.about__val{ display:flex; gap:10px }
.about__dot{ width:10px; height:10px; border-radius:50%; background:var(--brand); margin-top:8px }

.about__stats{
  display:grid; gap:16px; grid-template-columns:repeat(3,1fr); margin-top:16px
}
@media (max-width:576px){ .about__stats{ grid-template-columns:1fr } }
.about__stat{
  background:#0e1a2b; color:#cbd5e1; border:1px solid rgba(255,255,255,.08); border-radius:16px;
  padding:18px; text-align:center
}
.about__stat b{ display:block; font-size:28px; color:#fff }

.about__team{ display:grid; gap:16px; grid-template-columns:repeat(3,1fr); margin-top:14px }
@media (max-width:992px){ .about__team{ grid-template-columns:repeat(2,1fr) } }
@media (max-width:576px){ .about__team{ grid-template-columns:1fr } }
.about__member{ text-align:center }
.about__avatar{
  width:110px; height:110px; border-radius:50%; object-fit:cover;
  border:3px solid #eef2ff; box-shadow:0 10px 20px rgba(17,35,56,.12)
}
.about__name{ margin:10px 0 4px; font-weight:800; color:var(--text) }
.about__role{ margin:0; color:var(--muted) }

.about__timeline{ position:relative; padding-left:16px }
.about__timeline:before{
  content:""; position:absolute; left:0; top:4px; bottom:4px; width:4px; border-radius:4px;
  background:linear-gradient(var(--brand),var(--gold))
}
.about__milestone{
  background:#fff; border:1px solid rgba(17,35,56,.08); border-radius:12px;
  padding:12px 14px; margin:10px 0 10px 8px; box-shadow:var(--shadow)
}

.about__cta{ display:flex; gap:12px; flex-wrap:wrap; margin-top:12px }
.about__btn{
  display:inline-flex; align-items:center; justify-content:center; padding:12px 18px; border-radius:999px;
  border:1px solid transparent; font-weight:700; text-decoration:none; cursor:pointer
}
.about__btn--primary{ background:#2c4c97; color:#fff }
.about__btn--outline{ background:#fff; color:#0f172a; border-color:rgba(17,35,56,.12) }

/* simple reveal */
.about .reveal{ opacity:0; transform:translateY(8px) }
.about .reveal.in{ opacity:1; transform:translateY(0); transition:all .5s ease }
`;
