import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { LimitOrderFeature } from "@/components/limitOrders/LimitOrderFeature";

export default function LimitOrdersPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-16 md:py-20">
        <Container>
          <PageHero
            title="Limit Orders"
            subtitle="Name your price—keep orders organized while you refine your strategy."
          />

          <div className="mt-12 md:mt-14">
            <LimitOrderFeature />
          </div>
        </Container>
      </main>
    </div>
  );
}
