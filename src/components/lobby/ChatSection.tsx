import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../server/types/socket";
import { ClientLogger } from "../../utils/clientLogger";

interface Message {
  playerId: string;
  message: string;
}

interface ChatSectionProps {
  messages: Message[];
  currentPlayerId: string;
  gameId: string;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  onSendMessage: (message: string) => void;
}

const logger = new ClientLogger();

export function ChatSection({
  messages,
  currentPlayerId,
  gameId,
  socket,
  onSendMessage,
}: ChatSectionProps) {
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll, typingUsers]);

  useEffect(() => {
    if (!socket) return;
    socket.on("lobby:typing", ({ playerId, isTyping }) => {
      logger.network("Typing event received", {
        playerId,
        isTyping,
      });
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) {
          next.add(playerId);
        } else {
          next.delete(playerId);
        }
        return next;
      });
    });

    return () => {
      socket.off("lobby:typing");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing status when component unmounts
      socket.emit("lobby:typing", { gameId, isTyping: false });
    };
  }, [socket, gameId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket) return;
    setMessageInput(e.target.value);

    // Only emit typing events if the input is not empty
    if (e.target.value.trim()) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing start
      socket.emit("lobby:typing", { gameId, isTyping: true });

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("lobby:typing", { gameId, isTyping: false });
      }, 1000);
    } else {
      // If input is empty, immediately stop typing
      socket.emit("lobby:typing", { gameId, isTyping: false });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendMessage = () => {
    if (!socket) return;
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput("");
    setAutoScroll(true);
    socket.emit("lobby:typing", { gameId, isTyping: false });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.clientHeight - element.scrollTop
      ) < 10;
    setAutoScroll(isAtBottom);
  };

  const typingIndicator = Array.from(typingUsers)
    .filter((id) => id !== currentPlayerId) // Filter out current user first
    .map((id) => id.slice(0, 6));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-[#FF5E62]" />
        <h3 className="text-sm font-medium text-white/70">Chat</h3>
      </div>

      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
        <ScrollArea
          className="h-[240px]"
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          <div className="p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  {msg.playerId === "system" ? (
                    // System message styling
                    <span className="text-sm text-[#FF5E62]/70 italic w-full text-center">
                      {msg.message}
                    </span>
                  ) : (
                    // Regular message styling (existing code)
                    <>
                      <span
                        className={`flex-shrink-0 px-2 py-1 rounded font-medium
            ${
              msg.playerId === currentPlayerId
                ? "bg-[#FF9966]/10 text-[#FF9966]"
                : "bg-[#FF5E62]/10 text-[#FF5E62]"
            }`}
                      >
                        {msg.playerId === currentPlayerId
                          ? "You"
                          : msg.playerId.slice(0, 6)}
                      </span>
                      <span className="text-white/70 leading-relaxed break-all py-1">
                        {msg.message}
                      </span>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {typingIndicator.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                  className="flex items-center gap-2 text-sm text-white/50"
                >
                  <div className="flex gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce [animation-delay:0.2s]">
                      •
                    </span>
                    <span className="animate-bounce [animation-delay:0.4s]">
                      •
                    </span>
                  </div>
                  <span>
                    {typingIndicator.length === 1
                      ? `${typingIndicator[0]} is typing...`
                      : `${typingIndicator.length} people are typing...`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-2">
        <Input
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30
            focus:border-[#FF5E62]/50 focus:ring-[#FF5E62]/20"
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:opacity-90
            transition-opacity shadow-lg shadow-[#FF5E62]/20"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
