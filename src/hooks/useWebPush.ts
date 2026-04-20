import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Clé publique VAPID — peut être hardcodée (publique par nature)
const VAPID_PUBLIC_KEY = "BNMskUBftTHDIeKWtUkT9HofgXYoSwTmc36tjQ6S9GY0sHzt8vwOVM0oHUCRNufFdXqPelUgxjSxp_PkbolZJt4";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
};

export const useWebPush = () => {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "PushManager" in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!supported || !user) return;
    navigator.serviceWorker.getRegistration("/sw-push.js").then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, [supported, user]);

  const subscribe = useCallback(async () => {
    if (!supported || !user) return;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") { toast.error("Permission refusée"); return; }

      const reg = await navigator.serviceWorker.register("/sw-push.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
        user_agent: navigator.userAgent,
      }, { onConflict: "endpoint" });
      if (error) throw error;
      setSubscribed(true);
      toast.success("Notifications push activées ✨");
    } catch (e: any) {
      toast.error(e?.message || "Erreur d'activation");
    } finally { setLoading(false); }
  }, [supported, user]);

  const unsubscribe = useCallback(async () => {
    if (!supported || !user) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Notifications push désactivées");
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    } finally { setLoading(false); }
  }, [supported, user]);

  return { supported, permission, subscribed, loading, subscribe, unsubscribe };
};