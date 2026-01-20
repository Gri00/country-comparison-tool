"use client";

import React, { useEffect, useRef, useState } from "react";

type Star = { x: number; y: number; r: number; v: number };
type Enemy = { x: number; y: number; r: number; vx: number; vy: number };
type Bullet = { x: number; y: number; vx: number; vy: number; life: number };

const HIGH_SCORE_KEY = "space_shooter_highscore";

export default function SpaceShooter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastShotRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 860, h: 420 });

  const starsRef = useRef<Star[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const shipRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, r: 10 });

  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [best, setBest] = useState(0);

  const taxIconRef = useRef<HTMLImageElement | null>(null);

  // Load best score
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      const n = saved ? Number(saved) : 0;
      setBest(Number.isFinite(n) ? n : 0);
    } catch {
      setBest(0);
    }
  }, []);

  // Load icon
  useEffect(() => {
    const img = new Image();
    img.src = "/images/no-tax.png";
    taxIconRef.current = img;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(320, Math.min(980, Math.floor(rect.width)));
      const h = 420;
      setSize({ w, h });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Init stars
  useEffect(() => {
    const s: Star[] = [];
    for (let i = 0; i < 120; i++) {
      s.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.6 + 0.4,
        v: Math.random() * 0.35 + 0.05,
      });
    }
    starsRef.current = s;
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(
          e.key.toLowerCase(),
        )
      ) {
        e.preventDefault();
      }
    };

    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down as any);
      window.removeEventListener("keyup", up as any);
    };
  }, []);

  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));

  const resetGame = () => {
    setScore(0);
    setHp(3);
    enemiesRef.current = [];
    bulletsRef.current = [];
    shipRef.current = {
      x: size.w * 0.2,
      y: size.h * 0.5,
      vx: 0,
      vy: 0,
      r: 10,
    };
    lastShotRef.current = 0;
    lastSpawnRef.current = 0;
  };

  // keep ship positioned nicely on resize
  useEffect(() => {
    shipRef.current = {
      ...shipRef.current,
      x: size.w * 0.2,
      y: size.h * 0.5,
    };
  }, [size.w, size.h]);

  const shoot = (now: number) => {
    const cooldown = 220;
    if (now - lastShotRef.current < cooldown) return;
    lastShotRef.current = now;

    const ship = shipRef.current;
    bulletsRef.current.push({
      x: ship.x + ship.r + 2,
      y: ship.y,
      vx: 7.0,
      vy: 0,
      life: 120,
    });
  };

  const spawnEnemy = (now: number) => {
    const base = 720;
    if (now - lastSpawnRef.current < base) return;
    lastSpawnRef.current = now;

    const r = 12 + Math.random() * 14;
    const y = 40 + Math.random() * (size.h - 80);
    const speed = 1.25 + Math.random() * 0.9;

    enemiesRef.current.push({
      x: size.w + r + 10,
      y,
      r,
      vx: -speed,
      vy: (Math.random() - 0.5) * 0.7,
    });
  };

  const collide = (
    ax: number,
    ay: number,
    ar: number,
    bx: number,
    by: number,
    br: number,
  ) => {
    const dx = ax - bx;
    const dy = ay - by;
    const rr = ar + br;
    return dx * dx + dy * dy <= rr * rr;
  };

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const startLoop = () => {
    stopLoop();
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;

      // background stars
      const STAR_SPEED = 0.1;
      for (const st of starsRef.current) {
        st.x -= st.v * STAR_SPEED * (dt / 16);
        if (st.x < -0.02) {
          st.x = 1.02;
          st.y = Math.random();
          st.r = Math.random() * 1.6 + 0.4;
          st.v = Math.random() * 0.35 + 0.05;
        }
      }

      // input
      const keys = keysRef.current;
      const ship = shipRef.current;

      const acc = 0.55 * (dt / 16);
      const maxV = 5.6;
      const friction = 0.92;

      const up = keys["w"] || keys["arrowup"];
      const down = keys["s"] || keys["arrowdown"];
      const left = keys["a"] || keys["arrowleft"];
      const right = keys["d"] || keys["arrowright"];

      if (up) ship.vy -= acc;
      if (down) ship.vy += acc;
      if (left) ship.vx -= acc;
      if (right) ship.vx += acc;

      ship.vx = clamp(ship.vx, -maxV, maxV);
      ship.vy = clamp(ship.vy, -maxV, maxV);

      ship.x += ship.vx;
      ship.y += ship.vy;

      ship.vx *= friction;
      ship.vy *= friction;

      ship.x = clamp(ship.x, 18, size.w - 18);
      ship.y = clamp(ship.y, 18, size.h - 18);

      // shoot
      const space = keys[" "] || keys["space"];
      if (space) shoot(now);

      // spawn enemies
      spawnEnemy(now);

      // bullets
      for (const b of bulletsRef.current) {
        b.x += b.vx * (dt / 16);
        b.y += b.vy * (dt / 16);
        b.life -= 1;
      }
      bulletsRef.current = bulletsRef.current.filter(
        (b) => b.life > 0 && b.x < size.w + 40,
      );

      // enemies
      for (const e of enemiesRef.current) {
        e.x += e.vx * (dt / 16);
        e.y += e.vy * (dt / 16);
        if (e.y < 30 || e.y > size.h - 30) e.vy *= -1;
      }
      enemiesRef.current = enemiesRef.current.filter((e) => e.x > -80);

      // bullet-enemy collision
      let gained = 0;
      const removedEnemy = new Set<number>();

      for (let i = 0; i < enemiesRef.current.length; i++) {
        const e = enemiesRef.current[i];
        for (let j = 0; j < bulletsRef.current.length; j++) {
          const b = bulletsRef.current[j];
          if (collide(e.x, e.y, e.r, b.x, b.y, 3)) {
            removedEnemy.add(i);
            b.life = 0;
            gained += 1;
            break;
          }
        }
      }

      if (removedEnemy.size) {
        enemiesRef.current = enemiesRef.current.filter(
          (_, idx) => !removedEnemy.has(idx),
        );
      }
      if (gained) setScore((s) => s + gained);

      // ship-enemy collision
      let hit = false;
      for (const e of enemiesRef.current) {
        if (collide(e.x, e.y, e.r, ship.x, ship.y, ship.r)) {
          hit = true;
          break;
        }
      }
      if (hit) {
        const idx = enemiesRef.current.findIndex((e) =>
          collide(e.x, e.y, e.r, ship.x, ship.y, ship.r),
        );
        if (idx >= 0) enemiesRef.current.splice(idx, 1);
        setHp((h) => h - 1);
      }

      // render
      el.width = size.w * devicePixelRatio;
      el.height = size.h * devicePixelRatio;
      el.style.width = `${size.w}px`;
      el.style.height = `${size.h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, size.w, size.h);
      grad.addColorStop(0, "#0b0b12");
      grad.addColorStop(1, "#070712");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size.w, size.h);

      // stars
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const st of starsRef.current) {
        ctx.beginPath();
        ctx.arc(st.x * size.w, st.y * size.h, st.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= size.w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.h);
        ctx.stroke();
      }
      for (let y = 0; y <= size.h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size.w, y);
        ctx.stroke();
      }

      // bullets
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (const b of bulletsRef.current) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // enemies (icons)
      const img = taxIconRef.current;
      for (const e of enemiesRef.current) {
        if (img && img.complete && img.naturalWidth > 0) {
          const iconSize = e.r * 2.2;
          ctx.save();
          ctx.shadowColor = "rgba(255, 80, 80, 0.35)";
          ctx.shadowBlur = 14;
          ctx.drawImage(
            img,
            e.x - iconSize / 2,
            e.y - iconSize / 2,
            iconSize,
            iconSize,
          );
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(255,80,80,0.9)";
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ship
      ctx.save();
      ctx.translate(ship.x, ship.y);
      const angle = Math.atan2(ship.vy, ship.vx);
      ctx.rotate(isFinite(angle) ? angle : 0);

      ctx.shadowColor = "rgba(255,255,255,0.35)";
      ctx.shadowBlur = 16;

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,180,80,0.95)";
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-14, -4);
      ctx.lineTo(-14, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  // start/stop loop on playing
  useEffect(() => {
    if (!playing) return;
    resetGame();
    startLoop();
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // game over -> save high score
  useEffect(() => {
    if (!playing) return;
    if (hp > 0) return;

    setPlaying(false);
    stopLoop();

    setBest((prev) => {
      const next = Math.max(prev, score);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(next));
      } catch {}
      return next;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hp]);

  const restart = () => {
    stopLoop();
    resetGame();
    setPlaying(true);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
        <div>
          <div className="text-sm text-neutral-200 font-medium">
            Space Tax Shooter
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            WASD / Arrows • Space to shoot
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!playing ? (
            <button
              onClick={() => setPlaying(true)}
              className="rounded-2xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:opacity-90 transition"
            >
              Play
            </button>
          ) : (
            <button
              onClick={() => {
                setPlaying(false);
                stopLoop();
              }}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/30 px-4 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-900 transition"
            >
              Pause
            </button>
          )}

          <button
            onClick={restart}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Restart
          </button>

          <div className="ml-2 rounded-2xl border border-neutral-800 bg-neutral-900/20 px-3 py-2 text-xs text-neutral-300">
            Score{" "}
            <span className="text-neutral-100 font-semibold">{score}</span> • HP{" "}
            <span className="text-neutral-100 font-semibold">{hp}</span> • Best{" "}
            <span className="text-neutral-100 font-semibold">{best}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          className="block"
        />
      </div>
    </div>
  );
}
