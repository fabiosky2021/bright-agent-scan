import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LogOut, Moon, Sun, Volume2, VolumeX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import { CandidatoCard } from "@/components/CandidatoCard";
import { AssistenteIA } from "@/components/AssistenteIA";
import { AvisosBell } from "@/components/AvisosBell";
import { configurarSom, liberarSom, tocarClique } from "@/lib/som";
import { APP_NOME, TSE_GERAL, alternarApoio, listarCandidatos, listarMeusApoios, type Candidato } from "@/lib/dados";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Transparência Potiguar — Governo do RN 2026" },
    { name: "description", content: "Consulte as nove chapas que pediram registro ao Governo do RN em 2026, os avisos e os dados oficiais no TSE." },
    { property: "og:title", content: "Transparência Potiguar — Governo do RN 2026" },
    { property: "og:description", content: "Dados informativos sobre as candidaturas ao Governo do Rio Grande do Norte em 2026." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: Index, ssr: false,
});

function Index() {
  const [carregandoSplash, setCarregandoSplash] = useState(true);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [meusApoios, setMeusApoios] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [escuro, setEscuro] = useState(false);
  const [somLigado, setSomLigado] = useState(false);
  const { user, sair } = useAuth();

  useEffect(() => {
    const salvo = localStorage.getItem("transparencia-potiguar:tema");
    const inicial = salvo ? salvo === "escuro" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", inicial);
    setEscuro(inicial);
    const som = localStorage.getItem("transparencia-potiguar:som") === "ligado";
    setSomLigado(som); configurarSom(som);
    function clique(evento: MouseEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element) || !alvo.closest("button,a")) return;
      liberarSom();
      if (!alvo.closest('[data-alert-sound="true"]')) tocarClique();
    }
    document.addEventListener("click", clique);
    return () => document.removeEventListener("click", clique);
  }, []);

  useEffect(() => {
    listarCandidatos().then(setCandidatos).catch(() => setErro("Não foi possível carregar os candidatos agora.")).finally(() => setCarregando(false));
  }, []);
  useEffect(() => { if (user) void listarMeusApoios().then(setMeusApoios); else setMeusApoios([]); }, [user]);
  const terminarSplash = useCallback(() => setCarregandoSplash(false), []);
  function mudarTema() {
    const novo = !escuro; setEscuro(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("transparencia-potiguar:tema", novo ? "escuro" : "claro");
  }
  function mudarSom() {
    const novo = !somLigado; setSomLigado(novo); configurarSom(novo);
    localStorage.setItem("transparencia-potiguar:som", novo ? "ligado" : "desligado");
  }
  async function entrar() {
    const resultado = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (resultado.error) setErro("Não foi possível entrar com o Google.");
  }
  async function apoiar(candidato: Candidato) {
    if (!user) { setErro("Entre com o Google para registrar seu apoio."); return; }
    const jaApoiou = meusApoios.includes(candidato.id);
    setErro(null);
    setMeusApoios((lista) => jaApoiou ? lista.filter((id) => id !== candidato.id) : [...lista, candidato.id]);
    setCandidatos((lista) => lista.map((c) => c.id === candidato.id ? { ...c, confianca_verde: Math.max(0, c.confianca_verde + (jaApoiou ? -1 : 1)) } : c));
    try {
      const total = await alternarApoio(candidato.id);
      setCandidatos((lista) => lista.map((c) => c.id === candidato.id ? { ...c, confianca_verde: total } : c));
    } catch {
      setMeusApoios((lista) => jaApoiou ? [...lista, candidato.id] : lista.filter((id) => id !== candidato.id));
      setCandidatos((lista) => lista.map((c) => c.id === candidato.id ? { ...c, confianca_verde: candidato.confianca_verde } : c));
      setErro("Não foi possível registrar seu apoio.");
    }
  }
  if (carregandoSplash) return <SplashScreen aoTerminar={terminarSplash} />;
  const filtrados = candidatos.filter((c) => `${c.nome} ${c.nome_completo} ${c.partido}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR").trim()));

  return <div className="min-h-dvh bg-background pb-24 text-foreground">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center border-2 border-primary font-display text-xs font-black text-primary" aria-hidden="true">RN</div><div className="min-w-0"><p className="truncate font-display text-sm font-extrabold leading-tight sm:text-lg">{APP_NOME}</p><p className="text-[10px] font-semibold uppercase text-muted-foreground">Eleições 2026 · Governo do RN</p></div></div>
        <div className="flex items-center gap-0.5 sm:gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={mudarTema} aria-label={escuro ? "Ativar modo claro" : "Ativar modo noturno"} title={escuro ? "Modo claro" : "Modo noturno"} className="size-11">{escuro ? <Sun /> : <Moon />}</Button>
          <Button type="button" variant="ghost" size="icon" onClick={mudarSom} aria-label={`Som: ${somLigado ? "ligado" : "desligado"}`} title={`Som: ${somLigado ? "ligado" : "desligado"}`} aria-pressed={somLigado} className="size-11">{somLigado ? <Volume2 /> : <VolumeX />}</Button>
          <AvisosBell />
          {user ? <Button type="button" variant="ghost" size="icon" onClick={() => void sair()} aria-label="Sair" title="Sair" className="size-11"><LogOut /></Button> : <Button type="button" variant="outline" onClick={() => void entrar()} className="h-11 px-3 text-xs">Entrar</Button>}
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <div className="border-b border-border py-7 sm:py-10"><p className="text-xs font-bold uppercase text-primary">Rio Grande do Norte <span className="mx-2">/</span> 2026</p><h1 className="mt-2 font-display text-3xl font-black leading-tight sm:text-5xl">Candidaturas ao governo</h1><p className="mt-2 text-sm text-muted-foreground">Nove chapas pediram registro. Registros sujeitos a julgamento pela Justiça Eleitoral.</p></div>
      <div className="border-b border-border bg-secondary/55 px-4 py-4 text-sm leading-relaxed sm:px-5"><strong>1º turno: domingo, 4 de outubro.</strong> Resumo informativo, sem recomendação de voto. Os apoios (coração) são cliques de usuários do app, não pesquisa eleitoral. Confira nomes, partidos e planos de governo no <a className="font-bold text-primary underline underline-offset-2" href={TSE_GERAL} target="_blank" rel="noopener noreferrer">DivulgaCandContas (TSE)</a>.</div>
      <div className="flex flex-wrap items-end justify-between gap-4 py-6"><div><p className="text-xs font-bold uppercase text-primary">Consulta pública</p><h2 className="mt-1 font-display text-xl font-bold">Candidatos <span className="text-muted-foreground">/ 09</span></h2></div><label className="relative block w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><span className="sr-only">Buscar candidato ou partido</span><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar candidato ou partido" className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label></div>
      {erro && <p role="alert" className="mb-5 border-l-2 border-destructive bg-danger-soft p-3 text-sm text-destructive">{erro}</p>}
      {carregando ? <p className="text-sm text-muted-foreground">Carregando candidatos...</p> : filtrados.length ? <div className="space-y-4">{filtrados.map((c) => <CandidatoCard key={c.id} candidato={c} apoiado={meusApoios.includes(c.id)} apoios={c.confianca_verde} aoApoiar={() => void apoiar(c)} />)}</div> : <p className="py-12 text-sm text-muted-foreground">Nenhum candidato encontrado.</p>}
      <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">Fontes informadas: Agência Brasil (25/09/2026) e Agora RN (agosto/2026). Confirme a situação atual de cada registro no TSE.</p>
    </main>
    <AssistenteIA />
  </div>;
}
