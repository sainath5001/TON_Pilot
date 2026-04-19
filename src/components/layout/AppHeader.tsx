import { Container } from "@/components/layout/Container";
import Image from "next/image";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <Container>
        <div className="flex h-14 items-center justify-between md:h-16">
          <Link className="flex items-center gap-2.5" href="/">
            <Image
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
              priority
            />
            <span className="text-sm font-semibold text-white hover:text-white/90">TON Pilot</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm text-white/70 md:gap-x-5">
            <Link className="hover:text-white" href="/swap">
              Swap Assistant
            </Link>
            <Link className="hover:text-white" href="/limit-orders">
              Limit Orders
            </Link>
            <Link className="hover:text-white" href="/liquidity-advisor">
              Liquidity Advisor
            </Link>
            <Link className="hover:text-white" href="/smart-alerts">
              Smart Alerts
            </Link>
            <a className="hover:text-white" href="https://ston.fi" target="_blank" rel="noreferrer">
              STON.fi
            </a>
          </nav>
        </div>
      </Container>
    </header>
  );
}

