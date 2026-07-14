import { useEffect, useRef, useState } from "react";
import { getConversations, getThread, sendReply } from "../services/inboxApi";

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || name[0].toUpperCase();
}

// Deterministic soft color per person, so the same customer always gets the
// same avatar color across the list and the thread header.
const AVATAR_PALETTE = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
];
function avatarColor(key) {
  let hash = 0;
  for (let i = 0; i < (key || "").length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function Avatar({ name, phone, size = "w-10 h-10 text-sm" }) {
  const label = name && name !== phone ? name : phone;
  return (
    <div
      className={`${size} ${avatarColor(phone)} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {initials(label)}
    </div>
  );
}

function groupByDay(messages) {
  const groups = [];
  let currentDay = null;
  let bucket = null;
  for (const m of messages) {
    const day = new Date(m.created_at).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      bucket = { day, items: [] };
      groups.push(bucket);
    }
    bucket.items.push(m);
  }
  return groups;
}

function dayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [thread, setThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadThread = async (phone) => {
    try {
      const data = await getThread(phone);
      setThread(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 8000); // light polling, no websockets in this app
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selectedPhone) return;
    loadThread(selectedPhone);
    const id = setInterval(() => loadThread(selectedPhone), 5000);
    return () => clearInterval(id);
  }, [selectedPhone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const openConversation = (phone) => {
    setSelectedPhone(phone);
    setConversations((prev) =>
      prev.map((c) => (c.phone === phone ? { ...c, unread_count: 0 } : c)),
    );
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedPhone) return;
    setSending(true);
    try {
      await sendReply(selectedPhone, replyText.trim());
      setReplyText("");
      await loadThread(selectedPhone);
      await loadConversations();
    } catch (e) {
      alert(
        e.message ||
          "Failed to send. Note: WhatsApp only allows free replies within 24h of the client's last message — outside that window you'd need an approved template.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">WhatsApp Inbox</h1>
        <p className="text-gray-500 mt-1">
          See and reply to whatever clients send back on WhatsApp.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow flex h-[calc(100vh-180px)] overflow-hidden border border-gray-100">
        {/* Conversation list */}
        <div className="w-full sm:w-80 border-r border-gray-100 flex flex-col shrink-0 bg-white">
          <div className="px-4 py-3.5 border-b border-gray-100">
            <span className="font-semibold text-gray-800">Conversations</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos && (
              <div className="p-6 text-sm text-gray-400 text-center">Loading…</div>
            )}
            {!loadingConvos && conversations.length === 0 && (
              <div className="p-6 text-sm text-gray-400 text-center">
                No WhatsApp conversations yet.
              </div>
            )}
            {conversations.map((c) => {
              const active = selectedPhone === c.phone;
              return (
                <button
                  key={c.phone}
                  onClick={() => openConversation(c.phone)}
                  className={`w-full text-left px-4 py-3 flex gap-3 items-start border-l-[3px] transition ${
                    active
                      ? "bg-orange-50 border-l-orange-500"
                      : "border-l-transparent hover:bg-gray-50"
                  }`}
                >
                  <Avatar name={c.customer_name} phone={c.phone} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-medium text-gray-800 truncate">
                        {c.customer_name || c.phone}
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {timeAgo(c.last_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5 gap-2">
                      <span className="text-xs text-gray-500 truncate">
                        {c.last_direction === "out" && (
                          <span className="text-gray-400">You: </span>
                        )}
                        {c.last_message}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread + reply */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedPhone && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-3xl">
                💬
              </div>
              <span className="text-sm text-gray-400">
                Select a conversation to view messages
              </span>
            </div>
          )}

          {selectedPhone && thread && (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                <Avatar name={thread.customer_name} phone={thread.phone} size="w-9 h-9 text-xs" />
                <div>
                  <div className="font-semibold text-gray-800 leading-tight">
                    {thread.customer_name || thread.phone}
                  </div>
                  <div className="text-xs text-gray-400">{thread.phone}</div>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto px-6 py-4"
                style={{
                  backgroundColor: "#F6F3EF",
                  backgroundImage:
                    "radial-gradient(#00000006 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              >
                {thread.messages.length === 0 && (
                  <div className="text-sm text-gray-400 text-center mt-8">
                    No messages yet.
                  </div>
                )}

                {groupByDay(thread.messages).map((group) => (
                  <div key={group.day}>
                    <div className="flex justify-center my-3">
                      <span className="text-[11px] text-gray-500 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                        {dayLabel(group.day)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {group.items.map((m) => {
                        const isOut = m.direction === "out";
                        return (
                          <div
                            key={m._id}
                            className={`flex ${isOut ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] px-3.5 py-2 text-sm shadow-sm ${
                                isOut
                                  ? "bg-orange-500 text-white rounded-2xl rounded-br-md"
                                  : "bg-white text-gray-800 rounded-2xl rounded-bl-md"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{m.body}</div>
                              <div
                                className={`text-[10px] mt-1 text-right ${
                                  isOut ? "text-orange-100" : "text-gray-400"
                                }`}
                              >
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {isOut && m.success === false && " · failed"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  placeholder="Type a reply…"
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500 text-white w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition"
                  title="Send"
                >
                  {sending ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 -rotate-45 translate-x-[1px]"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}