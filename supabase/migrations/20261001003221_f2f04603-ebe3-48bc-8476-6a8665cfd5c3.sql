CREATE TABLE public.candidatos (
  id text PRIMARY KEY,
  nome text NOT NULL,
  partido text NOT NULL,
  foto_url text,
  video_url text,
  visualizacoes integer NOT NULL DEFAULT 0,
  confianca_verde integer NOT NULL DEFAULT 0,
  propostas_destaque text[] NOT NULL DEFAULT '{}',
  pontos_positivos text[] NOT NULL DEFAULT '{}',
  pontos_negativos text[] NOT NULL DEFAULT '{}',
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.candidatos TO anon;
GRANT SELECT ON public.candidatos TO authenticated;
GRANT ALL ON public.candidatos TO service_role;
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidatos sao publicos" ON public.candidatos FOR SELECT USING (true);

CREATE TABLE public.apoios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  candidato_id text NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, candidato_id)
);
GRANT SELECT, INSERT, DELETE ON public.apoios TO authenticated;
GRANT ALL ON public.apoios TO service_role;
ALTER TABLE public.apoios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver os proprios apoios" ON public.apoios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Criar o proprio apoio" ON public.apoios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Remover o proprio apoio" ON public.apoios FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  candidato_id text REFERENCES public.candidatos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.avisos TO anon;
GRANT SELECT ON public.avisos TO authenticated;
GRANT ALL ON public.avisos TO service_role;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Avisos sao publicos" ON public.avisos FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.alternar_apoio(_candidato_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _total integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'nao autenticado';
  END IF;

  IF EXISTS (SELECT 1 FROM public.apoios WHERE user_id = _uid AND candidato_id = _candidato_id) THEN
    DELETE FROM public.apoios WHERE user_id = _uid AND candidato_id = _candidato_id;
    UPDATE public.candidatos SET confianca_verde = GREATEST(confianca_verde - 1, 0)
      WHERE id = _candidato_id RETURNING confianca_verde INTO _total;
  ELSE
    INSERT INTO public.apoios (user_id, candidato_id) VALUES (_uid, _candidato_id);
    UPDATE public.candidatos SET confianca_verde = confianca_verde + 1
      WHERE id = _candidato_id RETURNING confianca_verde INTO _total;
  END IF;

  RETURN _total;
END;
$$;
GRANT EXECUTE ON FUNCTION public.alternar_apoio(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.registrar_visualizacao(_candidato_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.candidatos SET visualizacoes = visualizacoes + 1 WHERE id = _candidato_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.registrar_visualizacao(text) TO anon;
GRANT EXECUTE ON FUNCTION public.registrar_visualizacao(text) TO authenticated;

INSERT INTO public.candidatos (id, nome, partido, foto_url, video_url, visualizacoes, confianca_verde, propostas_destaque, pontos_positivos, pontos_negativos, ordem) VALUES
('allyson', 'Allyson Bezerra', 'União Brasil', 'cand-1', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1420, 850,
 ARRAY['Duplicação da BR-110 em Mossoró','Construção da terceira ponte em Natal','Integração de avenidas na Zona Norte'],
 ARRAY['Foco em mobilidade urbana','Proposta de reorganização fiscal','Perfil administrativo jovem'],
 ARRAY['Falta de detalhamento de custos no plano','Questões judiciais sobre execução de emendas'], 1),
('cadu', 'Cadu de Lula', 'PT', 'cand-2', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1280, 780,
 ARRAY['Ampliação da receita acima da despesa','Expansão do ensino em tempo integral','Fomento a energias renováveis e hidrogênio verde'],
 ARRAY['Alinhamento para captação de recursos federais','Foco em transição energética'],
 ARRAY['Críticas por pedido de aumento salarial na pandemia','Omissão de metas fiscais concretas'], 2),
('alvaro', 'Álvaro Dias', 'PL', 'cand-3', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1590, 420,
 ARRAY['Criação da Policlínica da Mulher','Ampliação do Hospital Walfredo Gurgel','Fortalecimento de hospitais regionais'],
 ARRAY['Plano detalhado para os primeiros 100 dias','Experiência na gestão da capital'],
 ARRAY['Volume excessivo de promessas sem viabilidade calculada','Histórico associado a investigações'], 3);

INSERT INTO public.avisos (titulo, mensagem, candidato_id) VALUES
('Dados sincronizados', 'A base de propostas dos candidatos do RN foi atualizada.', NULL),
('Nova proposta em destaque', 'Allyson Bezerra detalhou o projeto da terceira ponte em Natal.', 'allyson'),
('Assistente de IA disponível', 'Agora você pode perguntar à IA sobre qualquer candidato do app.', NULL);