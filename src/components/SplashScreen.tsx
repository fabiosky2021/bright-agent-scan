import { useEffect, useState } from "react";
import { ShieldCheck, BarChart3 } from "lucide-react";
import { APP_NOME, APP_SUBTITULO } from "@/lib/dados";

export function SplashScreen({ aoTerminar }: { aoTerminar: () => void }) {
  const [progresso, setProgresso] = useState(8);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setProgresso((p) => (p >= 100 ? 100 : p + 9));
    }, 90);
    const fim = setTimeout(aoTerminar, 1250);
    return () => {
      clearInterval(intervalo);
      clearTimeout(fim);
    };
  }, [aoTerminar]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-brand px-6 text-center">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-cta shadow-card">
        <ShieldCheck className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold uppercase text-brand-deep">{APP_NOME}</h1>
      <p className="mt-3 max-w-xs text-sm font-medium text-muted-foreground">{APP_SUBTITULO}</p>

      <div className="mt-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-deep">
        <BarChart3 className="h-4 w-4 animate-pulse" />
        Carregando dados...
      </div>
      <div className="mt-3 h-2 w-56 overflow-hidden rounded-full bg-card/70">
        <div
          className="h-full rounded-full bg-gradient-cta transition-all duration-150"
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}
