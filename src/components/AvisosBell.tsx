import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { listarAvisos, type Aviso } from "@/lib/dados";

const CHAVE = "rn-transparente:avisos-lidos";

export function AvisosBell() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ultimaLeitura, setUltimaLeitura] = useState<string | null>(null);

  useEffect(() => {
    setUltimaLeitura(localStorage.getItem(CHAVE));
    listarAvisos().then(setAvisos).catch(() => setAvisos([]));
  }, []);

  const naoLidos = avisos.filter(
    (a) => !ultimaLeitura || new Date(a.created_at) > new Date(ultimaLeitura),
  ).length;

  function abrir() {
    setAberto(true);
    const agora = new Date().toISOString();
    localStorage.setItem(CHAVE, agora);
    setUltimaLeitura(agora);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Avisos"
        className="relative shrink-0 rounded-full bg-secondary p-2 text-secondary-foreground"
      >
        <Bell className="h-5 w-5" />
        {naoLidos > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
            {naoLidos}
          </span>
        ) : null}
      </button>

      {aberto ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3">
            <h2 className="truncate text-base font-bold text-card-foreground">Avisos</h2>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar avisos"
              className="shrink-0 rounded-full bg-secondary p-2 text-secondary-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {avisos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aviso por enquanto.</p>
            ) : (
              avisos.map((a) => (
                <article key={a.id} className="rounded-2xl bg-card p-3 shadow-card">
                  <h3 className="text-sm font-bold text-card-foreground">{a.titulo}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.mensagem}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
