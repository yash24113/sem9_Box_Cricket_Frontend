import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import author1 from "../assets/yash.jpg"; // ensure these exist
import author2 from "../assets/mita.jpg";

const About = () => {
  /* counters */
  const targets = { matches: 1500, players: 8000, ratings: 4.8 };
  const [counts, setCounts] = useState({ matches: 0, players: 0, ratings: 0 });

  useEffect(() => {
    const animate = (key, end, duration = 1000) => {
      const start = 0;
      const startT = performance.now();
      const step = (now) => {
        const p = Math.min((now - startT) / duration, 1);
        const val = key === "ratings" ? (start + (end - start) * p).toFixed(1) : Math.floor(start + (end - start) * p);
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
      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add("in");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        :root{
          --bg:#0f172a; --card:#0b1224; --text:#0e1a2b; --muted:#64748b;
          --brand:#2c4c97; --gold:#d6a74b; --surface:#ffffff;
          --radius:16px; --shadow:0 12px 30px rgba(0,0,0,0.10);
          --max:1100px;
        }
        *{box-sizing:border-box}
        body{margin:0}
        .wrap{max-width:var(--max);margin:0 auto;padding:0 20px}
        .hero{padding:48px 0 28px}
        .hero-card{
          background:linear-gradient(135deg,#eef2ff,#ffffff);
          border:1px solid rgba(17,35,56,.08);
          border-radius:24px; padding:24px;
          display:grid; grid-template-columns:120px 1fr; gap:18px; align-items:center;
          box-shadow:var(--shadow)
        }
        @media (max-width:576px){ .hero-card{grid-template-columns:1fr;text-align:center} }
        .hero img{width:100px;height:100px;object-fit:contain;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06)}
        .title{margin:0 0 6px;font-size:clamp(22px,3.5vw,34px);color:var(--text);line-height:1.12}
        .tag{display:inline-flex;gap:8px;align-items:center;background:rgba(44,76,151,.06);border:1px solid rgba(44,76,151,.2);color:#1d2a44;padding:6px 10px;border-radius:999px;font-weight:700}
        section{padding:38px 0}
        .h2{margin:0 0 10px;font-size:clamp(20px,3vw,28px);color:var(--text)}
        .p{margin:0;color:var(--muted)}
        .grid{display:grid;gap:16px}
        .grid-3{grid-template-columns:repeat(3,1fr)}
        @media (max-width:992px){.grid-3{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:576px){.grid-3{grid-template-columns:1fr}}
        .card{background:var(--surface);border:1px solid rgba(17,35,56,.08);border-radius:16px;padding:18px;box-shadow:var(--shadow);transition:transform .2s,box-shadow .3s}
        .card:hover{transform:translateY(-2px)}
        .values .v{display:flex;gap:10px}
        .v .dot{width:10px;height:10px;border-radius:50%;background:var(--brand);margin-top:8px}
        .stats{display:grid;gap:16px;grid-template-columns:repeat(3,1fr)}
        @media (max-width:576px){.stats{grid-template-columns:1fr}}
        .stat{background:#0e1a2b;color:#cbd5e1;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px;text-align:center}
        .stat b{display:block;font-size:28px;color:#fff}
        .team{display:grid;gap:16px;grid-template-columns:repeat(3,1fr)}
        @media (max-width:992px){.team{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:576px){.team{grid-template-columns:1fr}}
        .member{text-align:center}
        .avatar{width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid #eef2ff;box-shadow:0 10px 20px rgba(17,35,56,.12)}
        .name{margin:10px 0 4px;font-weight:800;color:var(--text)}
        .role{margin:0;color:var(--muted)}
        .timeline{position:relative;padding-left:16px}
        .timeline:before{content:"";position:absolute;left:0;top:4px;bottom:4px;width:4px;border-radius:4px;background:linear-gradient(var(--brand),var(--gold))}
        .milestone{background:#fff;border:1px solid rgba(17,35,56,.08);border-radius:12px;padding:12px 14px;margin:10px 0 10px 8px;box-shadow:var(--shadow)}
        .cta{display:flex;gap:12px;flex-wrap:wrap}
        .btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;border:1px solid transparent;font-weight:700;text-decoration:none;cursor:pointer}
        .btn-primary{background:var(--brand);color:#fff}
        .btn-outline{background:#fff;border-color:rgba(17,35,56,.12);color:#0f172a}
        /* reveal */
        .reveal{opacity:0;transform:translateY(8px)}
        .reveal.in{opacity:1;transform:translateY(0);transition:all .5s ease}
      `}</style>

      {/* HERO */}
      <div className="wrap hero">
        <div className="hero-card reveal">
          <img src={logo} alt="Box Cricket Logo" />
          <div>
            <div className="tag">About • Box Cricket</div>
            <h1 className="title">Fast-paced, enclosed-cage cricket built for today.</h1>
            <p className="p">We run premium box-cricket cages with rebound nets, LED floodlights, and digital scoring — plus a smooth booking experience online or on WhatsApp.</p>
            <div className="cta" style={{ marginTop: 12 }}>
              <a href="/" className="btn btn-outline">Home</a>
              <a href="/#booking" className="btn btn-primary">Book a Cage</a>
            </div>
          </div>
        </div>
      </div>

      {/* MISSION */}
      <section>
        <div className="wrap reveal">
          <h2 className="h2">Our Mission</h2>
          <p className="p">Make cricket more accessible with short, exciting formats in safe, modern cages — perfect for friends, families, and corporate teams.</p>
          <div className="grid stats" style={{ marginTop: 16 }}>
            <div className="stat">
              <b>{counts.matches}+</b>
              Matches Hosted
            </div>
            <div className="stat">
              <b>{counts.players}+</b>
              Players Served
            </div>
            <div className="stat">
              <b>{counts.ratings}★</b>
              Average Rating
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS BOX CRICKET */}
      <section>
        <div className="wrap reveal">
          <h2 className="h2">What is Box Cricket?</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Enclosed Cages</h3>
              <p className="p">High nets and side walls keep play safe and dynamic — rebounds are part of the game.</p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Short Formats</h3>
              <p className="p">5v5 or 6v6 teams with typical 6-over innings — more action per minute.</p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Digital Scoring</h3>
              <p className="p">Scoreboards, ball-by-ball logs, and umpire/scorer add-ons for leagues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="values">
        <div className="wrap reveal">
          <h2 className="h2">Values We Play By</h2>
          <div className="grid grid-3">
            {[
              { t: "Safety First", d: "Cushioned turf, strict gear checks, and clear rules." },
              { t: "Fair Play", d: "Neutral officials on request and transparent scoring." },
              { t: "Community", d: "Weekend mixers, office leagues, and beginner-friendly slots." },
            ].map((v, i) => (
              <div className="card v" key={i}>
                <div className="dot" />
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{v.t}</h3>
                  <p className="p" style={{ margin: 0 }}>{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section>
        <div className="wrap reveal">
          <h2 className="h2">Our Journey</h2>
          <div className="timeline">
            <div className="milestone"><b>2023:</b> First cage launched with premium turf and LED lights.</div>
            <div className="milestone"><b>2024:</b> Introduced digital scoring + mini-leagues for startups.</div>
            <div className="milestone"><b>2025:</b> Expanded to multi-cage format; WhatsApp booking & tournaments.</div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section>
        <div className="wrap reveal">
          <h2 className="h2">Meet the Team</h2>
          <p className="p">A tight crew that loves cricket and clean execution.</p>
          <div className="team" style={{ marginTop: 14 }}>
            <div className="card member">
              <img src={author1} alt="Yash Khalas" className="avatar" />
              <div className="name">Yash Khalas</div>
              <div className="role">Backend + Frontend Developer</div>
            </div>
           
            <div className="card member">
              <img
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
                alt="Hardik Chauhan"
                className="avatar"
              />
              <div className="name">Hardik Chauhan</div>
              <div className="role">Frontend + Project Guide</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="wrap reveal">
          <h2 className="h2">Ready to Play?</h2>
          <p className="p">Book a quick 6-over match or plan a weekend league — we’ll handle the rest.</p>
          <div className="cta" style={{ marginTop: 12 }}>
            <a href="/#booking" className="btn btn-primary">Book a Cage</a>
            <a href="/#pricing" className="btn btn-outline">See Pricing</a>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
