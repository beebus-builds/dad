"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ArrowRight, Users, MapPin, Scale, Newspaper, ChevronDown } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DhakaPattern } from "@/components/decorative-pattern";

// ===== Time-Aware Theme =====
type TimePeriod = "morning" | "afternoon" | "evening" | "night";
function getNepalPeriod(): TimePeriod {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepal = new Date(utc + 5.75 * 3600000);
  const h = nepal.getHours();
  if (h >= 6 && h < 10) return "morning";
  if (h >= 10 && h < 16) return "afternoon";
  if (h >= 16 && h < 19) return "evening";
  return "night";
}

const THEMES: Record<TimePeriod, {
  gradient: string; particleColor: string; particleSpeed: number; accent: string; label: string
}> = {
  morning:  { gradient: "from-amber-600 via-orange-700 to-union-red", particleColor: "255,200,100", particleSpeed: 0.3, accent: "text-amber-200", label: "बिहान" },
  afternoon:{ gradient: "from-union-red via-red-700 to-govt-blue",   particleColor: "255,255,255", particleSpeed: 0.5, accent: "text-white",   label: "दिउँसो" },
  evening:  { gradient: "from-purple-800 via-red-800 to-amber-700",  particleColor: "200,150,255", particleSpeed: 0.2, accent: "text-purple-200", label: "साँझ" },
  night:    { gradient: "from-slate-900 via-blue-900 to-indigo-950", particleColor: "100,180,255", particleSpeed: 0.15, accent: "text-blue-200", label: "राति" },
};

