import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  Trophy,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import heroBrain from "@/assets/hero-brain.jpg";
import studentLearning from "@/assets/student-learning.jpg";
import featureAdaptive from "@/assets/feature-adaptive.jpg";
import featureAnalytics from "@/assets/feature-analytics.jpg";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cortex — Your AI Learning Companion" },
      {
        name: "description",
        content:
          "Cortex is an AI-powered adaptive learning platform that personalizes how you study, remember, and master every subject.",
      },
      { property: "og:title", content: "Cortex — Your AI Learning Companion" },
      {
        property: "og:description",
        content:
          "Replace one-size-fits-all education with a personal AI tutor that adapts to your pace, memory, and learning style.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Showcase />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Brain className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl">Cortex</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Students</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link to="/auth" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[oklch(0.66_0.18_255)]/20 blur-3xl animate-pulse-glow" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Adaptive Learning
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
            Learning that <span className="text-gradient">thinks</span> the way you do.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Cortex is your personal AI tutor — it adapts to your pace, remembers what you forget, and turns
            studying into something that actually sticks. Not another chatbot. An intelligent learning companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center justify-center gap-2 h-13 px-7 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 h-13 px-7 py-3.5 rounded-full bg-card border border-border font-semibold hover:border-primary/40 transition-colors">
              Watch how it works
            </button>
          </div>
          <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> No credit card</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Free forever plan</div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-glow animate-float">
            <img
              src={heroBrain}
              alt="Cortex AI brain visualization"
              width={1536}
              height={1280}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          </div>

          {/* Floating cards */}
          <div className="absolute -left-4 top-12 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-soft hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Today's streak</div>
              <div className="font-bold text-lg">12 days 🔥</div>
            </div>
          </div>

          <div className="absolute -right-4 bottom-16 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-soft hidden md:block w-56">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Memory retention</span>
              <span className="text-xs font-bold text-primary">+34%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[78%] bg-gradient-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const stats = [
    { value: "50K+", label: "Active students" },
    { value: "2M+", label: "AI sessions" },
    { value: "94%", label: "Retention rate" },
    { value: "4.9★", label: "Student rating" },
  ];
  return (
    <section className="border-y border-border/50 bg-card/30">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gradient">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Brain, title: "Adaptive AI Tutor", desc: "Explains concepts your way — visual, verbal, or step-by-step. Asks again until it sticks." },
    { icon: Target, title: "Spaced Repetition", desc: "Cortex knows when you'll forget, and brings it back at exactly the right moment." },
    { icon: TrendingUp, title: "Living Analytics", desc: "See your strengths, gaps, and momentum in beautiful, motivating charts." },
    { icon: BookOpen, title: "Unlimited Practice", desc: "AI-generated questions tuned to your level — never the same quiz twice." },
    { icon: Trophy, title: "Real Achievements", desc: "XP, levels, streaks and milestones designed to motivate — not distract." },
    { icon: Sparkles, title: "Smart Study Plans", desc: "Tell Cortex your exam date. It builds the path to get you there." },
  ];
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-sm font-semibold text-primary mb-3">FEATURES</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="text-gradient">actually learn</span>.
          </h2>
          <p className="text-lg text-muted-foreground">
            Built on five principles: understand before memorize, practice creates mastery, memory needs reinforcement,
            every student is different, and motivation drives consistency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-7 rounded-3xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary grid place-items-center mb-5 shadow-soft group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell Cortex about you", desc: "Pick your level, subjects, and goals. Take a quick diagnostic so the AI understands where you really are." },
    { n: "02", title: "Learn your way", desc: "Cortex explains, asks, and reframes until it clicks. Practice with instant feedback on every answer." },
    { n: "03", title: "Remember forever", desc: "Smart revision keeps knowledge alive. Watch your retention score climb week after week." },
  ];
  return (
    <section id="how" className="py-24 md:py-32 bg-card/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img
            src={studentLearning}
            alt="Student learning with Cortex"
            loading="lazy"
            width={1024}
            height={1280}
            className="rounded-3xl shadow-glow w-full"
          />
          <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-2xl p-5 shadow-soft max-w-xs hidden sm:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold">AI Tutor is thinking…</span>
            </div>
            <p className="text-sm text-muted-foreground">
              "Let's try this with an example you'll remember — imagine you're at a coffee shop…"
            </p>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-primary mb-3">HOW IT WORKS</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-10">
            From confused to <span className="text-gradient">confident</span>, in three steps.
          </h2>
          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-5 p-5 rounded-2xl hover:bg-card transition-colors">
                <div className="font-display font-bold text-3xl text-gradient shrink-0 w-14">{s.n}</div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-10 overflow-hidden relative">
          <div className="text-sm font-semibold text-primary mb-3">PERSONALIZED</div>
          <h3 className="text-3xl font-bold mb-3">A different Cortex for every student.</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Difficulty, pacing, examples, even the tone of feedback — all shaped around how you learn.
          </p>
          <img
            src={featureAdaptive}
            alt="Adaptive learning illustration"
            loading="lazy"
            width={1024}
            height={1024}
            className="rounded-2xl w-full max-w-sm mx-auto"
          />
        </div>
        <div className="rounded-3xl bg-[oklch(0.13_0.03_275)] text-white p-10 overflow-hidden relative">
          <div className="text-sm font-semibold text-[oklch(0.82_0.13_215)] mb-3">ANALYTICS</div>
          <h3 className="text-3xl font-bold mb-3">See your progress, beautifully.</h3>
          <p className="text-white/70 mb-6 max-w-md">
            Heatmaps, mastery curves, weekly reports. Watch yourself get smarter every week.
          </p>
          <img
            src={featureAnalytics}
            alt="Analytics dashboard"
            loading="lazy"
            width={1024}
            height={1024}
            className="rounded-2xl w-full shadow-glow"
          />
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Ama K.", role: "Form 3 Student", quote: "I used to hate revising. Cortex makes it feel like a game — and I'm finally remembering things." },
    { name: "Daniel O.", role: "SHS Final Year", quote: "It's like having a teacher who never gets tired of my questions. My math grade jumped a full level." },
    { name: "Priya S.", role: "University Prep", quote: "The spaced repetition is unreal. Topics I learned a month ago still feel fresh." },
  ];
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-card/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold text-primary mb-3">STUDENTS LOVE IT</div>
          <h2 className="text-4xl md:text-5xl font-bold">Built with students, for students.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="p-7 rounded-3xl bg-card border border-border hover:shadow-soft transition-shadow">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-[2.5rem] bg-gradient-primary p-12 md:p-16 text-center overflow-hidden shadow-glow">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-5">
              The future of learning is here.
            </h2>
            <p className="text-lg text-primary-foreground/85 max-w-xl mx-auto mb-8">
              Join thousands of students who've made studying personal again.
            </p>
            <button className="inline-flex items-center gap-2 h-13 px-8 py-4 rounded-full bg-background text-foreground font-semibold hover:scale-[1.03] transition-transform shadow-soft">
              Start Learning with Cortex <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center">
            <Brain className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold">Cortex</span>
          <span className="text-sm text-muted-foreground ml-2">© 2026</span>
        </div>
        <p className="text-sm text-muted-foreground">Built to help every student learn deeply.</p>
      </div>
    </footer>
  );
}
