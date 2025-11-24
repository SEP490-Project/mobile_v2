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
  // kept for compatibility but will be a no-op if backend lacks endpoint
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

  // unread + list
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // refs for listeners and SSE
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef<number>(1000);
  const reconnectTimerRef = useRef<number | null>(null);

  // helper refs to avoid races and decide merge policy
  const unreadCountRef = useRef<number>(0);
  const lastLocalIncrementAtRef = useRef<number | null>(null);

  // keep unreadCountRef in sync whenever state changes from anywhere
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

  // handle incoming payloads (message events)
  const handleServerPayload = useCallback(
    async (payload: any) => {
      try {
        console.log("[NotificationProvider] handleServerPayload - raw payload:", payload);

        // If server provided unread_count explicitly — has authoritative value
        if (typeof payload.unread_count === "number") {
          const serverCnt = payload.unread_count;
          console.log("[NotificationProvider] server provided unread_count:", serverCnt);

          // Merge policy: if we recently incremented locally and local > server, keep local
          const local = unreadCountRef.current ?? unreadCount;
          const lastLocalInc = lastLocalIncrementAtRef.current ?? 0;
          const justIncremented = Date.now() - lastLocalInc < 3000; // 3s window

          let final = serverCnt;
          if (justIncremented && local > serverCnt) {
            console.log(
              "[NotificationProvider] recent local increment detected, keeping local unreadCount:",
              local,
              "instead of server value:",
              serverCnt,
            );
            final = local;
          }

          setUnreadCount(final);
          unreadCountRef.current = final;
        }

        // notification payload (title/body may be inside data)
        const title = payload.title ?? payload.data?.title;
        const body = payload.body ?? payload.data?.body;
        const data = payload.data ?? {};

        const isNotification = Boolean(title || body);

        if (isNotification) {
          const id = payload.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const item: NotificationItem = {
            id,
            title,
            body,
            data,
            receivedAt: new Date().toISOString(),
            read: false,
          };
          pushToList(item);

          // If server didn't provide unread_count in this payload, auto-increment local unread counter
          if (typeof payload.unread_count !== "number") {
            setUnreadCount((u) => {
              const next = u + 1;
              lastLocalIncrementAtRef.current = Date.now();
              unreadCountRef.current = next;
              console.log("[NotificationProvider] auto-incremented unreadCount to", next);
              return next;
            });
          }

          // schedule local notification so user sees banner
          try {
            await Notifications.scheduleNotificationAsync({
              content: { title: title ?? "Thông báo", body: body ?? "", data },
              trigger: null,
            });
            console.log("[NotificationProvider] scheduled local notification OK");
          } catch (e) {
            console.warn("[NotificationProvider] scheduleNotificationAsync failed", e);
          }
        }

        // navigation from payload if present
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
    [onNavigate, pushToList],
  );

  // prepare auth header (try api.defaults, then storage)
  const prepareAuthHeader = useCallback(async (): Promise<Record<string, string> | undefined> => {
    try {
      const defaultsHeaders: any = api?.defaults?.headers ?? {};
      const headerCandidates = {
        ...defaultsHeaders,
        ...(api.defaults?.headers?.common ?? {}),
      };
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

          // No server unread-count endpoint available; do not fetch.
          // We allow server to push initial events; we avoid overwriting local increments.
          // Logging is helpful to observe timing.
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
            const payload = raw ? JSON.parse(raw) : {};
            console.log("[SSE] parsed payload:", payload);
            handleServerPayload(payload);
          } catch (err) {
            console.warn("[SSE] message parse error", err, "raw:", e?.data ?? null);
          }
        });

        // replace your unread_count listener with this
        // @ts-ignore
        es.addEventListener("unread_count", (e: any) => {
          try {
            console.log("[SSE] unread_count event raw:", e?.data ?? "");
            const parsedRaw = e?.data ?? "";
            let parsed: any;
            try {
              parsed = JSON.parse(parsedRaw);
            } catch (err) {
              // If not JSON, maybe it's a plain number string like "66"
              parsed = parsedRaw;
            }
            console.log("[SSE] unread_count parsed:", parsed);

            // handle both shapes:
            // 1) parsed is a number: 66
            // 2) parsed is an object: { unread_count: 66 } or { unread_count: "66" }
            let serverCnt: number | undefined = undefined;
            if (typeof parsed === "number") {
              serverCnt = parsed;
            } else if (
              typeof parsed === "string" &&
              parsed.trim() !== "" &&
              !isNaN(Number(parsed))
            ) {
              serverCnt = Number(parsed);
            } else if (parsed && typeof parsed.unread_count !== "undefined") {
              const v = parsed.unread_count;
              if (typeof v === "number") serverCnt = v;
              else if (typeof v === "string" && !isNaN(Number(v))) serverCnt = Number(v);
            }

            if (typeof serverCnt === "number") {
              // merge policy: if we recently incremented locally and local > server, keep local
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

        // optional notification named event
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

  // fetchInitialUnreadCount is a no-op since backend doesn't have endpoint;
  // kept for compatibility but logs a helpful warning.
  const fetchInitialUnreadCount = useCallback(async () => {
    console.log(
      "[NotificationProvider] fetchInitialUnreadCount called but backend lacks endpoint - no-op",
    );
    return Promise.resolve();
  }, []);

  // attach debug helpers
  useEffect(() => {
    // attach to globalThis (safer across environments)
    try {
      // @ts-ignore
      const G: any =
        typeof globalThis !== "undefined"
          ? globalThis
          : typeof window !== "undefined"
            ? window
            : {};
      if (G) {
        // @ts-ignore
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

              const res = await fetch(sseUrl, {
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

          // debug helpers
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
        console.log("[NotificationProvider] debug helpers attached to globalThis.__NOTIF__");
        console.log(
          "[NotificationProvider] try globalThis.__NOTIF__.forceIncrement() / .forceAddNotification()",
        );
      }
    } catch (e) {
      console.warn("[NotificationProvider] attaching debug helpers failed", e);
    }

    return () => {
      try {
        // @ts-ignore
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
          // proxy to global helper (keeps type)
          // @ts-ignore
          const G: any =
            typeof globalThis !== "undefined"
              ? globalThis
              : typeof window !== "undefined"
                ? window
                : {};
          if (G && G.__NOTIF__ && typeof G.__NOTIF__.testFetchSseEndpoint === "function") {
            // @ts-ignore
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
