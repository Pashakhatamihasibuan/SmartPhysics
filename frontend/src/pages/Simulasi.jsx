import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Simulasi({ navigate, markProgress }) {
  const [mode, setMode] = useState("newton2");
  useEffect(() => { markProgress("simulasi"); }, []);

  const MODES = [
    { key: "newton2",  label: "F = m·a (Newton II)" },
    { key: "parabola", label: "Gerak Parabola"       },
    { key: "newton3",  label: "Aksi–Reaksi (Newton III)" },
  ];

  return (
    <div className="container">
      <div className="page-hero">
        <span className="label">Simulasi</span>
        <h1>Lab Fisika Digital</h1>
        <p>Ubah variabel dan amati perubahan realtime. Belajar lewat eksplorasi.</p>
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {MODES.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`btn btn-sm ${mode === m.key ? "btn-primary" : "btn-ghost"}`}>
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {mode === "newton2"  && <Newton2Sim navigate={navigate} />}
          {mode === "parabola" && <ParabolaSim />}
          {mode === "newton3"  && <Newton3Sim />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Slider row ── */
function Slider({ label, unit, value, min, max, step = 1, color, onChange }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--tx-2)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color }}>
          {value} <span style={{ fontSize: 11, color: "var(--tx-3)" }}>{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ accentColor: color }} />
    </div>
  );
}

/* ── Stat mini ── */
function StatBox({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: "center", padding: "0.85rem", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--tx-2)", marginTop: 2 }}>{label} ({unit})</div>
    </div>
  );
}

/* ══ NEWTON II ══ */
function Newton2Sim({ navigate }) {
  const [force, setForce]   = useState(20);
  const [mass,  setMass]    = useState(5);
  const [running, setRunning] = useState(false);
  const [pos, setPos]       = useState(0);
  const [vel, setVel]       = useState(0);
  const [time, setTime]     = useState(0);
  const rafRef  = useRef(null);
  const lastRef = useRef(null);
  const MAX = 280;

  const accel = parseFloat((force / mass).toFixed(2));

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false); setPos(0); setVel(0); setTime(0);
  }, []);

  useEffect(() => {
    if (!running) { cancelAnimationFrame(rafRef.current); return; }
    const a = force / mass;
    const step = ts => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
      lastRef.current = ts;
      setVel(v => {
        const nv = v + a * dt;
        setPos(p => {
          const np = p + nv * dt * 60;
          if (np >= MAX) { setRunning(false); lastRef.current = null; return MAX; }
          return np;
        });
        return nv;
      });
      setTime(t => parseFloat((t + dt).toFixed(2)));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, force, mass]);

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      {/* Controls */}
      <div className="card">
        <h3 style={{ marginBottom: "1.25rem" }}>Parameter</h3>
        <Slider label="Gaya (F)" unit="N" value={force} min={1} max={100} color="var(--amber)" onChange={v => { reset(); setForce(v); }} />
        <Slider label="Massa (m)" unit="kg" value={mass} min={1} max={30} color="var(--purple)" onChange={v => { reset(); setMass(v); }} />

        <div className="sim-formula" style={{ display: "block", marginBottom: "1.1rem", textAlign: "center" }}>
          a = {force} / {mass} = <strong style={{ color: "var(--teal)" }}>{accel} m/s²</strong>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
          <StatBox label="Percepatan" value={accel}                          unit="m/s²" color="var(--teal)"   />
          <StatBox label="Kecepatan"  value={parseFloat(vel.toFixed(1))}     unit="m/s"  color="var(--purple)" />
          <StatBox label="Waktu"      value={time}                           unit="s"    color="var(--amber)"  />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }}
            onClick={() => { if (!running) { lastRef.current = null; setRunning(true); } }}
            disabled={pos >= MAX || running}>
            {running ? "Berjalan..." : pos > 0 ? "Lanjutkan" : "▶ Mulai"}
          </button>
          <button className="btn btn-ghost" onClick={reset}>↺</button>
        </div>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8, justifyContent: "center" }} onClick={() => navigate("evaluasi")}>
          Ke Evaluasi →
        </button>
      </div>

      {/* Canvas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="card" style={{ padding: "1rem" }}>
          <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 8, fontWeight: 500 }}>Arena Simulasi</div>
          <div className="sim-canvas" style={{ height: 120 }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--border-2)" }} />
            {/* Arrow */}
            <div style={{ position: "absolute", top: "50%", left: pos + 68, height: 2, width: Math.min(force * 0.9, 80), background: "var(--amber)", transform: "translateY(-50%)", borderRadius: 1 }} />
            {/* Object */}
            <div style={{ position: "absolute", top: "50%", left: pos + 16, width: 48, height: 48, transform: "translateY(-50%)", background: "var(--purple-bg)", border: "1.5px solid var(--purple)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--purple)" }}>
              {mass}kg
            </div>
            {/* End line */}
            <div style={{ position: "absolute", top: 0, right: 8, bottom: 0, width: 1, background: "var(--green-bg)", borderRight: "1px dashed var(--green)" }} />
          </div>
        </div>

        {/* v-t graph */}
        <VTGraph vel={vel} accel={accel} time={time} running={running} />
      </div>
    </div>
  );
}

