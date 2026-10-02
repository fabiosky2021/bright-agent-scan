ALTER TABLE public.candidatos
  ADD COLUMN IF NOT EXISTS nome_completo text,
  ADD COLUMN IF NOT EXISTS vice text,
  ADD COLUMN IF NOT EXISTS numero integer,
  ADD COLUMN IF NOT EXISTS tse_url text NOT NULL DEFAULT 'https://divulgacandcontas.tse.jus.br/',
  ADD COLUMN IF NOT EXISTS observacao text;

DELETE FROM public.apoios WHERE id IS NOT NULL;
DELETE FROM public.candidatos WHERE id NOT IN (
  'allyson', 'alvaro-dias', 'arinalda-mlb', 'cadu-lula', 'dario-barbosa',
  'henrique-lyra', 'roberio-paulino', 'rodrigo-bolsonaro', 'godeiro-linharess'
);

INSERT INTO public.candidatos (
  id, nome, nome_completo, partido, vice, numero, foto_url, video_url,
  visualizacoes, confianca_verde, propostas_destaque, pontos_positivos,
  pontos_negativos, tse_url, observacao, ordem
) VALUES
  ('allyson', 'Allyson', 'Allyson Leandro Bezerra Silva', 'União Brasil', 'Hermano Morais (MDB)', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 1),
  ('alvaro-dias', 'Álvaro Dias', 'Álvaro Costa Dias', 'PL', 'Babá Pereira (PL)', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 2),
  ('arinalda-mlb', 'Arinalda do MLB', 'Arinalda Vasconcelos de Medeiros', 'UP', 'Francisco Dias', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 3),
  ('cadu-lula', 'Cadu de Lula', 'Carlos Eduardo Xavier', 'PT', 'Larissa Rosado (PSB)', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 4),
  ('dario-barbosa', 'Dário Barbosa', 'Dario Barbosa de Melo', 'PSTU', 'Fernanda Soares', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 5),
  ('henrique-lyra', 'Henrique Lyra', 'Henrique Othon Costa de Lyra', 'PCO', 'André Gustavo (PCO)', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 6),
  ('roberio-paulino', 'Professor Robério Paulino', 'Robério Paulino Rodrigues', 'PSOL', 'Lenny Grilo (Rede)', NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 7),
  ('rodrigo-bolsonaro', 'Rodrigo Bolsonaro', 'Karlo Rodrigo Lucio Vieira', 'Agir', NULL, NULL, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', NULL, 8),
  ('godeiro-linharess', 'Godeiro Linharess', 'Gladyer Linhares Godeiro', 'DC', 'Pastor Júlio (DC)', 27, NULL, NULL, 0, 0, '{}', '{}', '{}', 'https://divulgacandcontas.tse.jus.br/', 'Registro pendente de julgamento na última informação encontrada (17/09/2026), por ser substituição de Carlos Jararaca, que teve o registro indeferido. Confirme a situação atual no TSE.', 9)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  nome_completo = EXCLUDED.nome_completo,
  partido = EXCLUDED.partido,
  vice = EXCLUDED.vice,
  numero = EXCLUDED.numero,
  foto_url = NULL,
  video_url = NULL,
  visualizacoes = 0,
  confianca_verde = 0,
  propostas_destaque = '{}',
  pontos_positivos = '{}',
  pontos_negativos = '{}',
  tse_url = EXCLUDED.tse_url,
  observacao = EXCLUDED.observacao,
  ordem = EXCLUDED.ordem;

DELETE FROM public.avisos WHERE id IS NOT NULL;
INSERT INTO public.avisos (titulo, mensagem, candidato_id, created_at) VALUES
  ('Lista de candidaturas atualizada', 'Nove chapas pediram registro para o Governo do RN em 2026. Os registros ainda estão sujeitos a julgamento pela Justiça Eleitoral.', NULL, now() - interval '2 minutes'),
  ('Registro de Godeiro Linharess', 'Na última informação encontrada, de 17/09/2026, o registro estava pendente de julgamento por substituição. Confirme a situação atual no TSE.', 'godeiro-linharess', now() - interval '1 minute'),
  ('Data do primeiro turno', 'O primeiro turno será no domingo, 4 de outubro de 2026.', NULL, now());

REVOKE ALL ON FUNCTION public.alternar_apoio(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.alternar_apoio(text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.registrar_visualizacao(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_visualizacao(text) TO authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'avisos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.avisos;
  END IF;
END $$;