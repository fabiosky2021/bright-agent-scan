import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Mensagem { role: "user" | "assistant"; content: string }
const abertura = "Olá! Sou o assistente do Transparência Potiguar. Posso ajudar você a comparar propostas, ver os apoios dentro do app e consultar os dados dos candidatos ao governo do RN. Como posso ajudar?";
const sugestoes = ["Quantos candidatos disputam?", "O que são os apoios?", "Onde confiro os dados oficiais?"];

export function AssistenteIA() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ role: "assistant", content: abertura }]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens, aberto]);
  useEffect(() => { if (aberto) inputRef.current?.focus(); }, [aberto]);
  useEffect(() => {
    if (!aberto) return;
    function tecla(evento: KeyboardEvent) { if (evento.key === "Escape") setAberto(false); }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto]);

  async function enviar(pergunta: string) {
    pergunta = pergunta.trim();
    if (!pergunta || enviando) return;
    const historico: Mensagem[] = [...mensagens, { role: "user", content: pergunta }];
    setMensagens([...historico, { role: "assistant", content: "" }]);
    setTexto(""); setErro(null); setEnviando(true);
    try {
      const resposta = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: historico }) });
      if (!resposta.ok || !resposta.body) throw new Error(resposta.status === 429 ? "Muitas perguntas ao mesmo tempo. Tente novamente em instantes." : resposta.status === 402 ? "O assistente está indisponível no momento." : "Não consegui responder agora. Tente novamente.");
      const leitor = resposta.body.getReader(); const decoder = new TextDecoder(); let acumulado = "";
      for (;;) {
        const { done, value } = await leitor.read(); if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setMensagens([...historico, { role: "assistant", content: acumulado }]);
      }
      if (!acumulado.trim()) throw new Error("Não recebi uma resposta. Tente novamente.");
    } catch (e) { setMensagens(historico); setErro(e instanceof Error ? e.message : "Erro inesperado."); }
    finally { setEnviando(false); }
  }

  if (!aberto) return <Button type="button" onClick={() => setAberto(true)} aria-label="Abrir Assistente" className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 h-12 rounded-md px-5 text-sm font-bold shadow-lg"><Bot className="size-5" /> Assistente</Button>;
  return <div role="dialog" aria-modal="true" aria-label="Assistente Transparência Potiguar" className="fixed inset-0 z-50 flex flex-col bg-background">
    <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-4">
      <div><p className="text-xs font-bold uppercase text-primary">Transparência Potiguar</p><h2 className="font-display text-lg font-bold">Assistente</h2></div>
      <Button type="button" variant="outline" size="icon" onClick={() => setAberto(false)} aria-label="Fechar assistente" className="size-11"><X /></Button>
    </header>
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-5 py-6">
      {mensagens.map((m, i) => <div key={i} className={`max-w-[90%] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "border-l-2 border-primary bg-card text-card-foreground"}`}>{m.content || (enviando && i === mensagens.length - 1 ? "Consultando os dados..." : "")}</div>)}
      {mensagens.length === 1 && <div className="flex flex-wrap gap-2">{sugestoes.map((s) => <Button type="button" key={s} variant="outline" onClick={() => void enviar(s)} className="h-auto min-h-11 whitespace-normal px-3 py-2 text-left text-xs">{s}</Button>)}</div>}
      {erro && <p role="alert" className="border-l-2 border-destructive px-3 py-2 text-sm text-destructive">{erro}</p>}
      <div ref={fimRef} />
    </div>
    <form onSubmit={(e) => { e.preventDefault(); void enviar(texto); }} className="mx-auto flex w-full max-w-2xl gap-2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <input ref={inputRef} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Pergunte sobre os candidatos..." aria-label="Sua pergunta" className="h-12 min-w-0 flex-1 rounded-md border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <Button type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar pergunta" className="size-12"><Send /></Button>
    </form>
  </div>;
}
