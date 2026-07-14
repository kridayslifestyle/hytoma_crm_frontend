import { useEffect, useRef, useState } from "react";
import { getConversations, getThread, sendReply } from "../services/inboxApi";

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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
    // optimistic unread-clear so the badge disappears immediately
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

      <div className="bg-white rounded-xl shadow flex h-[calc(100vh-180px)] overflow-hidden">
        {/* Conversation list */}
        <div className="w-full sm:w-80 border-r flex flex-col shrink-0">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos && (
              <div className="p-4 text-sm text-gray-400">Loading…</div>
            )}
            {!loadingConvos && conversations.length === 0 && (
              <div className="p-4 text-sm text-gray-400">
                No WhatsApp conversations yet.
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.phone}
                onClick={() => openConversation(c.phone)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                  selectedPhone === c.phone ? "bg-orange-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800 truncate">
                    {c.customer_name || c.phone}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                    {timeAgo(c.last_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500 truncate pr-2">
                    {c.last_direction === "out" ? "You: " : ""}
                    {c.last_message}
                  </span>
                  {c.unread_count > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] rounded-full px-1.5 py-0.5 shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread + reply */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedPhone && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to view messages
            </div>
          )}

          {selectedPhone && thread && (
            <>
              <div className="px-4 py-3 border-b">
                <div className="font-semibold text-gray-800">
                  {thread.customer_name || thread.phone}
                </div>
                <div className="text-xs text-gray-400">{thread.phone}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {thread.messages.length === 0 && (
                  <div className="text-sm text-gray-400 text-center mt-8">
                    No messages yet.
                  </div>
                )}
                {thread.messages.map((m) => (
                  <div
                    key={m._id}
                    className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.direction === "out"
                          ? "bg-orange-500 text-white rounded-br-sm"
                          : "bg-white border rounded-bl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.body}</div>
                      <div
                        className={`text-[10px] mt-1 ${
                          m.direction === "out" ? "text-orange-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleString()}
                        {m.direction === "out" && m.success === false && " · failed"}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  placeholder="Type a reply…"
                  className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}