function VTGraph({ vel, accel, time, running }) {
  const pts = useRef([]);
  useEffect(() => {
    if (running) pts.current = [...pts.current, { t: time, v: parseFloat(vel.toFixed(2)) }].slice(-50);
    else if (time === 0) pts.current = [];
  }, [vel, time, running]);

  const W = 300, H = 80, maxT = 5, maxV = Math.max(accel * maxT, 5);
  const toP = (t, v) => ({ x: 10 + (t / maxT) * (W - 20), y: H - 8 - (v / maxV) * (H - 20) });
  const path = pts.current.length > 1 ? "M " + pts.current.map(p => `${toP(p.t, p.v).x},${toP(p.t, p.v).y}`).join(" L ") : null;

  return (
    <div className="card" style={{ padding: "0.85rem 1rem" }}>
      <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 6, fontWeight: 500 }}>Grafik v–t</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <line x1={10} y1={H-8} x2={W-10} y2={H-8} stroke="var(--border-2)" strokeWidth={1} />
        <line x1={10} y1={8}   x2={10}   y2={H-8}  stroke="var(--border-2)" strokeWidth={1} />
        <line x1={10} y1={H-8} x2={W-10} y2={H-8-(accel*maxT/maxV)*(H-20)} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 2" />
        {path && <path d={path} fill="none" stroke="var(--purple)" strokeWidth={2} strokeLinecap="round" />}
        <text x={W-8} y={H-2}  fontSize={9} fill="var(--tx-3)" textAnchor="end" fontFamily="var(--font-mono)">t(s)</text>
        <text x={13}  y={14}   fontSize={9} fill="var(--tx-3)" fontFamily="var(--font-mono)">v</text>
      </svg>
    </div>
  );
}

/* ══ PARABOLA ══ */
function ParabolaSim() {
  const [v0, setV0]       = useState(20);
  const [angle, setAngle] = useState(45);
  const [running, setRunning] = useState(false);
  const [obj, setObj]     = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [landed, setLanded] = useState(false);
  const rafRef = useRef(null);
  const tRef   = useRef(0);

  const g   = 9.8;
  const rad = (angle * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);
  const T   = (2 * v0y) / g;
  const R   = parseFloat((v0x * T).toFixed(1));
  const H   = parseFloat(((v0y * v0y) / (2 * g)).toFixed(1));
  const SX  = 260 / Math.max(R, 1);
  const SY  = 100 / Math.max(H, 1);
  const CH  = 150;

  const reset = () => { cancelAnimationFrame(rafRef.current); setRunning(false); setObj({x:0,y:0}); setTrail([]); setLanded(false); tRef.current = 0; };

  useEffect(() => {
    if (!running) return;
    const step = () => {
      tRef.current += 0.04;
      const t = tRef.current;
      const x = v0x * t, y = v0y * t - 0.5 * g * t * t;
      if (y < 0) { setLanded(true); setRunning(false); return; }
      const px = x * SX, py = CH - 20 - y * SY;
      setObj({ x: px, y: py });
      setTrail(tr => [...tr.slice(-80), { x: px, y: py }]);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <h3 style={{ marginBottom: "1.25rem" }}>Parameter</h3>
        <Slider label="Kecepatan Awal (v₀)" unit="m/s" value={v0} min={5} max={50} color="var(--teal)" onChange={v => { reset(); setV0(v); }} />
        <Slider label="Sudut (θ)" unit="°" value={angle} min={10} max={80} color="var(--purple)" onChange={v => { reset(); setAngle(v); }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1rem" }}>
          <StatBox label="Jarak Tempuh" value={R}                      unit="m"   color="var(--teal)"   />
          <StatBox label="Tinggi Maks"  value={H}                      unit="m"   color="var(--purple)" />
          <StatBox label="Waktu Total"  value={parseFloat(T.toFixed(2))} unit="s" color="var(--amber)"  />
          <StatBox label="Sudut"        value={angle}                  unit="°"   color="var(--blue)"   />
        </div>
        <div className="sim-formula" style={{ display: "block", textAlign: "center", marginBottom: "1rem" }}>
          x = v₀cosθ·t &nbsp;|&nbsp; y = v₀sinθ·t − ½gt²
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (!landed) setRunning(true); }}>
            {running ? "Terbang..." : "Tembak!"}
          </button>
          <button className="btn btn-ghost" onClick={reset}>↺</button>
        </div>
        {landed && <div style={{ marginTop: 8, fontSize: 13, color: "var(--green)", textAlign: "center" }}>Mendarat! Jarak: {R}m</div>}
      </div>

      <div className="card" style={{ padding: "1rem" }}>
        <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 8, fontWeight: 500 }}>Lintasan Parabola</div>
        <div className="sim-canvas" style={{ height: CH }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--border-2)" }} />
          {trail.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p.x + 20, top: p.y, width: 3, height: 3, borderRadius: "50%", background: `rgba(44,196,168,${i / trail.length * 0.8})` }} />
          ))}
          {!landed && trail.length > 0 && (
            <div style={{ position: "absolute", left: obj.x + 12, top: obj.y - 10, width: 20, height: 20, borderRadius: "50%", background: "var(--teal-bg)", border: "1.5px solid var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>●</div>
          )}
          <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--tx-3)" }}>θ = {angle}°</div>
        </div>
        <div className="sim-formula" style={{ display: "block", marginTop: 8, textAlign: "center", fontSize: 12 }}>
          R = {R}m · H = {H}m · T = {parseFloat(T.toFixed(2))}s
        </div>
      </div>
    </div>
  );
}

