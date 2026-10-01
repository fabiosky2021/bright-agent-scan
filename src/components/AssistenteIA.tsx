import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkle } from "lucide-react";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

export function AssistenteIA() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente do RN Transparente. Pergunte sobre as propostas, pontos fortes ou desafios de qualquer candidato.",
    },
  ]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, aberto]);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto, enviando]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const pergunta = texto.trim();
    if (!pergunta || enviando) return;

    const historico: Mensagem[] = [...mensagens, { role: "user", content: pergunta }];
    setMensagens([...historico, { role: "assistant", content: "" }]);
    setTexto("");
    setErro(null);
    setEnviando(true);

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historico }),
      });

      if (!resposta.ok || !resposta.body) {
        throw new Error(
          resposta.status === 429
            ? "Muitas perguntas ao mesmo tempo. Tente de novo em instantes."
            : resposta.status === 402
              ? "Os créditos de IA acabaram. Recarregue para continuar usando o assistente."
              : "Não consegui responder agora. Tente novamente.",
        );
      }

      const leitor = resposta.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";
      for (;;) {
        const { done, value } = await leitor.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setMensagens([...historico, { role: "assistant", content: acumulado }]);
      }
    } catch (e) {
      setMensagens(historico);
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-cta px-4 py-3 text-sm font-bold text-primary-foreground shadow-card"
      >
        <Bot className="h-5 w-5" />
        Perguntar à IA
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-cta">
          <Sparkle className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-card-foreground">Assistente RN Transparente</p>
          <p className="truncate text-xs text-muted-foreground">Responde com base nos dados do app</p>
        </div>
        <button
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Fechar assistente"
          className="shrink-0 rounded-full bg-secondary p-2 text-secondary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-gradient-cta text-primary-foreground"
                : "bg-card text-card-foreground shadow-card"
            }`}
          >
            {m.content ||
              (enviando && i === mensagens.length - 1 ? "Pensando..." : "")}
          </div>
        ))}
        {erro ? (
          <p className="rounded-2xl bg-danger-soft px-3 py-2 text-sm text-danger">{erro}</p>
        ) : null}
        <div ref={fimRef} />
      </div>

      <form
        onSubmit={enviar}
        className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-border bg-card px-4 py-3"
      >
        <input
          ref={inputRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pergunte sobre um candidato..."
          className="min-w-0 rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={enviando}
          aria-label="Enviar pergunta"
          className="shrink-0 rounded-full bg-gradient-cta p-3 text-primary-foreground disabled:opacity-60"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
