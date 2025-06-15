import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatConversation, Message } from '../../types/Chat';
import {
  getConversationMessages,
  getUnreadConversationMessages,
  viewConversationMessages
} from '../../api/chats';
import { UserContext } from '../../context/UserProvider';
import { formatDateHeader, groupMessagesByDate } from '../../utils/dateFormat';
import ChatMessageComponent from './ChatMessageComponent';

type ChatMessagesType = {
  chat: ChatConversation;
};

const PAGE_SIZE = 10;

const mergeMessages = (existing: Message[], incoming: Message[]): Message[] => {
  const map = new Map(existing.map(m => [m.id, m]));
  for (const msg of incoming) {
    map.set(msg.id, msg);
  }
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
};

export const ChatMessages: React.FC<ChatMessagesType> = ({ chat }) => {
  const { user, messageSocket } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const seenMessages = useRef<Set<string>>(new Set());
  const readBuffer = useRef<string[]>([]);
  const readTimeout = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        seenMessages.current = new Set();
        readBuffer.current = [];
        messageRefs.current = {};
        setMessages([]);
        setHasMore(true);
        setLoading(true);

        const unread = await getUnreadConversationMessages(chat.id);
        let initial: Message[] = [];

        if (unread.length > 0) {
          const oldestUnread = unread[0];
          const older = await getConversationMessages(chat.id, PAGE_SIZE, oldestUnread.id);
          const olderFiltered = older.filter(o => !unread.some(u => u.id === o.id));
          initial = [...olderFiltered, ...unread];
        } else {
          const latest = await getConversationMessages(chat.id, PAGE_SIZE);
          initial = latest;
        }

        setMessages(initial);

        setTimeout(() => {
          if (unread.length > 0) {
            const firstUnreadId = unread[0]?.id;
            if (firstUnreadId && messageRefs.current[firstUnreadId]) {
              messageRefs.current[firstUnreadId]?.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
          } else {
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
          }
        }, 100);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [chat.id]);

  useEffect(() => {
    if (!user || messages.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const messageId = entry.target.getAttribute('data-id');
        if (
          entry.isIntersecting &&
          messageId &&
          !seenMessages.current.has(messageId)
        ) {
          const msg = messages.find(m => m.id === messageId);
          const alreadyRead = msg?.readBy?.some(rb => rb.userId === user.id);
          if (!alreadyRead) {
            seenMessages.current.add(messageId);
            readBuffer.current.push(messageId);

            if (readTimeout.current) clearTimeout(readTimeout.current);

            readTimeout.current = setTimeout(async () => {
              const toSend = [...new Set(readBuffer.current)];
              readBuffer.current = [];

              if (toSend.length > 0) {
                try {
                  await viewConversationMessages(chat.id, toSend);
                  setMessages(prev =>
                    prev.map(m =>
                      toSend.includes(m.id)
                        ? {
                            ...m,
                            readBy: m.readBy?.some(rb => rb.userId === user.id)
                              ? m.readBy
                              : [...(m.readBy || []), { userId: user.id, timestamp: Date.now() }]
                          }
                        : m
                    )
                  );
                } catch (err) {
                  console.error('Failed to mark messages as read:', err);
                }
              }
            }, 300);
          }
        }
      });
    }, { threshold: 0.5 });

    messages.forEach(msg => {
      const el = messageRefs.current[msg.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages, user]);

  const handleScroll = async () => {
    if (!containerRef.current || loadingMore || !hasMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop < 100) {
      setLoadingMore(true);
      try {
        const lastMessageId = messages[0]?.id;
        const older = await getConversationMessages(chat.id, PAGE_SIZE, lastMessageId);
        if (older.length < PAGE_SIZE) setHasMore(false);
        setMessages(prev => mergeMessages(older, prev));
      } catch (err) {
        console.error('Error fetching older messages:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!messageSocket) return;

    const handleNewMessage = (msg: Message) => {
      if (msg.conversation === chat.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => {
          containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);
      }
    };

    const handleViewedMessages = (updatedMessages: Message[]) => {
      setMessages(prev => {
        const map = new Map(prev.map(m => [m.id, m]));
        for (const msg of updatedMessages) {
          map.set(msg.id, msg);
        }
        return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      });
    };

    messageSocket.on('new-conversation-message', handleNewMessage);
    messageSocket.on('conversation-messages-viewed', handleViewedMessages);

    return () => {
      messageSocket.off('new-conversation-message', handleNewMessage);
      messageSocket.off('conversation-messages-viewed', handleViewedMessages);
    };
  }, [chat.id, messageSocket]);

  if (!user || loading) {
    return <div className="p-4 text-gray-600 text-sm">Loading chat...</div>;
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col gap-2 overflow-y-auto h-full px-4 py-2"
    >
      {loadingMore && (
        <div className="text-center text-sm text-gray-500">Loading more...</div>
      )}
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="text-center text-md font-semibold text-gray-800 my-2">
            {formatDateHeader(date)}
          </div>
          {msgs.map((msg: Message) => (
            <div
              key={msg.id}
              ref={el => (messageRefs.current[msg.id] = el)}
              data-id={msg.id}
            >
              <ChatMessageComponent
                message={msg}
                currentUserId={user.id}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