/* ══ NEWTON III ══ */
function Newton3Sim() {
  const [force, setForce] = useState(30);
  const [massA, setMassA] = useState(5);
  const [massB, setMassB] = useState(8);
  const aA = parseFloat((force / massA).toFixed(2));
  const aB = parseFloat((force / massB).toFixed(2));

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <h3 style={{ marginBottom: "1.25rem" }}>Parameter</h3>
        <Slider label="Gaya Aksi (F)" unit="N"  value={force} min={5} max={100} color="var(--amber)"  onChange={setForce} />
        <Slider label="Massa Benda A" unit="kg" value={massA} min={1} max={20}  color="var(--purple)" onChange={setMassA} />
        <Slider label="Massa Benda B" unit="kg" value={massB} min={1} max={20}  color="var(--red)"    onChange={setMassB} />
        <div className="sim-formula" style={{ display: "block", textAlign: "center", marginBottom: "1rem" }}>
          F_aksi = {force}N · F_reaksi = −{force}N
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1rem" }}>
          <StatBox label="Percepatan A" value={aA} unit="m/s²" color="var(--purple)" />
          <StatBox label="Percepatan B" value={aB} unit="m/s²" color="var(--red)"    />
        </div>
        <div className="card-flat" style={{ fontSize: 13, color: "var(--tx-2)", lineHeight: 1.6 }}>
          Gaya sama ({force}N), namun percepatan berbeda karena massa A ({massA}kg) ≠ massa B ({massB}kg).
        </div>
      </div>

      <div className="card" style={{ padding: "1rem" }}>
        <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 8, fontWeight: 500 }}>Visualisasi</div>
        <div className="sim-canvas" style={{ height: 130 }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--border-2)" }} />
          <motion.div animate={{ x: [-aA * 4, 0, -aA * 4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "50%", left: 24, width: 52, height: 52, transform: "translateY(-50%)", background: "var(--purple-bg)", border: "1.5px solid var(--purple)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 700, color: "var(--purple)", fontSize: 13 }}>A</span>
            <span style={{ fontSize: 10, color: "var(--tx-3)" }}>{massA}kg</span>
          </motion.div>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: "var(--amber)" }} />
          <motion.div animate={{ x: [aB * 4, 0, aB * 4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "50%", right: 24, width: 52, height: 52, transform: "translateY(-50%)", background: "var(--red-bg)", border: "1.5px solid var(--red)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 700, color: "var(--red)", fontSize: 13 }}>B</span>
            <span style={{ fontSize: 10, color: "var(--tx-3)" }}>{massB}kg</span>
          </motion.div>
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--tx-3)" }}>aksi = reaksi</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "var(--purple-bg)", borderRadius: "var(--r-sm)", fontSize: 12, color: "var(--purple)" }}>F_A→B = {force}N →</div>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "var(--red-bg)",    borderRadius: "var(--r-sm)", fontSize: 12, color: "var(--red)"    }}>← F_B→A = {force}N</div>
        </div>
      </div>
    </div>
  );
}
