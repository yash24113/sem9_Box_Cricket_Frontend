// src/pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "../assets/logo.png";
import About from "./About";

const API_ROOT =
  process.env.REACT_APP_API_ROOT || "http://localhost:5000/api/userapi";

/* ------------------- content ------------------- */
const heroSlides = [
  {
    img: "https://content.jdmagicbox.com/v2/comp/hyderabad/s3/040pxx40.xx40.210203205029.m9s3/catalogue/sixer-zone-box-cricket-uppal-hyderabad-cricket-turf-grounds-2xief16ulc.jpg",
    h: "Book Your Cage in Minutes",
    p: "Pick an area, choose a time, pay securely — you’re ready to play.",
    badge: "Quick • Simple • Secure",
  },
  {
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbHstjLyNrHN-V5p0Y4cBd1ZJ2IL8ZFROqg&s",
    h: "LED Nights • Premium Turf",
    p: "Play late with bright floodlights and perfect bounce. Leagues welcome.",
    badge: "Evening Slots Open",
  },
  {
    img: "https://aesports.world/wp-content/uploads/elementor/thumbs/Ae-Box-Cricket-3-scaled-qo09prdyyj3wr3hmtki0ieg1jcrntzxszlizmoaap8.jpg",
    h: "6-Over Thrillers, Big Fun",
    p: "Fast matches, fair rules, and digital scoring add-ons.",
    badge: "Weekend Rush",
  },
];

const galleryThumbs = [
  "https://content.jdmagicbox.com/v2/comp/hyderabad/s3/040pxx40.xx40.210203205029.m9s3/catalogue/sixer-zone-box-cricket-uppal-hyderabad-cricket-turf-grounds-2xief16ulc.jpg",
  "https://content.jdmagicbox.com/v2/comp/hyderabad/s3/040pxx40.xx40.210203205029.m9s3/catalogue/sixer-zone-box-cricket-uppal-hyderabad-cricket-turf-grounds-2xief16ulc.jpg",
  "https://content.jdmagicbox.com/v2/comp/hyderabad/s3/040pxx40.xx40.210203205029.m9s3/catalogue/sixer-zone-box-cricket-uppal-hyderabad-cricket-turf-grounds-2xief16ulc.jpg",
  "https://content.jdmagicbox.com/v2/comp/hyderabad/s3/040pxx40.xx40.210203205029.m9s3/catalogue/sixer-zone-box-cricket-uppal-hyderabad-cricket-turf-grounds-2xief16ulc.jpg",
  "https://content.jdmagicbox.com/v2/comp/hyderabad/s3/040pxx40.xx40.210203205029.m9s3/catalogue/sixer-zone-box-cricket-uppal-hyderabad-cricket-turf-grounds-2xief16ulc.jpg",
];

/* =============================================================== */

