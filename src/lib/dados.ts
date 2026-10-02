import { supabase } from "@/integrations/supabase/client";

export const APP_NOME = "Transparência Potiguar";
export const APP_SUBTITULO = "Governo do RN · Eleições 2026";
export const TSE_GERAL = "https://divulgacandcontas.tse.jus.br/";

export interface Candidato {
  id: string;
  nome: string;
  nome_completo: string | null;
  partido: string;
  vice: string | null;
  numero: number | null;
  tse_url: string;
  observacao: string | null;
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
  const { data, error } = await supabase.from("candidatos").select("*").order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Candidato[];
}

export async function listarAvisos(): Promise<Aviso[]> {
  const { data, error } = await supabase.from("avisos").select("id, titulo, mensagem, created_at").order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []) as Aviso[];
}

export async function listarMeusApoios(): Promise<string[]> {
  const { data, error } = await supabase.from("apoios").select("candidato_id");
  if (error) return [];
  return (data ?? []).map((linha) => linha.candidato_id);
}

export async function alternarApoio(candidatoId: string): Promise<number> {
  const { data, error } = await supabase.rpc("alternar_apoio", { _candidato_id: candidatoId });
  if (error) throw error;
  return data ?? 0;
}
