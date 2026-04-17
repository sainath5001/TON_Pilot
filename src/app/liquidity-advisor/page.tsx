import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";
import { AiLiquidityAdvisor } from "@/components/liquidity/AiLiquidityAdvisor";

export default function LiquidityAdvisorPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium tracking-widest text-white/60">Feature</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
              AI Liquidity Advisor
            </h1>
            <p className="mt-4 text-pretty text-base text-white/70 md:text-lg">
              Compare pools by APY and risk, then get a quick recommendation (mocked).
            </p>
          </div>

          <div className="mt-10">
            <AiLiquidityAdvisor />
          </div>
        </Container>
      </main>
    </div>
  );
}

