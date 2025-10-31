import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Message, type Match } from '../lib/api';
import { getCurrentUserId } from '../utils/auth';
import LoadingState from '../components/common/LoadingState';
import FormInput from '@/components/FormInput';

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [matchInfo, setMatchInfo] = useState<Match | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!matchId) return;

    fetchMessages();
    fetchMatchInfo();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatchInfo = async () => {
    try {
      const data = await api.matches.list();
      const match = data.matches.find((m) => m.id === matchId);
      if (match) {
        setMatchInfo(match);
      }
    } catch (error) {
      console.error('Failed to fetch match info:', error);
    }
  };

  const fetchMessages = async () => {
    if (!matchId) return;

    try {
      const data = await api.messages.getByMatch(matchId);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId || sending) return;

    setSending(true);
    try {
      await api.messages.send(matchId, newMessage.trim());
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const currentUserId = getCurrentUserId();

  if (loading) {
    return <LoadingState message="Loading chat..." />;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm dark:shadow-gray-900/20">
        <div className="mx-auto flex max-w-4xl items-center">
          <button
            onClick={() => navigate('/matches')}
            className="mr-4 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="h-6 w-6 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {matchInfo && (
            <div className="flex items-center">
              <img
                src={matchInfo.matchedUser.photoUrl}
                alt={matchInfo.matchedUser.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-500"
              />
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {matchInfo.matchedUser.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {matchInfo.matchedUser.age}
                  {(matchInfo.matchedUser.city ||
                    matchInfo.matchedUser.province) && (
                    <>
                      {' '}
                      •{' '}
                      {matchInfo.matchedUser.city &&
                      matchInfo.matchedUser.province
                        ? `${matchInfo.matchedUser.city}, ${matchInfo.matchedUser.province}`
                        : matchInfo.matchedUser.city ||
                          matchInfo.matchedUser.province}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-5xl">💬</div>
              <p className="text-gray-600 dark:text-gray-300">
                No messages yet. Say hello to {matchInfo?.matchedUser.name}!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-1 ring-zinc-950/10 dark:ring-white/10'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isOwn ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <FormInput
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="rounded-full bg-linear-to-r from-pink-500 to-purple-500 p-3 text-white shadow-md transition-all duration-200 ease-out hover:scale-[1.05] hover:shadow-lg active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
