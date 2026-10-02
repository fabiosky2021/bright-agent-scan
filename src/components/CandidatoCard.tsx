import { ExternalLink, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TSE_GERAL, type Candidato } from "@/lib/dados";

interface Props {
  candidato: Candidato;
  apoiado: boolean;
  apoios: number;
  aoApoiar: () => void;
}

export function CandidatoCard({ candidato, apoiado, apoios, aoApoiar }: Props) {
  const iniciais = candidato.nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR");
  const semAnalise = !candidato.propostas_destaque.length && !candidato.pontos_positivos.length && !candidato.pontos_negativos.length;
  const destino = candidato.tse_url || TSE_GERAL;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition-colors hover:border-primary/50">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground sm:px-6">
        <span>Governo do RN <span className="mx-2 text-primary">/</span> Chapa {String(candidato.ordem).padStart(2, "0")}</span>
        <span>2026</span>
      </div>
      <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 px-4 py-5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:px-6">
        <div aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-lg font-black text-secondary-foreground sm:h-[72px] sm:w-[72px]">{iniciais}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-display text-xl font-bold leading-tight sm:text-2xl">{candidato.nome}</h2>
            {candidato.numero !== null && <span className="border-l-2 border-primary pl-2 text-sm font-bold text-primary">Nº {candidato.numero}</span>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{candidato.nome_completo}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span><strong className="font-bold">{candidato.partido}</strong></span>
            {candidato.vice && <span className="text-muted-foreground">Vice: {candidato.vice}</span>}
          </div>
        </div>
        <Button type="button" variant={apoiado ? "default" : "outline"} onClick={aoApoiar} aria-pressed={apoiado} aria-label={`${apoiado ? "Remover apoio a" : "Apoiar"} ${candidato.nome}; ${apoios} apoios de usuários`} className="col-span-2 h-11 w-fit gap-2 justify-self-start rounded-md px-4 sm:col-span-1 sm:justify-self-end">
          <Heart className={apoiado ? "fill-current" : ""} /> {apoios.toLocaleString("pt-BR")} <span className="text-xs">apoios</span>
        </Button>
      </div>
      {candidato.observacao && <p className="mx-4 mb-4 flex items-start gap-2 border-l-2 border-warning bg-warning-soft px-3 py-2 text-xs leading-relaxed text-foreground sm:mx-6"><AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />{candidato.observacao}</p>}
      <div className="border-t border-border bg-muted/35 px-4 py-4 sm:px-6">
        {semAnalise ? <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Propostas e análises em verificação. Enquanto isso, consulte o plano de governo registrado na Justiça Eleitoral. <a className="font-semibold text-primary underline underline-offset-2" href={destino} target="_blank" rel="noopener noreferrer">Consultar no TSE <ExternalLink className="inline size-3" /></a></p> : (
          <div className="space-y-3 text-sm">
            {([ ["Propostas", candidato.propostas_destaque], ["Pontos positivos", candidato.pontos_positivos], ["Pontos negativos", candidato.pontos_negativos] ] as const).map(([titulo, lista]) => <div key={titulo}><strong>{titulo}</strong>{lista.length ? <ul className="list-disc pl-5 text-muted-foreground">{lista.map(item => <li key={item}>{item}</li>)}</ul> : <p className="text-muted-foreground">Em verificação. Consulte o plano de governo no TSE.</p>}</div>)}
          </div>
        )}
        <a href={destino} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline-offset-2 hover:underline">Ver registro no TSE <ExternalLink className="size-4" /></a>
      </div>
    </article>
  );
}
