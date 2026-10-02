import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { tocarAviso } from "@/lib/som";
import { listarAvisos, type Aviso } from "@/lib/dados";

const CHAVE = "transparencia-potiguar:avisos-lidos";

export function AvisosBell() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ultimaLeitura, setUltimaLeitura] = useState<string | null>(null);

  useEffect(() => {
    setUltimaLeitura(localStorage.getItem(CHAVE));
    listarAvisos().then(setAvisos).catch(() => setAvisos([]));
    const canal = supabase.channel("avisos-publicos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "avisos" }, (evento) => {
        const novo = evento.new as Aviso;
        setAvisos((atuais) => [novo, ...atuais.filter((a) => a.id !== novo.id)].slice(0, 20));
        tocarAviso();
      }).subscribe();
    return () => { void supabase.removeChannel(canal); };
  }, []);

  useEffect(() => {
    if (!aberto) return;
    function tecla(e: KeyboardEvent) { if (e.key === "Escape") setAberto(false); }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto]);

  const naoLidos = avisos.filter((a) => !ultimaLeitura || new Date(a.created_at) > new Date(ultimaLeitura)).length;
  function abrir() {
    tocarAviso();
    setAberto(true);
    const agora = new Date().toISOString();
    localStorage.setItem(CHAVE, agora);
    setUltimaLeitura(agora);
  }

  return <>
    <Button type="button" variant="ghost" size="icon" onClick={abrir} aria-label={`Avisos, ${naoLidos} não lidos`} title="Avisos" data-alert-sound="true" className="relative size-11 rounded-md">
      <Bell className="size-5" />
      {naoLidos > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{naoLidos}</span>}
    </Button>
    {aberto && <div role="dialog" aria-modal="true" aria-label="Avisos" className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
        <div><p className="text-xs font-bold uppercase text-primary">Atualizações</p><h2 className="font-display text-2xl font-bold">Avisos</h2></div>
        <Button type="button" variant="outline" size="icon" onClick={() => setAberto(false)} aria-label="Fechar avisos" className="size-11"><X /></Button>
      </header>
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 py-6">
        {avisos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum aviso por enquanto.</p> : avisos.map((a) => <article key={a.id} className="border-b border-border py-5 first:pt-0"><time className="text-xs font-semibold text-primary">{new Date(a.created_at).toLocaleDateString("pt-BR")}</time><h3 className="mt-1 font-display text-lg font-bold">{a.titulo}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.mensagem}</p></article>)}
      </div>
    </div>}
  </>;
}
