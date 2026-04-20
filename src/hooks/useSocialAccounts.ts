import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SocialAccount = {
  id: string;
  network: string;
  handle: string;
  url: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
};

export const useSocialAccounts = (onlyActive = true) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    let q = supabase.from("social_accounts").select("*").order("sort_order");
    if (onlyActive) q = q.eq("active", true);
    const { data } = await q;
    setAccounts((data as SocialAccount[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); /* eslint-disable-next-line */ }, [onlyActive]);

  return { accounts, loading, refresh: fetchAccounts };
};
