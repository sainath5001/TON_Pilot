import { Container } from "@/components/layout/Container";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-6xl md:leading-[1.06]">
              TON Pilot
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-xl font-light leading-snug text-white/75 md:mt-6 md:text-2xl md:leading-snug">
              Your cockpit for TON—clarity before every swap.
            </p>
            <p className="mx-auto mt-8 max-w-xl text-pretty text-[15px] leading-relaxed text-white/50 md:mt-10 md:text-base">
              Swaps, liquidity insight, limit-style orders, and alerts—one workspace to plan your next move on-chain.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:gap-6 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <Card.Title>AI Swap Assistant</Card.Title>
              <Card.Description>
                Quote routes, get a quick read, and prepare your trade before you sign.
              </Card.Description>
              <div className="mt-5">
                <Button href="/swap" variant="secondary">
                  Open Swap Assistant
                </Button>
              </div>
            </Card>
            <Card>
              <Card.Title>Limit Orders</Card.Title>
              <Card.Description>
                Set target prices and keep a clean local order list as you iterate.
              </Card.Description>
              <div className="mt-5">
                <Button href="/limit-orders" variant="secondary">
                  Open Limit Orders
                </Button>
              </div>
            </Card>
            <Card>
              <Card.Title>AI Liquidity Advisor</Card.Title>
              <Card.Description>
                Compare pools by APY and risk, then get a concise recommendation.
              </Card.Description>
              <div className="mt-5">
                <Button href="/liquidity-advisor" variant="secondary">
                  Open Liquidity Advisor
                </Button>
              </div>
            </Card>
            <Card>
              <Card.Title>Smart Alerts</Card.Title>
              <Card.Description>
                Tune thresholds and get timely nudges—preferences saved on this device.
              </Card.Description>
              <div className="mt-5">
                <Button href="/smart-alerts" variant="secondary">
                  Open Smart Alerts
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
