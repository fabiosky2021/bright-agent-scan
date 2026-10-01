import { useState } from "react";
import { Eye, Heart, Play, ThumbsUp, AlertTriangle, ListChecks } from "lucide-react";
import { fotoDoCandidato, urlEmbedYoutube, type Candidato } from "@/lib/dados";

interface Props {
  candidato: Candidato;
  apoiado: boolean;
  apoios: number;
  aoApoiar: () => void;
}

export function CandidatoCard({ candidato, apoiado, apoios, aoApoiar }: Props) {
  const [verVideo, setVerVideo] = useState(false);
  const embed = urlEmbedYoutube(candidato.video_url);

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-4">
        <img
          src={fotoDoCandidato(candidato.foto_url)}
          alt={candidato.nome}
          loading="lazy"
          width={816}
          height={816}
          className="h-14 w-14 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-card-foreground">{candidato.nome}</h2>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase text-secondary-foreground">
              {candidato.partido}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              {candidato.visualizacoes.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={aoApoiar}
          aria-pressed={apoiado}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-transform active:scale-95 ${
            apoiado
              ? "bg-success text-success-foreground"
              : "bg-success-soft text-success"
          }`}
        >
          <Heart className={`h-4 w-4 ${apoiado ? "fill-current" : ""}`} />
          {apoios.toLocaleString("pt-BR")}
        </button>
      </header>

      <div className="space-y-4 p-4">
        {embed ? (
          verVideo ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-muted">
              <iframe
                src={embed}
                title={`Vídeo de ${candidato.nome}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setVerVideo(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-cta px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              <Play className="h-4 w-4" />
              Assistir ao vídeo
            </button>
          )
        ) : null}

        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-card-foreground">
            <ListChecks className="h-4 w-4 text-primary" />
            Propostas em destaque
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {candidato.propostas_destaque.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-success-soft p-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-success">
            <ThumbsUp className="h-4 w-4" />
            Pontos positivos
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-card-foreground">
            {candidato.pontos_positivos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-danger-soft p-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-danger">
            <AlertTriangle className="h-4 w-4" />
            Pontos negativos / desafios
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-card-foreground">
            {candidato.pontos_negativos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
