import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { AISwapAssistant } from "@/components/swap/AISwapAssistant";

export default function SwapPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-16 md:py-20">
        <Container>
          <PageHero
            title="AI Swap Assistant"
            subtitle="Know the move before you sign—connect, reflect, then trade with confidence."
          />

          <div className="mt-12 md:mt-14">
            <AISwapAssistant />
          </div>
        </Container>
      </main>
    </div>
  );
}