export default function Home() {
  /* carousels */
  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 700,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3200,
      arrows: false,
      pauseOnHover: true,
    }),
    []
  );

  const gallerySettings = useMemo(
    () => ({
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2200,
      responsive: [
        { breakpoint: 980, settings: { slidesToShow: 2 } },
        { breakpoint: 640, settings: { slidesToShow: 1 } },
      ],
    }),
    []
  );

  /* stats */
  const [stats, setStats] = useState({ matches: 0, players: 0, rating: 0 });
  useEffect(() => {
    const animate = (k, to, ms = 1000, base = 0) => {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / ms, 1);
        const v = k === "rating" ? (4 + (to - 4) * p).toFixed(1) : Math.floor((to - base) * p + base);
        setStats((s) => ({ ...s, [k]: Number(v) }));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    animate("matches", 1500, 1100);
    animate("players", 8000, 1200);
    animate("rating", 4.8, 900, 4);
  }, []);

  /* helpers */
  const once = (r) => (r.current ? false : ((r.current = true), true));

  const fetchJson = async (url, { timeoutMs = 12000 } = {}) => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ac.signal,
        mode: "cors",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  };

  /* API: Popular areas */
  const [slots, setSlots] = useState([]);
  const [slotsErr, setSlotsErr] = useState("");
  const gotSlots = useRef(false);

  useEffect(() => {
    if (!once(gotSlots)) return;
    (async () => {
      try {
        const json = await fetchJson(`${API_ROOT}/viewAreaWiseSlot`);
        const list = Array.isArray(json?.data) ? json.data : [];
        const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSlots(sorted.slice(0, 3));
        setSlotsErr("");
      } catch {
        setSlotsErr("Could not load slots.");
      }
    })();
  }, []);

  /* API: Feedback */
  const [feedback, setFeedback] = useState([]);
  const [fbErr, setFbErr] = useState("");
  const gotFb = useRef(false);

  useEffect(() => {
    if (!once(gotFb)) return;
    (async () => {
      try {
        const json = await fetchJson(`${API_ROOT}/viewFeedback`);
        const list = Array.isArray(json?.data) ? json.data : [];
        setFeedback(list.slice(-3).reverse());
        setFbErr("");
      } catch {
        setFbErr("Could not load feedback.");
      }
    })();
  }, []);

  const hasSlots = slots.length > 0;
  const hasFb = feedback.length > 0;

  /* How-it-works: replays on enter AND exit */
  const howRef = useRef(null);
  useEffect(() => {
    const el = howRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("play");   // start animations
        } else {
          // remove and force reflow so next enter restarts animations
          el.classList.remove("play");
          // force reflow to restart CSS keyframes reliably
          // eslint-disable-next-line no-unused-expressions
          el.offsetWidth;
        }
      },
      { threshold: 0.35, rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{css}</style>

      {/* ================= HERO (full-bleed) ================= */}
      <section className="hero">
        <div className="hero__slider">
          <Slider {...sliderSettings}>
            {heroSlides.map((s, i) => (
              <div key={i} className="hero__slide">
                <img src={s.img} alt={s.h} />
                <div className="hero__overlay" />
                <div className="hero__cap container">
                  <span className="badge">{s.badge}</span>
                  <h1>{s.h}</h1>
                  <p>{s.p}</p>
                  <div className="actions">
                    <a className="btn btn--primary" href="/arealist">Book a Cage</a>
                    <a className="btn btn--ghost" href="/#pricing">See Pricing</a>
                    <a className="btn btn--light" href="/gallery">View Gallery</a>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* <div className="hero__stats container">
          <div className="stat"><b>{stats.matches}+</b><span>Matches</span></div>
          <div className="stat"><b>{stats.players}+</b><span>Players</span></div>
          <div className="stat"><b>{stats.rating}★</b><span>Avg Rating</span></div>
        </div> */}
      </section>

      {/* ================= ABOUT (SECOND) ================= */}
      <section className="about">
        <About />
      </section>

      {/* ================= GALLERY ================= */}
      <section className="gallery">
        <div className="container">
          <div className="sec-head">
            <h2>Gallery</h2>
            <a className="link" href="/gallery">See all photos →</a>
          </div>
          <Slider {...gallerySettings}>
            {galleryThumbs.map((src, idx) => (
              <div key={idx} className="gal__item">
                <img src={src} alt={`Gallery ${idx + 1}`} />
              </div>
            ))}
          </Slider>
          <div className="center">
            <a className="btn btn--primary" href="/gallery">Open Full Gallery</a>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (centered + retrigger) ================= */}
      <section className="how" ref={howRef}>
        <div className="how__wrap">
          <h2>How it works</h2>
          <ol className="timeline">
            {[
              { t: "Choose Area", d: <>Pick your location from the <a href="/arealist">area list</a>.</> },
              { t: "Select Date & Slot", d: "Check live availability and durations." },
              { t: "Pay & Get Ticket", d: "Secure checkout with instant ticket on screen & email." },
              { t: "Show Up & Play 🏏", d: "Arrive 10 minutes early — lights & setup are ready." },
            ].map((step, i) => (
              <li className={`node node-${i + 1}`} key={i}>
                <div className="dot" />
                <div className="content">
                  <h4>{step.t}</h4>
                  <p>{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= POPULAR AREAS (API) ================= */}
      <section className="areas">
        <div className="container">
          <h2>Popular areas</h2>

          {!hasSlots && !slotsErr && (
            <div className="skeleton-grid">
              <div className="sk" />
              <div className="sk" />
              <div className="sk" />
            </div>
          )}
          {slotsErr && !hasSlots && <div className="error">{slotsErr}</div>}

          {hasSlots && (
            <div className="grid-3">
              {slots.map((s) => {
                const area = s?.area?.area_name || "—";
                return (
                  <div key={s._id} className="area card">
                    <div className="area__head">
                      <h4>{area}</h4>
                      <span className="chip">₹{s.price}</span>
                    </div>
                    <div className="area__meta">
                      Slot: {s.slot_start_time} – {s.slot_end_time}
                    </div>
                    <a className="btn btn--light w-100" href="/arealist">View Slots</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= FEEDBACK (API) ================= */}
      <section className="testimonials">
        <div className="container">
          <h2>Players say…</h2>

          {!hasFb && !fbErr && (
            <div className="skeleton-grid">
              <div className="sk" />
              <div className="sk" />
              <div className="sk" />
            </div>
          )}
          {fbErr && !hasFb && <div className="error">{fbErr}</div>}

          {hasFb && (
            <div className="grid-3">
              {feedback.map((f) => {
                const name = `${f.fname || ""} ${f.lname || ""}`.trim() || "User";
                const ini =
                  (f.fname?.[0] || "U").toUpperCase() +
                  (f.lname?.[0] || "").toUpperCase();
                return (
                  <figure key={f._id} className="fb card">
                    <div className="fb__head">
                      <div className="fb__avatar">{ini}</div>
                      <div>
                        <div className="fb__name">{name}</div>
                        <div className="fb__sub">{f.email}</div>
                      </div>
                    </div>
                    <blockquote className="fb__quote">{f.query || "—"}</blockquote>
                    <div className="fb__rating">{f.rating}</div>
                  </figure>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta">
        <div className="container cta__inner">
          <div>
            <h3>Ready to play?</h3>
            <p>Grab a slot now or explore pricing for weekends and leagues.</p>
          </div>
          <div className="cta__actions">
            <a className="btn btn--primary" href="/arealist">Book Now</a>
            <a className="btn btn--ghost" href="/#pricing">See Pricing</a>
            <a className="btn btn--light" href="/gallery">Open Gallery</a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- CSS ---------------- */
const css = `
:root{
  --green:#0b7a10;
  --ink:#0e1a2b;
  --muted:#64748b;
  --card:#ffffff;
  --ring:rgba(11,122,16,.18);
  --shadow:0 18px 50px rgba(2,25,8,.12);
  --radius:18px;
}

/* layout */
.container{max-width:1100px;margin:0 auto;padding:0 18px}
h2{margin:0 0 12px;color:var(--ink);font-size:clamp(20px,3vw,28px)}
a{color:var(--green);text-decoration:none}
.card{background:#fff;border:1px solid #edf2ee;border-radius:18px;box-shadow:var(--shadow);padding:16px}
.error{color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;padding:10px 12px;border-radius:12px}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:800;
  padding:12px 18px;border-radius:999px;border:1px solid transparent;text-decoration:none;
  transition:transform .15s,box-shadow .25s,background .2s}
.btn:active{transform:translateY(1px)}
.btn--primary{background:var(--green);color:#fff;box-shadow:0 10px 26px rgba(11,122,16,.3)}
.btn--ghost{background:#fff;color:#ink;border-color:#e5e7eb}
.btn--light{background:#f3fff5;color:var(--green)}
.w-100{width:100%}

/* skeletons */
.skeleton-grid{display:grid;gap:12px;grid-template-columns:repeat(3,1fr)}
.sk{height:110px;border-radius:16px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);
  background-size:200% 100%;animation:sh 1.2s infinite}
@keyframes sh{0%{background-position:0 0}100%{background-position:200% 0}}

/* HERO — full width */
.hero{background:#f8fff9}
.hero__slider{width:100%;max-width:100%;margin:0}
.hero__slide{position:relative;height:clamp(360px,42vw,560px);overflow:hidden}
.hero__slide img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.03)}
.hero__slide:hover img{transform:scale(1.06);transition:transform 4s ease}
.hero__overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.15) 35%,rgba(0,0,0,.45))}
.hero__cap{position:absolute;left:0;right:0;bottom:clamp(14px,6vw,48px);color:#fff}
.hero__cap .badge{display:inline-block;margin-left:18px}
.hero .container{max-width:1100px}
.hero__cap h1{margin:4px 0 6px;font-size:clamp(22px,4.5vw,44px);line-height:1.1}
.hero__cap p{margin:0 0 12px;font-size:clamp(14px,2.2vw,18px);opacity:.95}
.badge{display:inline-block;background:rgba(255,255,255,.18);backdrop-filter:blur(6px);
  border:1px solid rgba(255,255,255,.4);padding:6px 10px;border-radius:999px;font-weight:800;margin-bottom:6px}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-left:18px}
.hero__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px auto 22px;max-width:1100px;padding:0 18px}
.stat{background:#fff;border:1px solid #e9f3ea;border-radius:16px;padding:12px;text-align:center;box-shadow:var(--shadow)}
.stat b{display:block;font-size:26px;color:var(--green)}

/* ABOUT wrapper spacing */
.about{padding:22px 0;background:#f9fffa}

/* GALLERY */
.gallery{padding:18px 0 8px;background:#fff}
.sec-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.link{font-weight:800}
.gal__item{padding:6px}
.gal__item img{width:100%;height:260px;object-fit:cover;border-radius:16px;border:1px solid #edf2ee;box-shadow:var(--shadow)}
.center{text-align:center;margin-top:12px}

/* HOW — centered + retriggering animation */
.how{padding:24px 0;background:#fff}
.how__wrap{width:100%;max-width:760px;margin:0 auto;padding:0 18px;position:relative}
.how__wrap h2{text-align:center;margin-bottom:8px}
.timeline{position:relative;margin:18px 0 0;padding-left:22px}
.timeline:before{content:"";position:absolute;left:8px;top:0;bottom:0;width:4px;border-radius:4px;background:linear-gradient(var(--green),#9bd3a0);
  transform:scaleY(0);transform-origin:top}
.play .timeline:before{animation:grow 1200ms ease-out forwards}
@keyframes grow{to{transform:scaleY(1)}}
.node{position:relative;display:flex;gap:12px;margin:14px 0;opacity:.0;transform:translateY(8px)}
.play .node-1{animation:reveal .45s .2s ease-out forwards}
.play .node-2{animation:reveal .45s .45s ease-out forwards}
.play .node-3{animation:reveal .45s .7s ease-out forwards}
.play .node-4{animation:reveal .45s .95s ease-out forwards}
@keyframes reveal{to{opacity:1;transform:translateY(0)}}
.dot{position:absolute;left:-2px;top:6px;width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid var(--green);box-shadow:0 0 0 4px rgba(11,122,16,.08)}
.content{background:#fff;border:1px solid #edf2ee;border-radius:14px;padding:12px;box-shadow:var(--shadow);flex:1}
.content h4{margin:0 0 4px;color:var(--ink)}
.content p{margin:0;color:#64748b}

/* AREAS (API) */
.areas{padding:16px 0;background:#fff}
.grid-3{display:grid;gap:12px;grid-template-columns:repeat(3,1fr)}
@media (max-width:900px){.grid-3{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.grid-3{grid-template-columns:1fr}}
.area{padding:14px}
.area__head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.area__head h4{margin:0;color:var(--ink)}
.area__meta{color:#64748b;margin-bottom:10px}
.chip{background:#ecfdf0;color:#0b7a10;padding:4px 10px;border-radius:999px;font-weight:800;font-size:12px}

/* FEEDBACK */
.testimonials{padding:18px 0;background:#f7fff7}
.grid-3{display:grid;gap:12px}
.fb__head{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.fb__avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;
  font-weight:900;color:#fff;background:linear-gradient(135deg,#2c4c97,#1e3a8a)}
.fb__name{font-weight:800;color:#0f172a}
.fb__sub{font-size:12px;color:#6b7280}
.fb__quote{margin:0;color:#111827}
.fb__rating{margin-top:8px;font-weight:800;color:#065f46}

/* CTA */
.cta{padding:22px 0 40px;background:#fff}
.cta__inner{border:1px solid #edf2ee;border-radius:18px;padding:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(180deg,#fafffb,#ffffff);box-shadow:var(--shadow)}
@media (max-width:720px){.cta__inner{flex-direction:column;text-align:center}}
.cta__actions{display:flex;gap:10px;flex-wrap:wrap}
`;
