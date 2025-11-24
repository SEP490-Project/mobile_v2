import { getRaw } from "@/libs/utils/token-storage";
import * as Notifications from "expo-notifications";
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";
import api from "../hooks/api/api";
import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationsAsync";

type NotificationItem = {
  id: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
  receivedAt: string;
  read?: boolean;
};

interface NotificationContextType {
  expoPushToken: string;
  notification: Notifications.Notification | null;
  sseConnected: boolean;
  sseUrl: string | null;
  reconnectSse: () => void;
  unreadCount: number;
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  fetchInitialUnreadCount: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: "",
  notification: null,
  sseConnected: false,
  sseUrl: null,
  reconnectSse: () => {},
  unreadCount: 0,
  notifications: [],
  markAsRead: () => {},
  clearNotifications: () => {},
  fetchInitialUnreadCount: async () => {},
});

interface Props {
  children: ReactNode;
  onNavigate?: (path: string) => void;
  ssePath?: string;
  enableLocalNotification?: boolean;
}

export const NotificationProvider: React.FC<Props> = ({
  children,
  onNavigate,
  ssePath,
  enableLocalNotification = true,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [sseUrl, setSseUrl] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notificationListener = useRef<Notifications.Subscription | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef<number>(1000);
  const reconnectTimerRef = useRef<number | null>(null);

  const unreadCountRef = useRef<number>(0);
  const lastLocalIncrementAtRef = useRef<number | null>(null);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    try {
      const base = api?.defaults?.baseURL ?? "";
      const baseNorm = String(base).replace(/\/+$/, "");
      const path = ssePath ?? "/notifications/sse";
      const full = `${baseNorm}${path.startsWith("/") ? "" : "/"}${path}`;
      setSseUrl(full);
    } catch (e) {
      setSseUrl(ssePath ?? null);
    }
  }, [ssePath]);

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) setExpoPushToken(token);
      } catch (e) {
        /* silent */
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  const pushToList = useCallback((item: NotificationItem) => {
    setNotifications((prev) => {
      const next = [item, ...prev];
      return next.slice(0, 200);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((u) => {
      const next = Math.max(0, u - 1);
      unreadCountRef.current = next;
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    unreadCountRef.current = 0;
  }, []);

  const extractUnreadCount = useCallback((payload: any): number | undefined => {
    if (!payload) return undefined;
    if (typeof payload.unread_count === "number") return payload.unread_count;
    if (typeof payload.unread_count === "string" && !isNaN(Number(payload.unread_count)))
      return Number(payload.unread_count);
    if (payload?.data && typeof payload.data.unread_count !== "undefined") {
      const v = payload.data.unread_count;
      if (typeof v === "number") return v;
      if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
    }
    if (typeof payload === "string" && !isNaN(Number(payload))) return Number(payload);
    return undefined;
  }, []);

  const extractNotificationFields = useCallback((payload: any) => {
    const title =
      payload?.title ??
      payload?.data?.title ??
      payload?.notification?.title ??
      payload?.msg ??
      payload?.message;
    const body =
      payload?.body ??
      payload?.data?.body ??
      payload?.notification?.body ??
      payload?.alert ??
      payload?.message;
    const data =
      payload?.data ?? payload?.payload ?? payload?.extra ?? payload?.notification?.data ?? {};
    return { title, body, data };
  }, []);

  const handleServerPayload = useCallback(
    async (payload: any) => {
      try {
        const serverCnt = extractUnreadCount(payload);
        if (typeof serverCnt === "number") {
          const local = unreadCountRef.current ?? unreadCount;
          const lastLocalInc = lastLocalIncrementAtRef.current ?? 0;
          const justIncremented = Date.now() - lastLocalInc < 3000;
          let final = serverCnt;
          if (justIncremented && local > serverCnt) {
            final = local;
          }
          setUnreadCount(final);
          unreadCountRef.current = final;
        }

        const { title, body, data } = extractNotificationFields(payload);

        const isNotification = Boolean(
          title ||
            body ||
            (data && Object.keys(data).length > 0) ||
            payload?.event ||
            payload?.type ||
            payload?.msg ||
            payload?.message,
        );

        if (isNotification) {
          const id =
            payload?.id ??
            payload?.notification?.id ??
            payload?.message_id ??
            `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const item: NotificationItem = {
            id,
            title,
            body,
            data,
            receivedAt: new Date().toISOString(),
            read: false,
          };
          pushToList(item);

          if (typeof serverCnt !== "number") {
            setUnreadCount((u) => {
              const next = u + 1;
              lastLocalIncrementAtRef.current = Date.now();
              unreadCountRef.current = next;
              return next;
            });
          }

          if (enableLocalNotification) {
            try {
              await Notifications.scheduleNotificationAsync({
                content: { title: title ?? "Thông báo", body: body ?? "", data },
                trigger: null,
              });
            } catch (e) {
              /* ignore */
            }
          }
        }

        const navPath = data?.path ?? data?.screen ?? payload?.path ?? payload?.screen;
        if (navPath && typeof onNavigate === "function") {
          try {
            onNavigate(String(navPath));
          } catch (e) {
            /* ignore */
          }
        }
      } catch (err) {
        /* ignore */
      }
    },
    [
      extractNotificationFields,
      extractUnreadCount,
      onNavigate,
      pushToList,
      enableLocalNotification,
      unreadCount,
    ],
  );

  const prepareAuthHeader = useCallback(async (): Promise<Record<string, string> | undefined> => {
    try {
      const authCandidate =
        (api?.defaults?.headers?.common as any)?.Authorization ??
        (api?.defaults?.headers as any)?.Authorization;
      if (authCandidate) return { Authorization: String(authCandidate) };
      const tokenRaw = await getRaw("access_token");
      if (!tokenRaw) return undefined;
      const val =
        typeof tokenRaw === "string" && tokenRaw.toLowerCase().startsWith("bearer ")
          ? tokenRaw
          : `Bearer ${tokenRaw}`;
      return { Authorization: val };
    } catch (e) {
      return undefined;
    }
  }, []);

  const connectSse = useCallback(() => {
    (async () => {
      const url = sseUrl;
      if (!url) {
        return;
      }

      try {
        if (esRef.current) {
          try {
            esRef.current.close();
          } catch {}
        }

        const headers = await prepareAuthHeader();

        const es = headers ? new EventSource(url, { headers }) : new EventSource(url);
        esRef.current = es;

        es.addEventListener("open", () => {
          backoffRef.current = 1000;
          setSseConnected(true);

          (async () => {
            try {
              await new Promise((r) => setTimeout(r, 600));
              await fetchInitialUnreadCount();
            } catch (e) {
              /* ignore */
            }
          })();
        });

        es.addEventListener("error", (err: any) => {
          setSseConnected(false);

          if (reconnectTimerRef.current == null) {
            const delay = Math.min(backoffRef.current, 30000);
            reconnectTimerRef.current = global.setTimeout(() => {
              reconnectTimerRef.current = null;
              backoffRef.current = Math.min(backoffRef.current * 1.8, 30000);
              connectSse();
            }, delay) as unknown as number;
          }
        });

        es.addEventListener("message", (e: any) => {
          try {
            const raw = e?.data ?? "";
            let payload: any = {};
            try {
              payload = raw ? JSON.parse(raw) : {};
            } catch (parseErr) {
              payload = raw;
            }
            handleServerPayload(payload);
          } catch (err) {
            /* ignore parse errors */
          }
        });

        // @ts-ignore
        es.addEventListener("unread_count", (e: any) => {
          try {
            const parsedRaw = e?.data ?? "";
            let parsed: any;
            try {
              parsed = JSON.parse(parsedRaw);
            } catch {
              parsed = parsedRaw;
            }
            const serverCnt = extractUnreadCount(parsed);
            if (typeof serverCnt === "number") {
              const local = unreadCountRef.current ?? unreadCount;
              const lastLocalInc = lastLocalIncrementAtRef.current ?? 0;
              const justIncremented = Date.now() - lastLocalInc < 3000;
              let final = serverCnt;
              if (justIncremented && local > serverCnt) final = local;
              setUnreadCount(final);
              unreadCountRef.current = final;
            }
          } catch (err) {
            /* ignore */
          }
        });

        // @ts-ignore
        es.addEventListener("notification", (e: any) => {
          try {
            const parsed = JSON.parse(e?.data ?? "{}");
            handleServerPayload(parsed);
          } catch (err) {
            /* ignore */
          }
        });

        setSseUrl(url);
      } catch (err) {
        setSseConnected(false);
        if (reconnectTimerRef.current == null) {
          const delay = Math.min(backoffRef.current, 30000);
          reconnectTimerRef.current = global.setTimeout(() => {
            reconnectTimerRef.current = null;
            backoffRef.current = Math.min(backoffRef.current * 1.8, 30000);
            connectSse();
          }, delay) as unknown as number;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sseUrl, prepareAuthHeader, handleServerPayload]);

  const disconnectSse = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    try {
      esRef.current?.close();
    } catch (e) {
      /* ignore */
    }
    esRef.current = null;
    setSseConnected(false);
  }, []);

  useEffect(() => {
    if (!sseUrl) {
      return;
    }
    connectSse();
    return () => {
      disconnectSse();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sseUrl]);

  const reconnectSse = useCallback(() => {
    disconnectSse();
    backoffRef.current = 1000;
    setTimeout(() => connectSse(), 300);
  }, [connectSse, disconnectSse]);

  const fetchInitialUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      const cnt =
        res?.data?.data?.unread_count ??
        res?.data?.unread_count ??
        (typeof res?.data === "number" ? res.data : undefined);

      if (typeof cnt === "number") {
        const local = unreadCountRef.current ?? unreadCount;
        const lastLocalInc = lastLocalIncrementAtRef.current ?? 0;
        const justIncremented = Date.now() - lastLocalInc < 3000;
        let final = cnt;
        if (justIncremented && local > cnt) final = local;
        setUnreadCount(final);
        unreadCountRef.current = final;
      }
    } catch (err) {
      /* ignore fetch errors silently */
    }
  }, [unreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        sseConnected,
        sseUrl,
        reconnectSse,
        unreadCount,
        notifications,
        markAsRead,
        clearNotifications,
        fetchInitialUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
