import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import { CandidatoCard } from "@/components/CandidatoCard";
import { AssistenteIA } from "@/components/AssistenteIA";
import { AvisosBell } from "@/components/AvisosBell";
import {
  APP_NOME,
  APP_SUBTITULO,
  alternarApoio,
  listarCandidatos,
  listarMeusApoios,
  type Candidato,
} from "@/lib/dados";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RN Transparente — Candidatos ao Governo do RN" },
      {
        name: "description",
        content:
          "Compare propostas, pontos positivos e desafios dos candidatos ao Governo do Rio Grande do Norte, com assistente de IA e avisos.",
      },
      { property: "og:title", content: "RN Transparente" },
      {
        property: "og:description",
        content:
          "Dados abertos e cidadania ativa: propostas, prós e contras dos candidatos do RN em um app para celular.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
  ssr: false,
});

function Index() {
  const [carregandoSplash, setCarregandoSplash] = useState(true);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [meusApoios, setMeusApoios] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const { user, sair } = useAuth();

  useEffect(() => {
    listarCandidatos()
      .then(setCandidatos)
      .catch(() => setErro("Não foi possível carregar os candidatos agora."));
  }, []);

  useEffect(() => {
    if (user) listarMeusApoios().then(setMeusApoios);
    else setMeusApoios([]);
  }, [user]);

  const terminarSplash = useCallback(() => setCarregandoSplash(false), []);

  async function entrar() {
    const resultado = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) setErro("Não foi possível entrar com o Google.");
  }

  async function apoiar(candidato: Candidato) {
    if (!user) {
      setErro("Entre com o Google para registrar seu apoio.");
      return;
    }
    const jaApoiou = meusApoios.includes(candidato.id);
    setMeusApoios((lista) =>
      jaApoiou ? lista.filter((id) => id !== candidato.id) : [...lista, candidato.id],
    );
    setCandidatos((lista) =>
      lista.map((c) =>
        c.id === candidato.id
          ? { ...c, confianca_verde: c.confianca_verde + (jaApoiou ? -1 : 1) }
          : c,
      ),
    );
    try {
      const total = await alternarApoio(candidato.id);
      setCandidatos((lista) =>
        lista.map((c) => (c.id === candidato.id ? { ...c, confianca_verde: total } : c)),
      );
    } catch {
      setErro("Não foi possível registrar seu apoio.");
    }
  }

  if (carregandoSplash) return <SplashScreen aoTerminar={terminarSplash} />;

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-gradient-brand px-4 py-3">
        <div className="mx-auto grid max-w-xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-cta">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold uppercase text-brand-deep">
              {APP_NOME}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">{APP_SUBTITULO}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AvisosBell />
            {user ? (
              <>
                <img
                  src={
                    (user.user_metadata?.["avatar_url"] as string | undefined) ??
                    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                      (user.user_metadata?.["full_name"] as string) ?? user.email ?? "RN",
                    )}`
                  }
                  alt={(user.user_metadata?.["full_name"] as string) ?? "Perfil"}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={sair}
                  aria-label="Sair"
                  className="shrink-0 rounded-full bg-secondary p-2 text-secondary-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={entrar}
                className="shrink-0 rounded-full bg-gradient-cta px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                Entrar com o Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-4 py-4">
        {erro ? (
          <p className="rounded-2xl bg-danger-soft px-3 py-2 text-sm text-danger">{erro}</p>
        ) : null}

        {candidatos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Carregando candidatos...</p>
        ) : (
          candidatos.map((c) => (
            <CandidatoCard
              key={c.id}
              candidato={c}
              apoiado={meusApoios.includes(c.id)}
              apoios={c.confianca_verde}
              aoApoiar={() => apoiar(c)}
            />
          ))
        )}
      </main>

      <AssistenteIA />
    </div>
  );
}
