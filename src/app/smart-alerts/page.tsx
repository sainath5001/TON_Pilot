import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SmartAlertsFeature } from "@/components/alerts/SmartAlertsFeature";

export default function SmartAlertsPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-16 md:py-20">
        <Container>
          <PageHero
            title="Smart Alerts"
            subtitle="Stay in rhythm with the market—alerts that match how closely you want to watch."
          />

          <div className="mt-12 md:mt-14">
            <SmartAlertsFeature />
          </div>
        </Container>
      </main>
    </div>
  );
}
