import React, { useContext, useEffect, useRef, useState } from 'react';
import { GroupConversation, Message } from '../../types/Chat';
import { getGroupMessages, getUnreadGroupMessages, viewGroupMessages } from '../../api/groups';
import GroupMessageComponent from './GroupMessageComponent';
import { UserContext } from '../../context/UserProvider';
import { User } from '../../types/User';
import { getUsersData } from '../../api/users';
import { formatDateHeader, groupMessagesByDate } from '../../utils/dateFormat';
import backgroundPhoto from "../../Images/backgroud-photo.svg";

type GroupMessagesType = {
    group: GroupConversation;
};

export const GroupMessages: React.FC<GroupMessagesType> = ({ group }) => {
    const { user, messageSocket } = useContext(UserContext);
    const [members, setMembers] = useState<Map<string, User>>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const seenMessages = useRef<Set<string>>(new Set());
    const readBuffer = useRef<string[]>([]);
    const readTimeout = useRef<NodeJS.Timeout | null>(null);
    const messageRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        const fetchInitialMessages = async () => {
            try {
                setMessages([]);
                seenMessages.current = new Set();
                readBuffer.current = [];
                messageRefs.current = {};
                setHasMore(true);

                const unread = await getUnreadGroupMessages(group.id);

                let initialMessages: Message[] = [];

                if (unread.length > 0) {
                    const earliestUnread = unread[0];
                    const older = await getGroupMessages(group.id, 10, earliestUnread.id);
                    initialMessages = [...older, ...unread];
                } else {
                    const latest = await getGroupMessages(group.id, 10);
                    initialMessages = latest;
                }

                setMessages(initialMessages);

                setTimeout(() => {
                    if (unread.length > 0) {
                        const firstUnreadId = unread[0]?.id;
                        if (firstUnreadId && messageRefs.current[firstUnreadId]) {
                            messageRefs.current[firstUnreadId]?.scrollIntoView({ behavior: "auto", block: "center" });
                        }
                    } else {
                        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
                    }
                }, 100);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchGroupMembersData = async () => {
            try {
                const res = await getUsersData(group.members);
                const map = new Map(res.map(u => [u.id, u]));
                setMembers(map);
            } catch (e) {
                console.error(e);
            }
        };

        fetchInitialMessages();
        fetchGroupMembersData();
    }, [group.id]);

    useEffect(() => {
    if (!user || messages.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const messageId = entry.target.getAttribute("data-id");
            if (
                entry.isIntersecting &&
                messageId &&
                !seenMessages.current.has(messageId)
            ) {
                const msg = messages.find(m => m.id === messageId);

                // ✅ Only mark as read if not already read by this user
                const alreadyRead = msg?.readBy?.some(rb => rb.userId === user.id);
                if (!alreadyRead) {
                    seenMessages.current.add(messageId);
                    readBuffer.current.push(messageId);

                    if (readTimeout.current) clearTimeout(readTimeout.current);

                    readTimeout.current = setTimeout(async () => {
                        const toSend = [...new Set(readBuffer.current)];
                        readBuffer.current = [];

                        if (toSend.length > 0) {
                            await viewGroupMessages(group.id, toSend);

                            // Optional: update the messages state optimistically to prevent double-sending
                            setMessages(prev =>
                                prev.map(m =>
                                    toSend.includes(m.id)
                                        ? {
                                              ...m,
                                              readBy: [...(m.readBy || []), { userId: user.id, timestamp: Date.now() }]
                                          }
                                        : m
                                )
                            );
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


    useEffect(() => {
        if (!messageSocket) return;

        const handleNewGroupMessage = (msg: Message) => {
            if (msg.conversation === group.id) {
                setMessages(prev => [...prev, msg]);
                setTimeout(() => {
                    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
                }, 50);
            }
        };

        messageSocket.on("new-group-message", handleNewGroupMessage);
        return () => {
            messageSocket.off("new-group-message", handleNewGroupMessage);
        };
    }, [group.id, messageSocket]);

    const handleScroll = async () => {
        if (!containerRef.current || loadingMore || !hasMore) return;

        const { scrollTop } = containerRef.current;
        if (scrollTop < 100) {
            setLoadingMore(true);
            try {
                const lastMessageId = messages[0]?.id;
                const olderMessages = await getGroupMessages(group.id, 10, lastMessageId);
                if (olderMessages.length === 0) setHasMore(false);
                setMessages(prev => [...olderMessages, ...prev]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMore(false);
            }
        }
    };

    if (!user || !members || !messageSocket) return <></>;

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-col gap-2 overflow-y-auto h-full px-4 py-2"
        >
            {loadingMore && <div className="text-center text-sm text-gray-500">Loading more...</div>}
            {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                    <div className="text-center text-md font-semibold text-gray-800 my-2">{formatDateHeader(date)}</div>
                    {msgs.map((msg) => (
                        <div
                            key={msg.id}
                            ref={(el) => (messageRefs.current[msg.id] = el)}
                            data-id={msg.id}
                        >
                            <GroupMessageComponent
                                message={msg}
                                users={members}
                                currentUserId={user.id}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
