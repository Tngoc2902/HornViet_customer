"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Headset, Loader2, MessageCircle, Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useWatchChat } from "@/contexts/realtime-context";
import { useRealtime } from "@/hooks/use-realtime";
import { imageUrl, toApiError } from "@/lib/api/http";
import { chatApi } from "@/lib/api/services";
import { ChatSender, ChatStatus, type ChatAccess, type ChatConversation, type ChatMessage } from "@/lib/api/types";
import { formatVND, ORDER_STATUS } from "@/lib/hsv/format";
import { loadLocalStorage, removeLocalStorage, saveLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

// Trình duyệt nhớ hội thoại đang mở (khách vãng lai cần khóa để mở lại). Chỉ là tiện ích: mất thì bắt đầu hội thoại mới.
const STORAGE_KEY = "hsv-chat";
type Stored = { conversationId: number; guestKey: string | null };

const WELCOME =
  "Xin chào! Mình là trợ lý tự động của Hồn Sừng Việt. Bạn cần tìm sản phẩm, hỏi giá, phí giao hàng hay tra đơn hàng? " +
  "Cần gặp người thật thì bấm “Chat với nhân viên” nhé.";
const STARTERS = ["Shop có những sản phẩm gì?", "Phí giao hàng thế nào?", "Đơn hàng của tôi đến đâu rồi?", "Chính sách đổi trả"];

/** Ô chat nổi ở góc phải: bot trả lời tự động, khách bấm "Chat với nhân viên" để nhân viên trả lời trực tiếp. */
export function ChatWidget() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [access, setAccess] = useState<Stored | null>(null);
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.Bot);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const sessionKey = session?.userId ?? "guest";

  const req = useCallback((a: Stored | null): ChatAccess => (a ? { conversationId: a.conversationId, guestKey: a.guestKey ?? undefined } : {}), []);

  const remember = useCallback((a: Stored | null) => {
    setAccess(a);
    if (a) saveLocalStorage(STORAGE_KEY, a);
    else removeLocalStorage(STORAGE_KEY);
  }, []);

  const addMessages = useCallback((list: ChatMessage[]) => {
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const fresh = list.filter((m) => !ids.has(m.id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  // Mở lại hội thoại đang dở khi tải trang / đăng nhập, đăng xuất.
  useEffect(() => {
    let cancelled = false;
    const stored = loadLocalStorage<Stored | null>(STORAGE_KEY, null);
    chatApi
      .get(req(stored))
      .then((c) => {
        if (cancelled) return;
        if (!c) {
          remember(null);
          setMessages([]);
          setStatus(ChatStatus.Bot);
          return;
        }
        remember({ conversationId: c.id, guestKey: c.guestKey ?? stored?.guestKey ?? null });
        setMessages(c.messages);
        setStatus(c.status);
        setStaffName(c.staffName);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [sessionKey, req, remember]);

  useWatchChat(access?.conversationId, access?.guestKey);

  useRealtime("ChatMessage", ({ conversationId, message }) => {
    if (conversationId !== access?.conversationId) return;
    addMessages([message]);
    if (message.sender === ChatSender.Staff && message.staffName) setStaffName(message.staffName);
    if (!openRef.current && message.sender !== ChatSender.Customer) setUnread((n) => n + 1);
  });
  useRealtime("ChatConversationChanged", (e) => {
    if (e.conversationId === access?.conversationId) setStatus(e.status);
  });

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, open]);

  const send = async (raw: string) => {
    const value = raw.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    setPending(value);
    setText("");
    try {
      const r = await chatApi.send(req(status === ChatStatus.Closed ? null : access), value);
      if (r.conversationId !== access?.conversationId) {
        // Hội thoại mới (lần đầu nhắn hoặc hội thoại cũ đã kết thúc).
        setMessages([]);
        setStaffName(null);
      }
      remember({ conversationId: r.conversationId, guestKey: r.guestKey ?? (r.conversationId === access?.conversationId ? access.guestKey : null) });
      setStatus(r.status);
      addMessages(r.messages);
    } catch (e) {
      setError(toApiError(e).message);
      setText(value);
    } finally {
      setPending(null);
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const act = async (fn: (a: ChatAccess) => Promise<ChatConversation>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const c = await fn(req(access));
      if (c.id !== access?.conversationId) setMessages([]);
      remember({ conversationId: c.id, guestKey: c.guestKey ?? access?.guestKey ?? null });
      setStatus(c.status);
      setStaffName(c.staffName);
      addMessages(c.messages);
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  const endChat = async () => {
    if (busy || !access) return;
    setBusy(true);
    try {
      await chatApi.close(req(access));
      setStatus(ChatStatus.Closed);
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    remember(null);
    setMessages([]);
    setStatus(ChatStatus.Bot);
    setStaffName(null);
    setError(null);
  };

  const subtitle =
    status === ChatStatus.WaitingStaff
      ? "Đang chờ nhân viên…"
      : status === ChatStatus.WithStaff
        ? `${staffName ?? "Nhân viên"} đang hỗ trợ bạn`
        : status === ChatStatus.Closed
          ? "Cuộc trò chuyện đã kết thúc"
          : "Trợ lý tự động · trả lời ngay";
  const botMode = status === ChatStatus.Bot;
  const lastBot = [...messages].reverse().find((m) => m.sender !== ChatSender.Customer);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          aria-label="Mở ô chat hỗ trợ"
          className="fixed bottom-[84px] right-3 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_22px_rgba(91,55,36,.35)] transition hover:scale-105 hover:bg-brand-deep md:bottom-8 md:right-5"
        >
          <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <section
          aria-label="Chat hỗ trợ"
          className="fixed inset-0 z-50 flex flex-col bg-white md:inset-auto md:bottom-6 md:right-5 md:h-[min(620px,calc(100vh-48px))] md:w-[390px] md:border md:border-line md:shadow-[0_18px_50px_rgba(0,0,0,.18)]"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              {status === ChatStatus.WithStaff ? <Headset className="h-[18px] w-[18px]" /> : <MessageCircle className="h-[18px] w-[18px]" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold text-ink">Hồn Sừng Việt</p>
              <p className="flex items-center gap-1.5 text-[12px] text-subtle">
                {status === ChatStatus.WithStaff && <span className="h-1.5 w-1.5 rounded-full bg-ok-solid" />}
                {subtitle}
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng ô chat" className="flex h-9 w-9 items-center justify-center text-ink hover:bg-surface-2">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {loaded && messages.length === 0 && (
              <>
                <Bubble side="left">{WELCOME}</Bubble>
                <Chips items={STARTERS} onPick={send} disabled={busy} />
              </>
            )}
            {messages.map((m) => (
              <MessageView
                key={m.id}
                m={m}
                canAskStaff={botMode && m === lastBot}
                onAskStaff={() => act(chatApi.requestStaff)}
                onPick={send}
                busy={busy}
              />
            ))}
            {pending && <Bubble side="right" muted>{pending}</Bubble>}
            {busy && pending && botMode && (
              <div className="flex items-center gap-2 text-[12.5px] text-subtle">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang trả lời…
              </div>
            )}
          </div>

          {error && <p className="border-t border-danger-line bg-danger-soft px-4 py-2 text-[12.5px] text-danger">{error}</p>}

          <div className="border-t border-line px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5">
            <div className="mb-2 flex items-center justify-between gap-2 text-[12.5px]">
              {botMode && (
                <button type="button" disabled={busy} onClick={() => act(chatApi.requestStaff)} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline disabled:opacity-60">
                  <Headset className="h-4 w-4" /> Chat với nhân viên
                </button>
              )}
              {status === ChatStatus.WaitingStaff && (
                <button type="button" disabled={busy} onClick={() => act(chatApi.cancelStaff)} className="font-medium text-subtle hover:text-ink hover:underline disabled:opacity-60">
                  Hủy, quay lại trợ lý tự động
                </button>
              )}
              {(status === ChatStatus.WithStaff || status === ChatStatus.WaitingStaff) && (
                <button type="button" disabled={busy} onClick={endChat} className="ml-auto font-medium text-subtle hover:text-ink hover:underline disabled:opacity-60">
                  Kết thúc
                </button>
              )}
              {status === ChatStatus.Closed && (
                <button type="button" onClick={startOver} className="font-medium text-brand hover:underline">
                  Bắt đầu cuộc trò chuyện mới
                </button>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(text);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={text}
                rows={1}
                maxLength={1000}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send(text);
                  }
                }}
                placeholder={status === ChatStatus.Closed ? "Nhắn để bắt đầu cuộc trò chuyện mới…" : "Nhập câu hỏi của bạn…"}
                aria-label="Tin nhắn"
                className="max-h-28 min-h-[42px] flex-1 resize-none border border-line px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-brand"
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                aria-label="Gửi"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-brand text-white hover:bg-brand-deep disabled:opacity-50"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}

function Bubble({ side, muted, children }: { side: "left" | "right"; muted?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex", side === "right" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line px-3.5 py-2.5 text-[14px] leading-relaxed",
          side === "right" ? "bg-brand text-white" : "bg-surface-2 text-ink",
          muted && "opacity-70"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Chips({ items, onPick, disabled }: { items: string[]; onPick: (t: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onPick(q)}
          className="border border-line px-3 py-1.5 text-[12.5px] text-ink hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

function MessageView({
  m,
  canAskStaff,
  onAskStaff,
  onPick,
  busy,
}: {
  m: ChatMessage;
  canAskStaff: boolean;
  onAskStaff: () => void;
  onPick: (t: string) => void;
  busy: boolean;
}) {
  if (m.sender === ChatSender.System)
    return <p className="mx-auto max-w-[90%] text-center text-[12px] leading-relaxed text-subtle">{m.content}</p>;
  if (m.sender === ChatSender.Customer) return <Bubble side="right">{m.content}</Bubble>;

  return (
    <div className="space-y-2">
      {m.sender === ChatSender.Staff && <p className="text-[11.5px] font-medium text-subtle">{m.staffName ?? "Nhân viên"}</p>}
      <Bubble side="left">{m.content}</Bubble>
      {m.ai && (
        <p className="flex items-center gap-1 text-[11px] text-faint">
          <Sparkles className="h-3 w-3" /> Trả lời bởi AI, có thể chưa chính xác
        </p>
      )}
      {m.products && m.products.length > 0 && (
        <div className="space-y-2">
          {m.products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="flex gap-3 border border-line bg-white p-2 hover:border-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(p.mainImage, 160)} alt="" className="h-16 w-16 shrink-0 bg-surface-2 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13.5px] font-medium text-ink">{p.name}</p>
                <p className="mt-0.5 text-[13px] text-ink">{formatVND(p.price)}</p>
                {p.variants ? (
                  <p className="mt-0.5 text-[11.5px] leading-snug text-subtle">{p.variants.join(" · ")}</p>
                ) : (
                  !p.inStock && <p className="mt-0.5 text-[11.5px] text-danger">Hết hàng</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      {m.orders && m.orders.length > 0 && (
        <div className="space-y-2">
          {m.orders.map((o) => (
            <Link key={o.id} href="/account/orders" className="block border border-line bg-white px-3 py-2 hover:border-brand">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-ink">{o.code}</span>
                <span className="text-[12px] font-medium" style={{ color: ORDER_STATUS[o.status].fg }}>
                  {ORDER_STATUS[o.status].label}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-subtle">
                {new Date(o.creationTime).toLocaleDateString("vi-VN")} · {o.itemCount} sản phẩm · {formatVND(o.payableAmount)}
              </p>
            </Link>
          ))}
        </div>
      )}
      {m.links && m.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {m.links.map((l) => (
            <Link key={l.url} href={l.url} className="border border-brand px-3 py-1.5 text-[12.5px] font-medium text-brand hover:bg-brand hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>
      )}
      {m.quickReplies && m.quickReplies.length > 0 && <Chips items={m.quickReplies} onPick={onPick} disabled={busy} />}
      {m.suggestStaff && canAskStaff && (
        <button type="button" disabled={busy} onClick={onAskStaff} className="hsv-btn h-10 bg-brand px-4 text-[12px] text-white hover:bg-brand-deep">
          <Headset className="h-4 w-4" /> Chat với nhân viên
        </button>
      )}
    </div>
  );
}
