"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DhakaPattern } from "@/components/decorative-pattern";

class RisingParticle {
  x: number; y: number; vx: number; vy: number; size: number; opacity: number;
  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -Math.random() * 1 - 0.5;
    this.size = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update(w: number, h: number, mx: number, my: number, force: number) {
    this.x += this.vx; this.y += this.vy;
    const dx = mx - this.x, dy = my - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const f = (150 - dist) / 150 * force;
      this.vx -= (dx / dist) * f; this.vy -= (dy / dist) * f;
    }
    if (this.y < -10) this.y = h + 10;
    if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
  }
  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
    ctx.fill();
  }
}

const WORKER_VARIANTS = [
  <g key="farmer" opacity="0.7"><circle cx="20" cy="10" r="6" /><path d="M12 18 L28 18 L30 48 L10 48Z" opacity="0.85" /><rect x="4" y="22" width="8" height="3" rx="1" /><rect x="28" y="22" width="8" height="3" rx="1" /><path d="M34 24 Q40 16 37 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></g>,
  <g key="builder" opacity="0.55"><circle cx="20" cy="10" r="6" /><rect x="13" y="17" width="14" height="32" rx="3" opacity="0.85" /><rect x="4" y="24" width="10" height="3" rx="1" /><rect x="26" y="20" width="10" height="3" rx="1" /><rect x="34" y="16" width="4" height="10" rx="1" /><rect x="32" y="14" width="8" height="4" rx="1" /></g>,
  <g key="teacher" opacity="0.6"><circle cx="20" cy="10" r="6" /><path d="M14 18 L26 18 L28 48 L12 48Z" opacity="0.85" /><rect x="6" y="22" width="8" height="3" rx="1" /><rect x="26" y="22" width="8" height="3" rx="1" /><rect x="32" y="28" width="7" height="10" rx="1" /><line x1="33" y1="30" x2="38" y2="30" stroke="currentColor" strokeWidth="1.5" /><line x1="33" y1="33" x2="38" y2="33" stroke="currentColor" strokeWidth="1.5" /><line x1="33" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="1.5" /></g>,
  <g key="nurse" opacity="0.5"><circle cx="20" cy="10" r="6" /><path d="M14 18 L26 18 L27 48 L13 48Z" opacity="0.85" /><rect x="6" y="22" width="8" height="3" rx="1" /><rect x="26" y="22" width="8" height="3" rx="1" /><rect x="17" y="24" width="6" height="14" rx="1" /><rect x="13" y="28" width="14" height="6" rx="1" /></g>,
  <g key="driver" opacity="0.65"><circle cx="20" cy="10" r="6" /><path d="M13 18 L27 18 L29 48 L11 48Z" opacity="0.85" /><rect x="5" y="24" width="8" height="3" rx="1" /><rect x="27" y="24" width="8" height="3" rx="1" /><circle cx="36" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="36" cy="30" r="2" /></g>,
  <g key="factory" opacity="0.5"><circle cx="20" cy="10" r="6" /><rect x="12" y="17" width="16" height="32" rx="2" opacity="0.85" /><rect x="4" y="22" width="8" height="3" rx="1" /><rect x="28" y="22" width="8" height="3" rx="1" /><circle cx="35" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="35" y1="25" x2="35" y2="27" stroke="currentColor" strokeWidth="1.5" /><line x1="35" y1="37" x2="35" y2="39" stroke="currentColor" strokeWidth="1.5" /><line x1="28" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="1.5" /><line x1="40" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="1.5" /></g>,
  <g key="porter" opacity="0.55"><circle cx="20" cy="8" r="5" /><path d="M14 15 L26 15 L28 42 L12 42Z" opacity="0.85" /><rect x="6" y="18" width="8" height="3" rx="1" /><rect x="26" y="18" width="8" height="3" rx="1" /><rect x="14" y="2" width="12" height="8" rx="2" opacity="0.6" /></g>,
  <g key="mechanic" opacity="0.6"><circle cx="20" cy="10" r="6" /><rect x="13" y="17" width="14" height="32" rx="2" opacity="0.85" /><rect x="4" y="22" width="10" height="3" rx="1" /><rect x="26" y="20" width="10" height="3" rx="1" /><rect x="35" y="18" width="3" height="14" rx="1" /><path d="M33 30 Q33 26 36 26 Q39 26 39 30" fill="none" stroke="currentColor" strokeWidth="2" /></g>,
];

