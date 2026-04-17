import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";
import { LimitOrderFeature } from "@/components/limitOrders/LimitOrderFeature";

export default function LimitOrdersPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="py-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium tracking-widest text-white/60">Feature</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
              Limit Orders
            </h1>
            <p className="mt-4 text-pretty text-base text-white/70 md:text-lg">
              Set a target price and keep an order list locally. Notifications and on-chain execution come next.
            </p>
          </div>

          <div className="mt-10">
            <LimitOrderFeature />
          </div>
        </Container>
      </main>
    </div>
  );
}

