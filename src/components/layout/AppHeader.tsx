import { Container } from "@/components/layout/Container";

export function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-black/10 backdrop-blur">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/90 to-cyan-400/70 shadow-sm shadow-violet-500/20" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">TON Pilot</div>
              <div className="text-xs text-white/60">Hackathon MVP</div>
            </div>
          </div>
          <nav className="text-sm text-white/70">
            <a className="hover:text-white" href="https://ston.fi" target="_blank" rel="noreferrer">
              STON.fi
            </a>
          </nav>
        </div>
      </Container>
    </header>
  );
}

