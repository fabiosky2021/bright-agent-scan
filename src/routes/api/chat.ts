import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@supabase/supabase-js";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Assistente indisponível no momento.", { status: 500 });
        }

        const body = (await request.json()) as { messages?: Mensagem[] };
        const messages = (body.messages ?? []).slice(-20);

        const supabaseUrl =
          process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseKey =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ??
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
          "";

        let contexto = "";
        if (supabaseUrl && supabaseKey) {
          const db = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data } = await db
            .from("candidatos")
            .select(
              "nome, partido, propostas_destaque, pontos_positivos, pontos_negativos, confianca_verde, visualizacoes",
            )
            .order("ordem");
          contexto = JSON.stringify(data ?? []);
        }

        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const result = streamText({
          model: openai.responses("openai/gpt-6-astra"),
          system: `Você é o assistente do aplicativo "RN Transparente", sobre candidatos ao Governo do Rio Grande do Norte.
Responda sempre em português do Brasil, de forma curta, clara e imparcial.
Baseie-se SOMENTE nos dados abaixo. Se a pergunta não puder ser respondida com eles, diga isso com honestidade e sugira o que o app mostra.
Nunca diga para votar em alguém; apresente prós e contras com neutralidade.

DADOS DOS CANDIDATOS (JSON): ${contexto}`,
          messages,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        return result.toTextStreamResponse();
      },
    },
  },
});
