// libs/context/notificationContext.tsx
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
  testFetchSseEndpoint?: () => Promise<void>;
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
}

export const NotificationProvider: React.FC<Props> = ({ children, onNavigate, ssePath }) => {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [sseUrl, setSseUrl] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef<number>(1000);
  const reconnectTimerRef = useRef<number | null>(null);

  const unreadCountRef = useRef<number>(0);
  const lastLocalIncrementAtRef = useRef<number | null>(null);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // build sseUrl from axios baseURL if not provided
  useEffect(() => {
    try {
      const base = api?.defaults?.baseURL ?? "";
      const baseNorm = String(base).replace(/\/+$/, "");
      const path = ssePath ?? "/notifications/sse";
      const full = `${baseNorm}${path.startsWith("/") ? "" : "/"}${path}`;
      console.log("[NotificationProvider] built sseUrl:", full);
      setSseUrl(full);
    } catch (e) {
      console.warn("[NotificationProvider] can't build sseUrl from api", e);
      setSseUrl(ssePath ?? null);
    }
  }, [ssePath]);

  // register push token + expo-notifications listeners
  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        console.log("[NotificationProvider] expo push token:", token);
        if (token) setExpoPushToken(token);
      } catch (e) {
        console.warn("[NotificationProvider] registerForPushNotificationsAsync failed", e);
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      console.log(
        "[NotificationProvider] onNotificationReceived (expo):",
        n?.request?.content?.data ?? {},
      );
      setNotification(n);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log("[NotificationProvider] User clicked notification response:", r);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // helpers to manage local list
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
    // optionally: api.put(`/notifications/${id}/read`).catch(e => console.warn('markAsRead api err', e));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    unreadCountRef.current = 0;
  }, []);

  // robust handler for server payloads (message events)
  const handleServerPayload = useCallback(
    async (payload: any) => {
      try {
        console.log("[NotificationProvider] handleServerPayload - raw payload:", payload);

        // Try to extract unread_count from many shapes
        let serverCnt: number | undefined = undefined;
        if (payload && typeof payload.unread_count === "number") serverCnt = payload.unread_count;
        else if (
          payload &&
          typeof payload.unread_count === "string" &&
          !isNaN(Number(payload.unread_count))
        )
          serverCnt = Number(payload.unread_count);
        else if (payload?.data && typeof payload.data.unread_count !== "undefined") {
          const v = payload.data.unread_count;
          if (typeof v === "number") serverCnt = v;
          else if (typeof v === "string" && !isNaN(Number(v))) serverCnt = Number(v);
        } else if (typeof payload === "string" && !isNaN(Number(payload))) {
          serverCnt = Number(payload);
        }

        if (typeof serverCnt === "number") {
          console.log("[NotificationProvider] server provided unread_count:", serverCnt);
          const local = unreadCountRef.current ?? unreadCount;
          const lastLocalInc = lastLocalIncrementAtRef.current ?? 0;
          const justIncremented = Date.now() - lastLocalInc < 3000; // keep 3s window
          let final = serverCnt;
          if (justIncremented && local > serverCnt) {
            console.log(
              "[NotificationProvider] recent local increment - keeping local:",
              local,
              "over server:",
              serverCnt,
            );
            final = local;
          }
          setUnreadCount(final);
          unreadCountRef.current = final;
        }

        // normalize title/body/data
        const title =
          payload.title ??
          payload.data?.title ??
          payload.notification?.title ??
          payload.msg ??
          payload.message ??
          payload.alert;
        const body =
          payload.body ??
          payload.data?.body ??
          payload.notification?.body ??
          payload.message ??
          payload.alert;
        const data =
          payload.data ?? payload.payload ?? payload.extra ?? payload.notification?.data ?? {};

        const isNotification = Boolean(
          title ||
            body ||
            (data && Object.keys(data).length > 0) ||
            payload.event ||
            payload.type ||
            payload.msg ||
            payload.message,
        );

        if (isNotification) {
          const id =
            payload.id ??
            payload.notification?.id ??
            payload.message_id ??
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
              console.log("[NotificationProvider] auto-incremented unreadCount to", next);
              return next;
            });
          }

          try {
            await Notifications.scheduleNotificationAsync({
              content: { title: title ?? "Thông báo", body: body ?? "", data },
              trigger: null,
            });
            console.log("[NotificationProvider] scheduled local notification OK");
          } catch (e) {
            console.warn("[NotificationProvider] scheduleNotificationAsync failed", e);
          }
        } else {
          console.log("[NotificationProvider] payload ignored (not a notification):", payload);
        }

        const navPath = data?.path ?? data?.screen ?? payload.path ?? payload.screen;
        if (navPath && typeof onNavigate === "function") {
          try {
            console.log("[NotificationProvider] calling onNavigate with:", String(navPath));
            onNavigate(String(navPath));
          } catch (e) {
            console.warn("[NotificationProvider] onNavigate failed", e);
          }
        } else if (navPath) {
          console.log(
            "[NotificationProvider] server requested navigation but no onNavigate provided:",
            navPath,
          );
        }
      } catch (err) {
        console.warn("[NotificationProvider] handleServerPayload error", err);
      }
    },
    [onNavigate, pushToList, unreadCount],
  );

  // prepare auth header (try api.defaults, then storage)
  const prepareAuthHeader = useCallback(async (): Promise<Record<string, string> | undefined> => {
    try {
      const defaultsHeaders: any = api?.defaults?.headers ?? {};
      const headerCandidates = { ...defaultsHeaders, ...(api.defaults?.headers?.common ?? {}) };
      console.log(
        "[NotificationProvider][DEBUG] api.defaults.headers at connect-time:",
        headerCandidates,
      );

      let authVal: string | undefined =
        (headerCandidates.Authorization as string | undefined) ||
        (headerCandidates.authorization as string | undefined);

      if (!authVal) {
        try {
          const tokenRaw = await getRaw("access_token");
          if (tokenRaw) {
            authVal =
              typeof tokenRaw === "string" && tokenRaw.toLowerCase().startsWith("bearer ")
                ? tokenRaw
                : `Bearer ${tokenRaw}`;
            console.log(
              "[NotificationProvider][DEBUG] got access_token from storage (masked):",
              tokenRaw.slice(0, 8) + "...",
            );
          } else {
            console.log("[NotificationProvider][DEBUG] no access_token found in storage");
          }
        } catch (e) {
          console.warn("[NotificationProvider][DEBUG] reading token from storage failed", e);
        }
      } else {
        console.log(
          "[NotificationProvider][DEBUG] using Authorization from api.defaults (masked):",
          authVal ? authVal.slice(0, 8) + "..." : authVal,
        );
      }

      if (!authVal) return undefined;
      return { Authorization: authVal };
    } catch (e) {
      console.warn("[NotificationProvider][DEBUG] prepareAuthHeader failed", e);
      return undefined;
    }
  }, []);

  // connect SSE (async wrapper)
  const connectSse = useCallback(() => {
    (async () => {
      const url = sseUrl;
      if (!url) {
        console.warn("[NotificationProvider] no sseUrl to connect");
        return;
      }

      console.log("[NotificationProvider] connectSse called, url:", url);

      try {
        if (esRef.current) {
          console.log("[NotificationProvider] closing previous EventSource");
          try {
            esRef.current.close();
          } catch (e) {
            console.warn("[NotificationProvider] error closing previous EventSource", e);
          }
        }
      } catch (e) {
        console.warn("[NotificationProvider] error while cleaning previous EventSource", e);
      }

      try {
        const headers = await prepareAuthHeader();

        if (headers) {
          console.log(
            "[NotificationProvider] Creating EventSource WITH headers (Authorization masked):",
            {
              Authorization: headers.Authorization
                ? headers.Authorization.slice(0, 8) + "..."
                : headers.Authorization,
            },
          );
        } else {
          console.log("[NotificationProvider] Creating EventSource WITHOUT headers.");
        }

        const es = headers ? new EventSource(url, { headers }) : new EventSource(url);
        esRef.current = es;

        es.addEventListener("open", () => {
          console.log("[SSE] open event - connected to:", url);
          backoffRef.current = 1000;
          setSseConnected(true);

          // Wait a bit for any immediate server pushes, then fetch unread-count endpoint as fallback.
          (async () => {
            try {
              await new Promise((r) => setTimeout(r, 600));
              console.log("[SSE] open handler: calling fetchInitialUnreadCount()");
              await fetchInitialUnreadCount();
            } catch (e) {
              console.warn("[SSE] open handler fetchInitialUnreadCount error", e);
            }
          })();
        });

        es.addEventListener("error", (err: any) => {
          console.warn("[SSE] error event", {
            err,
            message: err?.message,
            type: err?.type,
            status: (err && (err.status || err.statusCode || err.status_code)) ?? null,
          });
          setSseConnected(false);

          if (reconnectTimerRef.current == null) {
            const delay = Math.min(backoffRef.current, 30000);
            console.log(`[SSE] scheduling reconnect in ${delay}ms`);
            reconnectTimerRef.current = global.setTimeout(() => {
              reconnectTimerRef.current = null;
              backoffRef.current = Math.min(backoffRef.current * 1.8, 30000);
              console.log("[SSE] attempting reconnect...");
              connectSse();
            }, delay) as unknown as number;
          }
        });

        es.addEventListener("message", (e: any) => {
          try {
            console.log("[SSE] message event raw data:", e?.data ?? "(empty)");
            const raw = e?.data ?? "";
            let payload: any = {};
            try {
              payload = raw ? JSON.parse(raw) : {};
            } catch (parseErr) {
              console.warn("[SSE] message parse error (raw not JSON):", parseErr, "raw:", raw);
              payload = raw;
            }
            console.log("[SSE] parsed message payload:", payload);
            handleServerPayload(payload);
          } catch (err) {
            console.warn("[SSE] message parse error", err, "raw:", e?.data ?? null);
          }
        });

        // unread_count named event (handle number/string/object)
        // @ts-ignore
        es.addEventListener("unread_count", (e: any) => {
          try {
            console.log("[SSE] unread_count event raw:", e?.data ?? "");
            const parsedRaw = e?.data ?? "";
            let parsed: any;
            try {
              parsed = JSON.parse(parsedRaw);
            } catch (err) {
              parsed = parsedRaw;
            }
            console.log("[SSE] unread_count parsed:", parsed);

            let serverCnt: number | undefined = undefined;
            if (typeof parsed === "number") serverCnt = parsed;
            else if (typeof parsed === "string" && parsed.trim() !== "" && !isNaN(Number(parsed)))
              serverCnt = Number(parsed);
            else if (parsed && typeof parsed.unread_count !== "undefined") {
              const v = parsed.unread_count;
              if (typeof v === "number") serverCnt = v;
              else if (typeof v === "string" && !isNaN(Number(v))) serverCnt = Number(v);
            }

            if (typeof serverCnt === "number") {
              const local = unreadCountRef.current ?? unreadCount;
              const lastLocalInc = lastLocalIncrementAtRef.current ?? 0;
              const justIncremented = Date.now() - lastLocalInc < 3000;
              let final = serverCnt;
              if (justIncremented && local > serverCnt) {
                console.log(
                  "[SSE] recent local increment detected -> keeping local:",
                  local,
                  "over server:",
                  serverCnt,
                );
                final = local;
              }
              setUnreadCount(final);
              unreadCountRef.current = final;
              console.log("[SSE] applied unreadCount:", final);
            } else {
              console.log("[SSE] unread_count event did not contain numeric count:", parsed);
            }
          } catch (err) {
            console.warn("[SSE] unread_count parse/error handler:", err);
          }
        });

        // notification named event
        // @ts-ignore
        es.addEventListener("notification", (e: any) => {
          try {
            console.log("[SSE] notification event raw:", e?.data ?? "");
            const parsed = JSON.parse(e?.data ?? "{}");
            handleServerPayload(parsed);
          } catch (err) {
            console.warn("[SSE] notification parse error", err);
          }
        });

        setSseUrl(url);
        console.log("[NotificationProvider] EventSource created, waiting for open...");
      } catch (err) {
        console.warn("[SSE] create EventSource failed", err);
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
    console.log("[NotificationProvider] disconnectSse called");
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    try {
      esRef.current?.close();
      console.log("[NotificationProvider] EventSource closed");
    } catch (e) {
      console.warn("[NotificationProvider] Error closing EventSource", e);
    }
    esRef.current = null;
    setSseConnected(false);
  }, []);

  useEffect(() => {
    if (!sseUrl) {
      console.log("[NotificationProvider] sseUrl not set yet, skipping connect");
      return;
    }
    console.log("[NotificationProvider] sseUrl changed, calling connectSse:", sseUrl);
    connectSse();
    return () => {
      disconnectSse();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sseUrl]);

  const reconnectSse = useCallback(() => {
    console.log("[NotificationProvider] reconnectSse called manually");
    disconnectSse();
    backoffRef.current = 1000;
    setTimeout(() => connectSse(), 300);
  }, [connectSse, disconnectSse]);

  // fetchInitialUnreadCount -> use your API endpoint /notifications/unread-count
  const fetchInitialUnreadCount = useCallback(async () => {
    try {
      console.log(
        "[NotificationProvider] fetchInitialUnreadCount: calling /notifications/unread-count",
      );
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
        if (justIncremented && local > cnt) {
          console.log(
            "[NotificationProvider] fetchInitialUnreadCount: recent local increment -> keeping local:",
            local,
            "over fetched:",
            cnt,
          );
          final = local;
        }
        setUnreadCount(final);
        unreadCountRef.current = final;
        console.log("[NotificationProvider] fetchInitialUnreadCount: applied unreadCount:", final);
      } else {
        console.warn(
          "[NotificationProvider] fetchInitialUnreadCount: unexpected response shape",
          res?.data,
        );
      }
    } catch (err) {
      console.warn("[NotificationProvider] fetchInitialUnreadCount failed", err);
    }
  }, [unreadCount]);

  // attach debug helpers (DEV only)
  useEffect(() => {
    try {
      const G: any =
        typeof globalThis !== "undefined"
          ? globalThis
          : typeof window !== "undefined"
            ? window
            : {};
      if (__DEV__ && G) {
        G.__NOTIF__ = {
          reconnectSse,
          disconnectSse,
          fetchInitialUnreadCount,
          testFetchSseEndpoint: async () => {
            if (!sseUrl) {
              console.warn("[testFetchSseEndpoint] sseUrl not available yet");
              return;
            }
            try {
              const authHeaderCandidate =
                (api?.defaults?.headers?.common?.Authorization as string | undefined) ||
                (api?.defaults?.headers?.Authorization as string | undefined);
              const storageToken = await getRaw("access_token");
              console.log(
                "[testFetchSseEndpoint] authHeaderCandidate (api.defaults):",
                authHeaderCandidate
                  ? authHeaderCandidate.slice(0, 12) + "..."
                  : authHeaderCandidate,
              );
              console.log(
                "[testFetchSseEndpoint] storageToken masked:",
                storageToken ? storageToken.slice(0, 8) + "..." : null,
              );

              const authHeaderToUse =
                authHeaderCandidate ??
                (storageToken
                  ? storageToken.toLowerCase().startsWith("bearer ")
                    ? storageToken
                    : `Bearer ${storageToken}`
                  : undefined);

              console.log(
                "[testFetchSseEndpoint] using auth header (masked):",
                authHeaderToUse ? authHeaderToUse.slice(0, 12) + "..." : null,
              );

              const res = await fetch(sseUrl!, {
                method: "GET",
                headers: {
                  Accept: "text/event-stream",
                  ...(authHeaderToUse ? { Authorization: authHeaderToUse } : {}),
                },
              });
              console.log(
                "[testFetchSseEndpoint] status:",
                res.status,
                "statusText:",
                res.statusText,
              );
              const bodySnippet = await res.text().then((t) => t.slice(0, 1000));
              console.log("[testFetchSseEndpoint] body snippet (first 1000 chars):", bodySnippet);
            } catch (err) {
              console.warn("[testFetchSseEndpoint] fetch error:", err);
            }
          },

          forceIncrement: () => {
            setUnreadCount((u) => {
              const next = u + 1;
              lastLocalIncrementAtRef.current = Date.now();
              unreadCountRef.current = next;
              console.log(`[__NOTIF__.forceIncrement] unreadCount: ${u} → ${next}`);
              return next;
            });
          },

          forceSetUnread: (n: number) => {
            console.log(`[__NOTIF__.forceSetUnread] unreadCount set to: ${n}`);
            setUnreadCount(n);
            unreadCountRef.current = n;
          },

          forceAddNotification: () => {
            const fakeNotif = {
              id: `${Date.now()}`,
              title: "Test notification",
              body: "This is a forced notification",
              data: {},
              receivedAt: new Date().toISOString(),
              read: false,
            };
            console.log("[__NOTIF__.forceAddNotification] added:", fakeNotif);
            setNotifications((prev) => [fakeNotif, ...prev]);
            setUnreadCount((u) => {
              const next = u + 1;
              lastLocalIncrementAtRef.current = Date.now();
              unreadCountRef.current = next;
              return next;
            });
          },
        };
        console.log(
          "[NotificationProvider] debug helpers attached to globalThis.__NOTIF__ (DEV only)",
        );
      }
    } catch (e) {
      console.warn("[NotificationProvider] attaching debug helpers failed", e);
    }

    return () => {
      try {
        const G: any =
          typeof globalThis !== "undefined"
            ? globalThis
            : typeof window !== "undefined"
              ? window
              : {};
        if (G && G.__NOTIF__) delete G.__NOTIF__;
      } catch {}
    };
  }, [reconnectSse, fetchInitialUnreadCount, disconnectSse, sseUrl]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        sseConnected,
        sseUrl,
        reconnectSse,
        testFetchSseEndpoint: async () => {
          const G: any =
            typeof globalThis !== "undefined"
              ? globalThis
              : typeof window !== "undefined"
                ? window
                : {};
          if (G && G.__NOTIF__ && typeof G.__NOTIF__.testFetchSseEndpoint === "function") {
            return G.__NOTIF__.testFetchSseEndpoint();
          }
        },
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
