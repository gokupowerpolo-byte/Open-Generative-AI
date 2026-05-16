"use client";

import { useState } from "react";

const SERVICES = [
  {
    id: "kling",
    name: "Kling AI",
    url: "https://klingai.com",
    quota: "~6 free videos / day",
    duration: "5–10s",
    quality: "Excellent — among the best free T2V",
    notes: "Sign in with Google. Pick Text-to-Video, paste prompt, generate.",
    color: "linear-gradient(135deg,#22d3ee,#3b82f6)",
  },
  {
    id: "hailuo",
    name: "Hailuo / MiniMax",
    url: "https://hailuoai.video",
    quota: "Daily free quota (refreshes ~24h)",
    duration: "6s",
    quality: "Very good motion, photoreal",
    notes: "Google sign-in. Free tier is generous; quality rivals paid models.",
    color: "linear-gradient(135deg,#a78bfa,#ec4899)",
  },
  {
    id: "pika",
    name: "Pika",
    url: "https://pika.art",
    quota: "Limited free credits per month",
    duration: "3–5s",
    quality: "Stylized, fast",
    notes: "Discord or Google login. Good for animated / illustrative styles.",
    color: "linear-gradient(135deg,#f59e0b,#ef4444)",
  },
  {
    id: "runway",
    name: "Runway",
    url: "https://runwayml.com",
    quota: "~125 free credits on signup (one-time)",
    duration: "5–10s",
    quality: "Industry-standard Gen-3 / Gen-4",
    notes: "Free credits don't renew. Use sparingly. Excellent quality.",
    color: "linear-gradient(135deg,#10b981,#06b6d4)",
  },
  {
    id: "vidu",
    name: "Vidu",
    url: "https://www.vidu.com",
    quota: "Daily free credits",
    duration: "4–8s",
    quality: "Good, fast generations",
    notes: "Google login. Refreshes daily; supports reference images.",
    color: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
  },
  {
    id: "leonardo",
    name: "Leonardo Motion",
    url: "https://leonardo.ai",
    quota: "150 free tokens / day",
    duration: "5s",
    quality: "Image-to-video focused",
    notes: "Generate an image first (free), then animate it with Motion.",
    color: "linear-gradient(135deg,#f43f5e,#a855f7)",
  },
  {
    id: "hf",
    name: "Hugging Face Spaces",
    url: "https://huggingface.co/spaces?search=text+to+video",
    quota: "Unlimited but queued",
    duration: "Varies",
    quality: "Open-source models (Wan, LTX, CogVideoX)",
    notes: "Slowest but truly free. Wait times depend on community load.",
    color: "linear-gradient(135deg,#facc15,#f97316)",
  },
  {
    id: "genmo",
    name: "Genmo (Mochi 1)",
    url: "https://www.genmo.ai/play",
    quota: "Limited free generations",
    duration: "5s",
    quality: "Open-source Mochi 1 model",
    notes: "Hosted version of the open-source Mochi model.",
    color: "linear-gradient(135deg,#06b6d4,#8b5cf6)",
  },
];

const PROMPT_STORAGE = "t2v_last_prompt";

