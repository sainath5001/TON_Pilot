import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { AiLiquidityAdvisor } from "@/components/liquidity/AiLiquidityAdvisor";

export default function LiquidityAdvisorPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-16 md:py-20">
        <Container>
          <PageHero
            title="AI Liquidity Advisor"
            subtitle="Pools and trade-offs at a glance—let context guide where you add liquidity."
          />

          <div className="mt-12 md:mt-14">
            <AiLiquidityAdvisor />
          </div>
        </Container>
      </main>
    </div>
  );
}