function AnimatedCounter({ target, suffix = "", label, delay = 0 }: { target: number; suffix?: string; label: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        setTimeout(() => {
          const steps = 60, inc = target / steps; let cur = 0;
          const t = setInterval(() => { cur += inc; if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur)); }, 2000 / steps);
        }, delay);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, delay]);
  return (
    <div ref={ref} className="text-center entrance-slideUp" style={{ animationDelay: `${1 + delay / 1000}s` }}>
      <div className="text-4xl font-black text-white">{count.toLocaleString()}{suffix}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/60">{label}</div>
    </div>
  );
}

export function HeroInteractive({ badge, title, subtitle, primaryCta, secondaryCta }: {
  badge: string; title: string; subtitle: string; primaryCta: string; secondaryCta: string;
}) {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const hM = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    const hL = () => { mouseRef.current.x = -1000; mouseRef.current.y = -1000; };
    window.addEventListener("mousemove", hM); window.addEventListener("mouseleave", hL);
    return () => { window.removeEventListener("mousemove", hM); window.removeEventListener("mouseleave", hL); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let running = true;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const particles = [];
    for (let i = 0; i < 80; i++) particles.push(new RisingParticle(canvas.width, canvas.height));
    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) { p.update(canvas.width, canvas.height, mouseRef.current.x, mouseRef.current.y, 0.4); p.draw(ctx, "255,255,255"); }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const composedWall = useMemo(() => [
    { v: 0, x: 40, y: 4, s: 0.8, o: 0.6 }, { v: 1, x: 80, y: 2, s: 0.7, o: 0.5 }, { v: 2, x: 120, y: 6, s: 0.9, o: 0.6 },
    { v: 3, x: 160, y: 3, s: 0.75, o: 0.5 }, { v: 4, x: 200, y: 5, s: 0.85, o: 0.6 }, { v: 5, x: 240, y: 2, s: 0.7, o: 0.5 },
    { v: 6, x: 280, y: 6, s: 0.9, o: 0.6 }, { v: 7, x: 320, y: 3, s: 0.75, o: 0.5 }, { v: 0, x: 360, y: 5, s: 0.85, o: 0.6 },
    { v: 1, x: 400, y: 2, s: 0.7, o: 0.5 }, { v: 2, x: 440, y: 6, s: 0.9, o: 0.6 }, { v: 3, x: 480, y: 3, s: 0.75, o: 0.5 },
    { v: 4, x: 520, y: 5, s: 0.85, o: 0.6 }, { v: 5, x: 560, y: 2, s: 0.7, o: 0.5 }, { v: 6, x: 600, y: 6, s: 0.9, o: 0.6 },
    { v: 7, x: 640, y: 3, s: 0.75, o: 0.5 }, { v: 0, x: 680, y: 5, s: 0.85, o: 0.6 }, { v: 1, x: 720, y: 2, s: 0.7, o: 0.5 },
    { v: 2, x: 760, y: 6, s: 0.9, o: 0.6 }, { v: 3, x: 800, y: 3, s: 0.75, o: 0.5 }, { v: 4, x: 840, y: 5, s: 0.85, o: 0.6 },
    { v: 5, x: 880, y: 2, s: 0.7, o: 0.5 }, { v: 6, x: 920, y: 6, s: 0.9, o: 0.6 }, { v: 7, x: 960, y: 3, s: 0.75, o: 0.5 },
  ], []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-union-red text-white flex items-center"
    >
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-union-red via-red-800 to-govt-blue">
        <div className="absolute inset-0 bg-black/20" />
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <DhakaPattern className="h-full w-full text-white dhaka-drift" />
        </div>
      </div>
      
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 pointer-events-none" />

      {/* Worker Wall - More subtle but present */}
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="worker-wall-track">
          {[...Array(2)].map((_, pass) => (
            <div key={pass} className="flex" style={{ animation: "wallMarch 40s linear infinite", animationDelay: `${-pass * 20}s` }}>
              {composedWall.map((w, i) => (
                <div key={`${pass}-${i}`} className="text-white shrink-0" style={{ width: 40, height: 56, transform: `translateY(${w.y}px) scale(${w.s})`, opacity: w.o }}>
                  <svg viewBox="0 0 40 60" className="w-full h-full" fill="currentColor">{WORKER_VARIANTS[w.v]}</svg>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <div className="entrance-slideDown" style={{ animationDelay: "0.5s" }}>
              <Badge className="bg-white text-union-red hover:bg-white px-4 py-1.5 text-sm font-black uppercase tracking-widest shadow-xl">
                {badge}
              </Badge>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter entrance-slideUp" style={{ animationDelay: "0.7s" }}>
              {title.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}<span className="text-white/40">.</span>
                </span>
              ))}
            </h1>

            <p className="max-w-xl text-lg sm:text-xl text-white/80 font-medium leading-relaxed entrance-fade" style={{ animationDelay: "1s" }}>
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-4 entrance-slideUp" style={{ animationDelay: "1.2s" }}>
              <Button size="lg" className="h-14 px-8 text-lg font-black uppercase tracking-tight bg-white text-union-red hover:bg-gray-100 rounded-none skew-x-[-12deg] transition-transform hover:scale-105" asChild>
                <Link href="/register" className="skew-x-[12deg] flex items-center gap-2">
                  {primaryCta} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-black uppercase tracking-tight border-2 border-white text-white hover:bg-white hover:text-union-red rounded-none skew-x-[-12deg] transition-transform hover:scale-105" asChild>
                <Link href="/legal" className="skew-x-[12deg]">
                  {secondaryCta}
                </Link>
              </Button>
            </div>
          </div>

          {/* STATS OVERLAY - High Impact Cards */}
          <div className="grid grid-cols-2 gap-4 entrance-fade" style={{ animationDelay: "1.5s" }}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all group">
              <AnimatedCounter target={120000} suffix="+" label="सदस्यहरू" delay={0} />
              <div className="mt-4 h-1 w-12 bg-white group-hover:w-full transition-all duration-500" />
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all group mt-8">
              <AnimatedCounter target={80} suffix="+" label="शाखाहरू" delay={200} />
              <div className="mt-4 h-1 w-12 bg-white group-hover:w-full transition-all duration-500" />
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all group">
              <AnimatedCounter target={77} label="जिल्लाहरू" delay={400} />
              <div className="mt-4 h-1 w-12 bg-white group-hover:w-full transition-all duration-500" />
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all group mt-8">
              <AnimatedCounter target={5400} suffix="+" label="कानुनी सहायता" delay={600} />
              <div className="mt-4 h-1 w-12 bg-white group-hover:w-full transition-all duration-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 entrance-fade" style={{ animationDelay: "2s" }}>
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore More</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>

      <style>{`
        .entrance-fade { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
        .entrance-slideDown { opacity: 0; animation: slideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .entrance-slideUp { opacity: 0; animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slideDown { 0% { opacity: 0; transform: translateY(-30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        .worker-wall-track { display: flex; width: max-content; position: absolute; bottom: 0; left: 0; }
        @keyframes wallMarch { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes dhakaDrift { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(0,-20px) scale(1); } 100% { transform: translate(0,0) scale(1); } }
        .dhaka-drift { animation: dhakaDrift 10s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