// ===== Canvas Particles (Rising Voices) =====
class RisingParticle {
  x: number; y: number; size: number; speedX: number; speedY: number; opacity: number;
  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = h + Math.random() * 120;
    this.size = 1 + Math.random() * 3.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -(0.15 + Math.random() * 0.9);
    this.opacity = 0.08 + Math.random() * 0.3;
  }
  update(w: number, h: number, mx: number, my: number, speed: number) {
    this.y += this.speedY * speed;
    this.x += this.speedX;
    if (mx > 0) {
      const dx = mx - this.x, dy = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250) {
        const f = ((250 - dist) / 250) * 0.025;
        this.x += dx * f; this.y += dy * f;
      }
    }
    if (this.y < -10 || this.x < -10 || this.x > w + 10) {
      this.x = Math.random() * w; this.y = h + Math.random() * 60;
      this.opacity = 0.08 + Math.random() * 0.3;
    }
  }
  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color},${this.opacity})`;
    ctx.fill();
  }
}

// ===== Worker SVGs =====
const WORKER_VARIANTS = [
  <g key="farmer" className="worker-figure" opacity="0.7">
    <circle cx="20" cy="10" r="6" />
    <path d="M12 18 L28 18 L30 48 L10 48Z" opacity="0.85" />
    <rect x="4" y="22" width="8" height="3" rx="1" />
    <rect x="28" y="22" width="8" height="3" rx="1" />
    <path d="M34 24 Q40 16 37 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </g>,
  <g key="builder" className="worker-figure" opacity="0.55">
    <circle cx="20" cy="10" r="6" />
    <rect x="13" y="17" width="14" height="32" rx="3" opacity="0.85" />
    <rect x="4" y="24" width="10" height="3" rx="1" />
    <rect x="26" y="20" width="10" height="3" rx="1" />
    <rect x="34" y="16" width="4" height="10" rx="1" />
    <rect x="32" y="14" width="8" height="4" rx="1" />
  </g>,
  <g key="teacher" className="worker-figure" opacity="0.6">
    <circle cx="20" cy="10" r="6" />
    <path d="M14 18 L26 18 L28 48 L12 48Z" opacity="0.85" />
    <rect x="6" y="22" width="8" height="3" rx="1" />
    <rect x="26" y="22" width="8" height="3" rx="1" />
    <rect x="32" y="28" width="7" height="10" rx="1" />
    <line x1="33" y1="30" x2="38" y2="30" stroke="currentColor" strokeWidth="1.5" />
    <line x1="33" y1="33" x2="38" y2="33" stroke="currentColor" strokeWidth="1.5" />
    <line x1="33" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="1.5" />
  </g>,
  <g key="nurse" className="worker-figure" opacity="0.5">
    <circle cx="20" cy="10" r="6" />
    <path d="M14 18 L26 18 L27 48 L13 48Z" opacity="0.85" />
    <rect x="6" y="22" width="8" height="3" rx="1" />
    <rect x="26" y="22" width="8" height="3" rx="1" />
    <rect x="17" y="24" width="6" height="14" rx="1" />
    <rect x="13" y="28" width="14" height="6" rx="1" />
  </g>,
  <g key="driver" className="worker-figure" opacity="0.65">
    <circle cx="20" cy="10" r="6" />
    <path d="M13 18 L27 18 L29 48 L11 48Z" opacity="0.85" />
    <rect x="5" y="24" width="8" height="3" rx="1" />
    <rect x="27" y="24" width="8" height="3" rx="1" />
    <circle cx="36" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="36" cy="30" r="2" />
  </g>,
  <g key="factory" className="worker-figure" opacity="0.5">
    <circle cx="20" cy="10" r="6" />
    <rect x="12" y="17" width="16" height="32" rx="2" opacity="0.85" />
    <rect x="4" y="22" width="8" height="3" rx="1" />
    <rect x="28" y="22" width="8" height="3" rx="1" />
    <circle cx="35" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="35" y1="25" x2="35" y2="27" stroke="currentColor" strokeWidth="1.5" />
    <line x1="35" y1="37" x2="35" y2="39" stroke="currentColor" strokeWidth="1.5" />
    <line x1="28" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="1.5" />
    <line x1="40" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="1.5" />
  </g>,
  <g key="porter" className="worker-figure" opacity="0.55">
    <circle cx="20" cy="8" r="5" />
    <path d="M14 15 L26 15 L28 42 L12 42Z" opacity="0.85" />
    <rect x="6" y="18" width="8" height="3" rx="1" />
    <rect x="26" y="18" width="8" height="3" rx="1" />
    <rect x="14" y="2" width="12" height="8" rx="2" opacity="0.6" />
  </g>,
  <g key="mechanic" className="worker-figure" opacity="0.6">
    <circle cx="20" cy="10" r="6" />
    <rect x="13" y="17" width="14" height="32" rx="2" opacity="0.85" />
    <rect x="4" y="22" width="10" height="3" rx="1" />
    <rect x="26" y="20" width="10" height="3" rx="1" />
    <rect x="35" y="18" width="3" height="14" rx="1" />
    <path d="M33 30 Q33 26 36 26 Q39 26 39 30" fill="none" stroke="currentColor" strokeWidth="2" />
  </g>,
];

// ===== Pulse Button =====
function PulseButton({ children, href, variant = "secondary", className = "" }: { children: React.ReactNode; href: string; variant?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(400px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  };
  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(400px) rotateY(0deg) rotateX(0deg)";
  };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="pulse-ring-wrapper transition-transform duration-200 ease-out">
      <Button size="lg" variant={variant as "secondary" | "outline"} className={`relative ${className}`} asChild>
        <Link href={href}>{children}</Link>
      </Button>
    </div>
  );
}

// ===== Animated Counter =====
function AnimatedCounter({ target, suffix = "", label, delay = 0 }: { target: number; suffix?: string; label: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          setTimeout(() => {
            const duration = 2000, steps = 60, inc = target / steps;
            let cur = 0;
            const t = setInterval(() => { cur += inc; if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur)); }, duration / steps);
          }, delay);
        }
      }, { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, delay]);
  return (
    <div ref={ref} className="text-center entrance-slideUp" style={{ animationDelay: `${3.5 + delay / 1000}s` }}>
      <div className="text-3xl font-bold text-white">{count.toLocaleString()}{suffix}</div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

const DYNAMIC_STATS = [
  { icon: Users, label: "१,२०,०००+ सदस्यहरू" },
  { icon: MapPin, label: "७७ जिल्लामा उपस्थिति" },
  { icon: Scale, label: "५,४००+ कानुनी सहायता" },
  { icon: Newspaper, label: "ताजा समाचारहरू" },
];

// ===== Main =====
export function HeroInteractive({ badge, title, subtitle, primaryCta, secondaryCta }: {
  badge: string; title: string; subtitle: string; primaryCta: string; secondaryCta: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [heroPast, setHeroPast] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [statIndex, setStatIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const liquidRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const period = useMemo(() => getNepalPeriod(), []);
  const theme = THEMES[period];

  // Entrance timer
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  // Dynamic badge rotator
  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(() => setStatIndex(p => (p + 1) % DYNAMIC_STATS.length), 5000);
    return () => clearInterval(i);
  }, [mounted]);

  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (heroRef.current) setHeroPast(heroRef.current.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    const handleLeave = () => { mouseRef.current.x = -1000; mouseRef.current.y = -1000; };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);
    return () => { window.removeEventListener("mousemove", handleMouse); window.removeEventListener("mouseleave", handleLeave); };
  }, []);

  // Rising Voices Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animating = true;
    const resize = () => { if (canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; } };
    resize();
    window.addEventListener("resize", resize);

    const count = 80;
    const particles: RisingParticle[] = [];
    for (let i = 0; i < count; i++) particles.push(new RisingParticle(canvas.width, canvas.height));

    const loop = () => {
      if (!animating) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.update(canvas.width, canvas.height, mouseRef.current.x, mouseRef.current.y, theme.particleSpeed);
        p.draw(ctx, theme.particleColor);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { animating = false; cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [theme]);

  // Liquid cursor trail
  useEffect(() => {
    const el = liquidRef.current;
    if (!el) return;
    let x = 0, y = 0;
    const tick = () => {
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      if (mx > 0) {
        x += (mx - x) * 0.08;
        y += (my - y) * 0.08;
        el.style.transform = `translate(${x - 40}px, ${y - 40}px)`;
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const parallaxOffset = scrollY * 0.12;

  const workerWall = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      variant: i % WORKER_VARIANTS.length,
      x: i * 42, y: 4 + Math.sin(i * 1.5) * 3,
      scale: 0.7 + Math.random() * 0.4,
      opacity: 0.3 + Math.random() * 0.4,
    })), []);

  const workers = useMemo(() => [
    { size: 50, x: 70, y: 20, speed: 0.1, delay: 0 },
    { size: 35, x: 82, y: 40, speed: 0.07, delay: 0.5 },
    { size: 60, x: 65, y: 55, speed: 0.12, delay: 1 },
    { size: 40, x: 78, y: 70, speed: 0.08, delay: 1.5 },
    { size: 45, x: 88, y: 15, speed: 0.09, delay: 2 },
    { size: 30, x: 92, y: 50, speed: 0.06, delay: 2.5 },
    { size: 55, x: 60, y: 35, speed: 0.11, delay: 0.8 },
    { size: 38, x: 85, y: 60, speed: 0.07, delay: 1.2 },
  ], []);

  const currentStat = DYNAMIC_STATS[statIndex];
  const StatIcon = currentStat.icon;

  // Glitch reveal: first 2s uses glitch animation, then resolves
  const glitchWords = title.split(" ");

  return (
    <section
      ref={heroRef}
      className={`relative overflow-hidden border-b transition-all duration-700 ease-in-out ${
        heroPast ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100 min-h-[90vh]"
      }`}
      style={{ transformOrigin: "top center" }}
    >
      {/* Liquid Cursor Trail */}
      <div
        ref={liquidRef}
        className="fixed top-0 left-0 w-20 h-20 rounded-full pointer-events-none z-50 mix-blend-screen"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)`,
          filter: "url(#liquidGoo)",
        }}
      />
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquidGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Time-of-day indicator */}
      <div className={`absolute top-4 right-4 text-[10px] font-semibold tracking-wider uppercase opacity-40 ${theme.accent} z-10`}>
        {theme.label}
      </div>

      {/* Background */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${theme.gradient} opacity-95 entrance-bloom`} />
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full entrance-fade" style={{ animationDelay: "1s" }}>
        <DhakaPattern className="h-full w-full text-white opacity-[0.06] dhaka-drift" />
      </div>

      {/* Rising Voices Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 pointer-events-none" />

      {/* Worker Wall */}
      <div className="absolute bottom-0 left-0 right-0 h-28 overflow-hidden pointer-events-none -z-10 entrance-fade" style={{ animationDelay: "2s" }}>
        <div className="worker-wall-track">
          {[...Array(3)].map((_, pass) => (
            <div key={pass} className="flex" style={{ animation: "wallMarch 30s linear infinite", animationDelay: `${-pass * 10}s` }}>
              {workerWall.map((w, i) => (
                <div key={`${pass}-${i}`} className="text-white shrink-0" style={{ width: 40, height: 56, transform: `translateY(${w.y}px) scale(${w.scale})`, opacity: w.opacity }}>
                  <svg viewBox="0 0 40 60" className="w-full h-full" fill="currentColor">{WORKER_VARIANTS[w.variant]}</svg>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-[12%] w-72 h-96 bg-white/[0.03] rounded-t-full" style={{ transform: `translateY(${parallaxOffset * 0.08}px)` }} />
        <div className="absolute bottom-0 right-[28%] w-52 h-72 bg-white/[0.03] rounded-t-full" style={{ transform: `translateY(${parallaxOffset * 0.12}px)` }} />
        <div className="absolute bottom-0 right-[2%] w-44 h-64 bg-white/[0.04] rounded-t-full" style={{ transform: `translateY(${parallaxOffset * 0.06}px)` }} />
        {workers.map((w, i) => (
          <div key={i} className="absolute rounded-full bg-white/[0.04]" style={{ width: w.size, height: w.size, left: `${w.x}%`, top: `${w.y}%`, transform: `translateY(${parallaxOffset * w.speed}px)`, animation: `workerFloat ${3 + w.delay}s ease-in-out infinite`, animationDelay: `${w.delay}s` }} />
        ))}
      </div>

      {/* Blob morph */}
      <svg className="absolute -right-24 top-1/2 -translate-y-1/2 w-96 h-96 opacity-[0.08] pointer-events-none -z-10 entrance-fade" viewBox="0 0 500 500" fill="currentColor" style={{ animationDelay: "1.5s" }}>
        <path className="blob-path" d="M380,250 Q380,380 250,380 Q120,380 120,250 Q120,120 250,120 Q380,120 380,250Z" />
      </svg>

      {/* Main content */}
      <div className="container py-20 text-white sm:py-28 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1fr,auto]">
          <div className="max-w-3xl space-y-6">
            {/* Dynamic Badge */}
            <div className="entrance-slideDown" style={{ animationDelay: "1.5s" }}>
              <Badge variant="outline" className="border-white/40 bg-white/10 text-white px-4 py-1.5 gap-2 min-w-[180px] transition-all duration-500">
                <StatIcon className="h-3.5 w-3.5 animate-statIcon" />
                <span className="animate-statLabel" key={statIndex}>{currentStat.label}</span>
              </Badge>
            </div>

            {/* Headline with Glitch Reveal */}
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl relative glitch-container">
              {glitchWords.map((word, i) => (
                <span key={i} className="inline-block glitch-word" style={{ animationDelay: `${(2 + i * 0.12).toFixed(2)}s` }}>
                  {word}{" "}
                </span>
              ))}
            </h1>

            <p className="entrance-fade text-pretty text-lg text-white/90" style={{ animationDelay: "3.5s" }}>
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 entrance-slideUp" style={{ animationDelay: "5s" }}>
              <PulseButton href="/register" variant="secondary">
                {primaryCta} <ArrowRight className="h-4 w-4" />
              </PulseButton>
              <PulseButton href="/legal" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                {secondaryCta}
              </PulseButton>
            </div>
          </div>

          {/* Counters */}
          <div className="flex flex-col gap-4 lg:min-w-[200px] justify-center">
            <AnimatedCounter target={120000} suffix="+" label="सदस्यहरू" delay={0} />
            <div className="h-px bg-white/10" />
            <AnimatedCounter target={80} suffix="+" label="शाखाहरू" delay={200} />
            <div className="h-px bg-white/10" />
            <AnimatedCounter target={77} label="जिल्लाहरू" delay={400} />
            <div className="h-px bg-white/10" />
            <AnimatedCounter target={5400} suffix="+" label="कानुनी सहायता" delay={600} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 entrance-fade" style={{ animationDelay: "5.5s" }}>
        <span className="text-xs font-medium tracking-wide">स्क्रोल गर्नुहोस्</span>
        <ChevronDown className="h-4 w-4 animate-scrollHint" />
      </div>

      <style>{`
        /* ===== Cinematic Entrance ===== */
        .entrance-bloom { opacity: 0; animation: bloomIn 1s ease-out forwards; }
        .entrance-fade { opacity: 0; animation: fadeIn 0.6s ease-out forwards; }
        .entrance-slideDown { opacity: 0; animation: slideDown 0.5s ease-out forwards; }
        .entrance-slideUp { opacity: 0; animation: slideUp 0.5s ease-out forwards; }
        @keyframes bloomIn { 0% { opacity: 0; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slideDown { 0% { opacity: 0; transform: translateY(-16px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }

        /* ===== Glitch Reveal ===== */
        .glitch-container {
          position: relative;
        }
        .glitch-word {
          opacity: 0;
          animation: glitchReveal 0.7s ease-out forwards;
          position: relative;
        }
        .glitch-word::before,
        .glitch-word::after {
          content: attr(data-word);
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          opacity: 0;
          clip-path: inset(0);
          pointer-events: none;
        }
        .glitch-word::before {
          animation: glitchChannelR 0.7s ease-out forwards;
          color: #ff0040;
        }
        .glitch-word::after {
          animation: glitchChannelB 0.7s ease-out forwards;
          color: #00aaff;
        }
        @keyframes glitchReveal {
          0% { opacity: 0; filter: blur(6px); transform: scale(1.08); clip-path: inset(0 100% 0 0); }
          40% { opacity: 1; filter: blur(0); transform: scale(1); clip-path: inset(0 0% 0 0); }
          60% { transform: translate(0); }
          80% { transform: translate(-1px, 0.5px); }
          100% { opacity: 1; transform: translate(0); clip-path: inset(0 0% 0 0); }
        }
        @keyframes glitchChannelR {
          0%, 30% { opacity: 1; transform: translate(3px, -1px); clip-path: inset(0 0 70% 0); }
          31%, 50% { opacity: 0; }
          51%, 70% { opacity: 1; transform: translate(-2px, 1px); clip-path: inset(20% 0 30% 0); }
          71%, 100% { opacity: 0; }
        }
        @keyframes glitchChannelB {
          0%, 25% { opacity: 0; }
          26%, 45% { opacity: 1; transform: translate(-2px, 1px); clip-path: inset(50% 0 0 0); }
          46%, 65% { opacity: 0; }
          66%, 85% { opacity: 1; transform: translate(2px, -1px); clip-path: inset(0 0 40% 0); }
          86%, 100% { opacity: 0; }
        }

        /* Post-glitch hover chromatic aberration */
        .glitch-word:hover {
          text-shadow: -1px 0 #ff0040, 1px 0 #00aaff;
          transition: text-shadow 0.15s;
        }

        /* ===== Worker Wall ===== */
        .worker-wall-track { display: flex; width: max-content; position: absolute; bottom: 0; left: 0; }
        @keyframes wallMarch { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .worker-figure { transition: opacity 0.3s; }

        /* ===== Pulse Ring ===== */
        .pulse-ring-wrapper { position: relative; }
        .pulse-ring-wrapper::before {
          content: ""; position: absolute; inset: -4px; border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.3);
          animation: pulseRing 2s ease-out infinite; pointer-events: none;
        }
        .pulse-ring-wrapper:hover::before { animation-duration: 0.8s; border-color: rgba(255,255,255,0.6); }
        @keyframes pulseRing { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.25); opacity: 0; } }

        /* ===== Dynamic Badge ===== */
        @keyframes statIconSpin { 0% { transform: scale(0) rotate(-90deg); } 60% { transform: scale(1.2) rotate(10deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes statLabelSlide { 0% { opacity: 0; transform: translateY(4px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-statIcon { animation: statIconSpin 0.4s ease-out forwards; }
        .animate-statLabel { animation: statLabelSlide 0.3s ease-out forwards; }

        /* ===== Legacy ===== */
        @keyframes workerFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes dhakaDrift { 0% { transform: translate(0,0) scale(1); } 25% { transform: translate(8px,-4px) scale(1.02); } 50% { transform: translate(0,-8px) scale(1); } 75% { transform: translate(-8px,-4px) scale(0.98); } 100% { transform: translate(0,0) scale(1); } }
        .dhaka-drift { animation: dhakaDrift 20s ease-in-out infinite; }
        @keyframes blobMorph { 0% { transform: scale(1) rotate(0deg); } 33% { transform: scale(1.2) rotate(10deg); } 66% { transform: scale(0.85) rotate(-8deg); } 100% { transform: scale(1) rotate(0deg); } }
        .blob-path { animation: blobMorph 8s ease-in-out infinite; transform-origin: center; }
        @keyframes scrollHint { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(6px); opacity: 1; } }
        .animate-scrollHint { animation: scrollHint 2s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
