import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evento: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setCarregando(false);
      },
    );

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCarregando(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, carregando, sair: () => supabase.auth.signOut() };
}
