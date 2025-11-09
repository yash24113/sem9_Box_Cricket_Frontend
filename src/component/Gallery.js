import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../Gallery.css";

/* ----- Media (add your own shots here) ----- */
const ALL_MEDIA = [
  // Action
  { src: "https://sportsnscoop.com/wp-content/uploads/2023/08/Untitled-3-1-1.jpg", alt: "Big hit – action shot", tag: "Action" },
  { src: "https://blog.cricheroes.com/wp-content/uploads/2023/12/How-to-Bowl-in-Box-Cricket.webp", alt: "Bowling in box cricket", tag: "Action" },

  // Night
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbHstjLyNrHN-V5p0Y4cBd1ZJ2IL8ZFROqg&s", alt: "Night game under LEDs", tag: "Night" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMq6U5EUHZr6Dy_4nmpIWBknpRzvf42EslWw&s", alt: "Box under floodlights", tag: "Night" },

  // Teams
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt2EK25rS3OBiiOSU6mVx1pop8rPjdzhCp8Q&s", alt: "Team huddle celebration", tag: "Teams" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxiLr7LWyZTLleBP8PuCkLFyJQTNPiYkKR4A&s", alt: "Post-match photo", tag: "Teams" },

  // Facilities
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqUPdsd7iqcrGl2QBwTiauJT2zJlgsS9dTmQ&s", alt: "Premium turf closeup", tag: "Facilities" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcJkoEZ4a4N0ama1MOP00LTq8LoX6HOS-a8FxmBZcqfANKYUhVhpD-5asjH_uaF_X_33s&usqp=CAU", alt: "Cage and nets", tag: "Facilities" },

  // Celebrations
  { src: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1600&auto=format&fit=crop", alt: "Trophy moment", tag: "Celebrations" },
  { src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop", alt: "Victory cheers", tag: "Celebrations" },

  // Extras (more variety)
  { src: "https://images.unsplash.com/photo-1558346547-6fc2b4f36e86?q=80&w=1600&auto=format&fit=crop", alt: "Quick single", tag: "Action" },
  { src: "https://images.unsplash.com/photo-1521417531039-94e9f71b1a5b?q=80&w=1600&auto=format&fit=crop", alt: "Sharp fielding", tag: "Action" },
  { src: "https://images.unsplash.com/photo-1573720953867-5f16e220fa98?q=80&w=1600&auto=format&fit=crop", alt: "Scoreboard & cage", tag: "Facilities" },
  { src: "https://images.unsplash.com/photo-1508094214213-0f1e56e46521?q=80&w=1600&auto=format&fit=crop", alt: "Team lineup", tag: "Teams" },
  { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop", alt: "Fans & friends", tag: "Celebrations" },
];

const uniqueTags = ["All", ...Array.from(new Set(ALL_MEDIA.map(m => m.tag)))];

const Gallery = () => {
  const navigate = useNavigate();

  /* ----- UI state ----- */
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("All");
  const [gridSize, setGridSize] = useState("m"); // s | m | l -> small/medium/large cells
  const [visible, setVisible] = useState(12); // "Load more"
  const [modalIdx, setModalIdx] = useState(-1); // -1 = closed

  /* ----- Reveal on scroll ----- */
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

  /* ----- Filtered list ----- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_MEDIA.filter((m) => {
      const tagOk = tag === "All" || m.tag === tag;
      const qOk = !q || m.alt.toLowerCase().includes(q) || m.tag.toLowerCase().includes(q);
      return tagOk && qOk;
    });
  }, [search, tag]);

  const toShow = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  /* ----- Modal handlers ----- */
  const openModal = useCallback((index) => setModalIdx(index), []);
  const closeModal = useCallback(() => setModalIdx(-1), []);
  const prevModal = useCallback(() => {
    setModalIdx((i) => (i <= 0 ? toShow.length - 1 : i - 1));
  }, [toShow.length]);
  const nextModal = useCallback(() => {
    setModalIdx((i) => (i >= toShow.length - 1 ? 0 : i + 1));
  }, [toShow.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (modalIdx < 0) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevModal();
      if (e.key === "ArrowRight") nextModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIdx, closeModal, prevModal, nextModal]);

  /* ----- CTA ----- */
  const handleBookNow = () => navigate("/arealist");

  return (
    <div className="gallery-page">
      {/* HERO */}
      <section className="g-hero">
        <div className="g-container">
          <div className="g-hero-card reveal">
            <div className="g-hero-copy">
              <div className="g-chip">Box Cricket • Photo Wall</div>
              <h1>Memories from the Cage</h1>
              <p>Fast games, safe rebounds, and big celebrations. Browse the best moments from our box cricket arena.</p>
              <div className="g-cta">
                <button className="btn btn-primary" onClick={handleBookNow}>Book a Slot</button>
                <a className="btn btn-outline" href="#grid">Jump to Gallery</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="g-controls">
        <div className="g-container reveal">
          <div className="g-controls-row">
            {/* Search */}
            <div className="g-search">
              <input
                type="text"
                placeholder="Search: action, night, teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search gallery"
              />
            </div>

            {/* Filters */}
            <div className="g-filters">
              {uniqueTags.map((t) => (
                <button
                  key={t}
                  className={`chip ${tag === t ? "is-active" : ""}`}
                  onClick={() => { setTag(t); setVisible(12); }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Grid size */}
            <div className="g-size">
              <span className="g-size-label">View:</span>
              {["s","m","l"].map((s) => (
                <button
                  key={s}
                  className={`chip ${gridSize === s ? "is-active" : ""}`}
                  onClick={() => setGridSize(s)}
                  aria-label={`Grid ${s}`}
                  title={s === "s" ? "Compact" : s === "m" ? "Comfort" : "Large"}
                >
                  {s === "s" ? "S" : s === "m" ? "M" : "L"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section id="grid" className="g-grid-wrap">
        <div className={`g-container reveal grid-${gridSize}`}>
          <div className="g-grid">
            {toShow.map((m, i) => (
              <figure key={`${m.src}-${i}`} className="g-card fade-in-up">
                <div className="g-img-wrap" onClick={() => openModal(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openModal(i)}>
                  <img
                    src={m.src}
                    alt={m.alt}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="g-img"
                  />
                  <span className="g-badge">{m.tag}</span>
                </div>
                <figcaption className="g-caption">
                  <div className="g-cap-title">{m.alt}</div>
                  <div className="g-cap-sub">#{m.tag.toLowerCase()}</div>
                </figcaption>
              </figure>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="g-empty">
              No results. Try another tag or search term.
            </div>
          )}

          {canLoadMore && (
            <div className="g-load">
              <button className="btn btn-primary" onClick={() => setVisible(v => v + 8)}>
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="g-stats">
        <div className="g-container reveal g-stats-row">
          <div className="g-stat"><b>1,500+</b><span>Matches Captured</span></div>
          <div className="g-stat"><b>8,000+</b><span>Players Featured</span></div>
          <div className="g-stat"><b>4.8★</b><span>Average Rating</span></div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="g-cta-footer">
        <div className="g-container reveal g-cta-card">
          <h2>Create Your Own Highlight</h2>
          <p>Bring your squad, pick a slot, and we’ll handle the rest — scoreboard, officials, and great vibes.</p>
          <div className="g-cta">
            <button className="btn btn-primary" onClick={handleBookNow}>Book Now</button>
            <a className="btn btn-outline" href="https://wa.me/919999999999" target="_blank" rel="noreferrer">WhatsApp Us</a>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {modalIdx >= 0 && (
        <div className="g-modal" onClick={closeModal} role="dialog" aria-modal="true">
          <button className="g-close" onClick={closeModal} aria-label="Close">×</button>
          <button className="g-nav g-prev" onClick={(e)=>{e.stopPropagation(); prevModal();}} aria-label="Previous">‹</button>
          <figure className="g-modal-fig" onClick={(e)=>e.stopPropagation()}>
            <img src={toShow[modalIdx].src} alt={toShow[modalIdx].alt} className="g-modal-img" />
            <figcaption className="g-modal-cap">
              <div className="g-cap-title">{toShow[modalIdx].alt}</div>
              <div className="g-cap-sub">#{toShow[modalIdx].tag?.toLowerCase()}</div>
              <div className="g-modal-actions">
                <a className="btn btn-outline" href={toShow[modalIdx].src} target="_blank" rel="noreferrer" download>
                  Download
                </a>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href.split("#")[0]);
                    alert("Page link copied!");
                  }}
                >
                  Share Link
                </button>
              </div>
            </figcaption>
          </figure>
          <button className="g-nav g-next" onClick={(e)=>{e.stopPropagation(); nextModal();}} aria-label="Next">›</button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
