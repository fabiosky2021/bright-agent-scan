import { useEffect } from "react";
import { APP_NOME } from "@/lib/dados";

export function SplashScreen({ aoTerminar }: { aoTerminar: () => void }) {
  useEffect(() => {
    const fim = window.setTimeout(aoTerminar, 700);
    return () => window.clearTimeout(fim);
  }, [aoTerminar]);

  return <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
    <div className="mb-8 grid size-20 place-items-center border-2 border-primary text-3xl font-black text-primary splash-mark" aria-hidden="true">RN<span className="absolute -bottom-1 -right-1 block size-3 bg-primary" /></div>
    <h1 className="font-display text-3xl font-bold text-foreground">{APP_NOME}</h1>
    <p className="mt-2 text-sm text-muted-foreground">Governo do RN · Eleições 2026</p>
    <div className="mt-9 h-0.5 w-40 bg-border" role="progressbar" aria-label="Carregando aplicativo"><div className="h-full w-full origin-left bg-primary splash-line" /></div>
  </div>;
}