export default function TextToVideoLauncher() {
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState("");

  async function copyAndOpen(service) {
    try {
      if (prompt.trim()) {
        await navigator.clipboard.writeText(prompt.trim());
        setCopied(service.id);
        setTimeout(() => setCopied(""), 1800);
        localStorage.setItem(PROMPT_STORAGE, prompt.trim());
      }
    } catch {}
    window.open(service.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logoDot} />
          <strong>Free Text → Video</strong>
          <span style={styles.tag}>launcher</span>
        </div>
        <a href="/studio" style={styles.linkBtn}>Full studio →</a>
      </header>

      <section style={styles.hero}>
        <h1 style={styles.h1}>Generate videos for free</h1>
        <p style={styles.sub}>
          Type your prompt once, then launch any of these services with it copied
          to your clipboard. Each has a free tier — no API key needed.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A neon-lit Tokyo alley in the rain, cinematic, slow dolly forward…"
          style={styles.textarea}
          rows={4}
        />
        <p style={styles.hint}>
          Click any service below — your prompt is copied to the clipboard so you
          can paste it (Ctrl/⌘ + V) into their text box.
        </p>
      </section>

      <section style={styles.grid}>
        {SERVICES.map((s) => (
          <button
            key={s.id}
            style={styles.card}
            onClick={() => copyAndOpen(s)}
            type="button"
          >
            <div style={{ ...styles.cardHeader, background: s.color }}>
              <span style={styles.cardName}>{s.name}</span>
              <span style={styles.cardOpen}>open ↗</span>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Free</span>
                <span style={styles.cardValue}>{s.quota}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Length</span>
                <span style={styles.cardValue}>{s.duration}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Quality</span>
                <span style={styles.cardValue}>{s.quality}</span>
              </div>
              <p style={styles.cardNotes}>{s.notes}</p>
              {copied === s.id && (
                <div style={styles.copied}>✓ Prompt copied — paste it on their page</div>
              )}
            </div>
          </button>
        ))}
      </section>

      <section style={styles.footer}>
        <h3 style={styles.h3}>Want it fully free with no quotas?</h3>
        <p style={styles.sub}>
          Run an open-source model locally with{" "}
          <a href="https://github.com/comfyanonymous/ComfyUI" target="_blank" rel="noopener noreferrer" style={styles.link}>
            ComfyUI
          </a>{" "}
          — needs a GPU with 12GB+ VRAM. Best free models today:{" "}
          <strong>Wan 2.1</strong>, <strong>LTX-Video</strong>,{" "}
          <strong>HunyuanVideo</strong>, <strong>CogVideoX</strong>,{" "}
          <strong>Mochi 1</strong>.
        </p>
      </section>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b0d12", color: "#e5e7eb", fontFamily: "var(--font-inter), system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1f2330" },
  brand: { display: "flex", alignItems: "center", gap: 10, fontSize: 16 },
  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#22d3ee,#a78bfa)" },
  tag: { fontSize: 12, opacity: 0.6, marginLeft: 8 },
  linkBtn: { background: "transparent", color: "#9ca3af", border: "1px solid #2a2f3d", padding: "6px 12px", borderRadius: 8, cursor: "pointer", textDecoration: "none", fontSize: 14 },
  hero: { maxWidth: 800, margin: "0 auto", padding: "40px 24px 24px", textAlign: "center" },
  h1: { fontSize: 36, fontWeight: 700, margin: "0 0 12px", background: "linear-gradient(135deg,#22d3ee,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  h3: { fontSize: 18, margin: "0 0 8px", color: "#e5e7eb" },
  sub: { fontSize: 15, color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.6 },
  textarea: { width: "100%", background: "#11141c", color: "#e5e7eb", border: "1px solid #2a2f3d", borderRadius: 12, padding: 14, fontSize: 15, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
  hint: { fontSize: 13, color: "#6b7280", margin: "12px 0 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, padding: "12px 24px 32px", maxWidth: 1400, margin: "0 auto" },
  card: { background: "#11141c", border: "1px solid #1f2330", borderRadius: 14, overflow: "hidden", cursor: "pointer", textAlign: "left", color: "#e5e7eb", padding: 0, transition: "transform 0.15s, border-color 0.15s", fontFamily: "inherit" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", color: "#0b0d12", fontWeight: 600 },
  cardName: { fontSize: 18 },
  cardOpen: { fontSize: 12, opacity: 0.85 },
  cardBody: { padding: 16, display: "flex", flexDirection: "column", gap: 8 },
  cardRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, fontSize: 13 },
  cardLabel: { color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 },
  cardValue: { color: "#e5e7eb", textAlign: "right" },
  cardNotes: { fontSize: 13, color: "#9ca3af", margin: "8px 0 0", lineHeight: 1.5 },
  copied: { marginTop: 10, padding: "6px 10px", background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 8, fontSize: 12, color: "#22d3ee" },
  footer: { maxWidth: 800, margin: "0 auto", padding: "16px 24px 48px", textAlign: "center", borderTop: "1px solid #1f2330" },
  link: { color: "#22d3ee", textDecoration: "none" },
};
