"use client";

import { useEffect, useRef, useState } from "react";

const MODELS = [
  { id: "seedance-lite-t2v", name: "Seedance Lite", durations: [3, 5, 10] },
  { id: "seedance-pro-t2v", name: "Seedance Pro", durations: [5, 10] },
  { id: "seedance-pro-t2v-fast", name: "Seedance Pro Fast", durations: [5, 10] },
  { id: "seedance-v1.5-pro-t2v", name: "Seedance v1.5 Pro", durations: [5, 10] },
  { id: "seedance-v2.0-t2v", name: "Seedance v2.0", durations: [5, 10] },
  { id: "kling-v2.1-master-t2v", name: "Kling v2.1 Master", durations: [5, 10] },
  { id: "kling-v2.6-pro-t2v", name: "Kling v2.6 Pro", durations: [5, 10] },
  { id: "veo3-text-to-video", name: "Veo 3", durations: [8] },
  { id: "veo3-fast-text-to-video", name: "Veo 3 Fast", durations: [8] },
  { id: "veo3.1-text-to-video", name: "Veo 3.1", durations: [8] },
  { id: "wan2.5-text-to-video", name: "Wan 2.5", durations: [5, 10] },
  { id: "wan2.6-text-to-video", name: "Wan 2.6", durations: [5, 10] },
  { id: "hunyuan-text-to-video", name: "Hunyuan", durations: [5] },
  { id: "minimax-hailuo-02-pro-t2v", name: "Hailuo 02 Pro", durations: [6, 10] },
  { id: "openai-sora-2-text-to-video", name: "Sora 2", durations: [4, 8, 12] },
  { id: "openai-sora-2-pro-text-to-video", name: "Sora 2 Pro", durations: [4, 8, 12] },
];

const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
const RESOLUTIONS = ["480p", "720p", "1080p"];

const KEY_STORAGE = "muapi_key";

