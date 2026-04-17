import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppHeader } from "@/components/layout/AppHeader";

export default function Home() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium tracking-widest text-white/60">STON.fi Vibe Coding Hackathon</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
              TON Pilot
            </h1>
            <p className="mt-4 text-pretty text-base text-white/70 md:text-lg">
              Production-ready MVP starter: clean UI, modular code, and room for your AI Swap Assistant.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Card>
              <Card.Title>Next step</Card.Title>
              <Card.Description>
                Share prompt #1 (features) and I’ll start implementing the actual hackathon app on top of this base.
              </Card.Description>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button href="/api/health" variant="secondary">
                  Check API health
                </Button>
                <Button href="https://vercel.com/new" variant="primary" external>
                  Deploy on Vercel
                </Button>
              </div>
            </Card>

            <Card>
              <Card.Title>Project structure</Card.Title>
              <Card.Description>
                <span className="font-mono text-white/80">src/app</span> (routes) ·{" "}
                <span className="font-mono text-white/80">src/components</span> (UI) ·{" "}
                <span className="font-mono text-white/80">src/lib</span> (helpers) ·{" "}
                <span className="font-mono text-white/80">src/app/api</span> (API)
              </Card.Description>
              <div className="mt-4 text-sm text-white/70">
                Env vars template is in <span className="font-mono text-white/80">.env.example</span>.
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}

