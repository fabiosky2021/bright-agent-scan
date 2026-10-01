import { supabase } from "@/integrations/supabase/client";
import cand1 from "@/assets/cand-1.jpg";
import cand2 from "@/assets/cand-2.jpg";
import cand3 from "@/assets/cand-3.jpg";

export const APP_NOME = "RN Transparente";
export const APP_SUBTITULO = "Governo do RN: Dados Abertos e Cidadania Ativa";

const fotos: Record<string, string> = {
  "cand-1": cand1,
  "cand-2": cand2,
  "cand-3": cand3,
};

export function fotoDoCandidato(chave: string | null) {
  if (!chave) return cand1;
  return fotos[chave] ?? chave;
}

export interface Candidato {
  id: string;
  nome: string;
  partido: string;
  foto_url: string | null;
  video_url: string | null;
  visualizacoes: number;
  confianca_verde: number;
  propostas_destaque: string[];
  pontos_positivos: string[];
  pontos_negativos: string[];
  ordem: number;
}

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  created_at: string;
}

export async function listarCandidatos(): Promise<Candidato[]> {
  const { data, error } = await supabase
    .from("candidatos")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Candidato[];
}

export async function listarAvisos(): Promise<Aviso[]> {
  const { data, error } = await supabase
    .from("avisos")
    .select("id, titulo, mensagem, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Aviso[];
}

export async function listarMeusApoios(): Promise<string[]> {
  const { data, error } = await supabase.from("apoios").select("candidato_id");
  if (error) return [];
  return (data ?? []).map((linha: { candidato_id: string }) => linha.candidato_id);
}

export async function alternarApoio(candidatoId: string): Promise<number> {
  const { data, error } = await supabase.rpc("alternar_apoio", {
    _candidato_id: candidatoId,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

export function urlEmbedYoutube(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
