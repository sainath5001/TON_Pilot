import { Container } from "@/components/layout/Container";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
              Hackathon features: AI Swap Assistant, Limit Orders, and AI Liquidity Advisor with a clean DeFi UI.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            <Card>
              <Card.Title>AI Swap Assistant</Card.Title>
              <Card.Description>Connect Tonkeeper, analyze a swap, and prepare a STON.fi transaction.</Card.Description>
              <div className="mt-4">
                <Button href="/swap" variant="secondary">
                  Open Swap Assistant
                </Button>
              </div>
            </Card>
            <Card>
              <Card.Title>Limit Orders</Card.Title>
              <Card.Description>Create target-price orders stored in localStorage (no blockchain yet).</Card.Description>
              <div className="mt-4">
                <Button href="/limit-orders" variant="secondary">
                  Open Limit Orders
                </Button>
              </div>
            </Card>
            <Card>
              <Card.Title>AI Liquidity Advisor</Card.Title>
              <Card.Description>Browse pools with APY + risk and get a quick recommendation (mocked).</Card.Description>
              <div className="mt-4">
                <Button href="/liquidity-advisor" variant="secondary">
                  Open Liquidity Advisor
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}