export default function TextToVideo() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [aspect, setAspect] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [history, setHistory] = useState([]);
  const cancelRef = useRef(false);

  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem(KEY_STORAGE) : "";
    if (k) setApiKey(k);
    else setShowKey(true);
  }, []);

  const currentModel = MODELS.find((m) => m.id === model) || MODELS[0];

  useEffect(() => {
    if (!currentModel.durations.includes(duration)) {
      setDuration(currentModel.durations[0]);
    }
  }, [model]); // eslint-disable-line

  function saveKey() {
    localStorage.setItem(KEY_STORAGE, apiKey.trim());
    document.cookie = `muapi_key=${encodeURIComponent(apiKey.trim())}; path=/; max-age=2592000; SameSite=Lax`;
    setShowKey(false);
  }

  async function poll(requestId) {
    const url = `/api/api/v1/predictions/${requestId}/result`;
    for (let i = 0; i < 600; i++) {
      if (cancelRef.current) throw new Error("Cancelled");
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(url, { headers: { "x-api-key": apiKey } });
      if (!res.ok) {
        if (res.status >= 500) continue;
        throw new Error(`Poll failed: ${res.status}`);
      }
      const data = await res.json();
      const s = (data.status || "").toLowerCase();
      setMessage(`Status: ${s || "processing"}…`);
      if (["completed", "succeeded", "success"].includes(s)) return data;
      if (["failed", "error"].includes(s))
        throw new Error(data.error || "Generation failed");
    }
    throw new Error("Timed out waiting for video");
  }

  async function generate() {
    if (!apiKey) {
      setShowKey(true);
      return;
    }
    if (!prompt.trim()) {
      setMessage("Please enter a prompt.");
      return;
    }
    cancelRef.current = false;
    setStatus("running");
    setVideoUrl("");
    setMessage("Submitting…");
    try {
      const payload = {
        prompt: prompt.trim(),
        aspect_ratio: aspect,
        duration,
        resolution,
      };
      const res = await fetch(`/api/api/v1/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`API error ${res.status}: ${t.slice(0, 200)}`);
      }
      const submit = await res.json();
      const requestId = submit.request_id || submit.id;
      if (!requestId) throw new Error("No request_id returned");
      setMessage(`Queued as ${requestId.slice(0, 8)}… polling for result.`);
      const result = await poll(requestId);
      const url = result.outputs?.[0] || result.url || result.output?.url;
      if (!url) throw new Error("No output URL returned");
      setVideoUrl(url);
      setHistory((h) => [{ url, prompt: prompt.trim(), model, ts: Date.now() }, ...h].slice(0, 12));
      setStatus("done");
      setMessage("Done.");
    } catch (e) {
      setStatus("error");
      setMessage(e.message || String(e));
    }
  }

  function cancel() {
    cancelRef.current = true;
    setStatus("idle");
    setMessage("Cancelled.");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logoDot} />
          <strong>Text → Video</strong>
          <span style={styles.tag}>Open Generative AI</span>
        </div>
        <button style={styles.linkBtn} onClick={() => setShowKey(true)}>
          {apiKey ? "Change API key" : "Set API key"}
        </button>
      </header>

      {showKey && (
        <div style={styles.keyBar}>
          <input
            type="password"
            placeholder="Enter your MUAPI key (stored in your browser)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={styles.keyInput}
          />
          <button style={styles.primary} onClick={saveKey} disabled={!apiKey.trim()}>
            Save
          </button>
        </div>
      )}

      <main style={styles.main}>
        <section style={styles.left}>
          <label style={styles.label}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A neon-lit Tokyo alley in the rain, cinematic, slow dolly forward…"
            style={styles.textarea}
            rows={6}
          />

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} style={styles.select}>
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Aspect</label>
              <select value={aspect} onChange={(e) => setAspect(e.target.value)} style={styles.select}>
                {ASPECT_RATIOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Resolution</label>
              <select value={resolution} onChange={(e) => setResolution(e.target.value)} style={styles.select}>
                {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Duration (s)</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={styles.select}>
                {currentModel.durations.map((d) => <option key={d} value={d}>{d}s</option>)}
              </select>
            </div>
          </div>

          <div style={styles.actions}>
            {status === "running" ? (
              <button style={styles.danger} onClick={cancel}>Cancel</button>
            ) : (
              <button style={styles.primary} onClick={generate} disabled={!prompt.trim()}>
                Generate video
              </button>
            )}
            <span style={styles.message}>{message}</span>
          </div>
        </section>

        <section style={styles.right}>
          <div style={styles.preview}>
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay loop style={styles.video} />
            ) : (
              <div style={styles.placeholder}>
                {status === "running" ? <Spinner /> : <span>Your video will appear here</span>}
              </div>
            )}
          </div>
          {videoUrl && (
            <a href={videoUrl} download style={styles.download}>Download video ↓</a>
          )}

          {history.length > 0 && (
            <>
              <h3 style={styles.historyTitle}>Recent</h3>
              <div style={styles.historyGrid}>
                {history.map((h) => (
                  <button
                    key={h.ts}
                    style={styles.historyItem}
                    onClick={() => setVideoUrl(h.url)}
                    title={h.prompt}
                  >
                    <video src={h.url} muted style={styles.historyVideo} />
                    <span style={styles.historyPrompt}>{h.prompt.slice(0, 50)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.15)",
        borderTopColor: "#22d3ee",
        animation: "spin 1s linear infinite",
      }} />
      <span style={{ opacity: 0.7 }}>Generating… this can take 1–5 minutes</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b0d12", color: "#e5e7eb", fontFamily: "var(--font-inter), system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1f2330" },
  brand: { display: "flex", alignItems: "center", gap: 10, fontSize: 16 },
  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#22d3ee,#a78bfa)" },
  tag: { fontSize: 12, opacity: 0.6, marginLeft: 8 },
  linkBtn: { background: "transparent", color: "#9ca3af", border: "1px solid #2a2f3d", padding: "6px 12px", borderRadius: 8, cursor: "pointer" },
  keyBar: { display: "flex", gap: 8, padding: "12px 24px", background: "#11141c", borderBottom: "1px solid #1f2330" },
  keyInput: { flex: 1, background: "#0b0d12", color: "#e5e7eb", border: "1px solid #2a2f3d", borderRadius: 8, padding: "8px 12px", fontSize: 14 },
  main: { display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: 24, padding: 24, maxWidth: 1400, margin: "0 auto" },
  left: { display: "flex", flexDirection: "column", gap: 14 },
  right: { display: "flex", flexDirection: "column", gap: 14 },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "#9ca3af", marginBottom: 6 },
  textarea: { width: "100%", background: "#11141c", color: "#e5e7eb", border: "1px solid #2a2f3d", borderRadius: 10, padding: 12, fontSize: 14, resize: "vertical", fontFamily: "inherit" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column" },
  select: { background: "#11141c", color: "#e5e7eb", border: "1px solid #2a2f3d", borderRadius: 8, padding: "8px 10px", fontSize: 14 },
  actions: { display: "flex", alignItems: "center", gap: 12, marginTop: 8 },
  primary: { background: "linear-gradient(135deg,#22d3ee,#a78bfa)", color: "#0b0d12", border: "none", padding: "10px 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  danger: { background: "#ef4444", color: "white", border: "none", padding: "10px 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
  message: { fontSize: 13, color: "#9ca3af" },
  preview: { aspectRatio: "16/9", background: "#11141c", border: "1px solid #1f2330", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
  placeholder: { color: "#6b7280", fontSize: 14 },
  video: { width: "100%", height: "100%", objectFit: "contain", background: "#000" },
  download: { color: "#22d3ee", fontSize: 14, textDecoration: "none" },
  historyTitle: { fontSize: 13, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, margin: "8px 0 0" },
  historyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 },
  historyItem: { background: "#11141c", border: "1px solid #1f2330", borderRadius: 10, overflow: "hidden", cursor: "pointer", padding: 0, textAlign: "left", color: "#e5e7eb" },
  historyVideo: { width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#000" },
  historyPrompt: { display: "block", fontSize: 12, padding: "6px 8px", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
};
