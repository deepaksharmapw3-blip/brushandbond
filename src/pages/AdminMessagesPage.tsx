import React, { useEffect, useState } from 'react';
import { Mail, Trash2, Check } from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { contactApi } from '../services/api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
}

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      const result = await contactApi.getAll();
      setMessages(result.messages || []);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load messages.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  const markRead = async (message: ContactMessage) => {
    try {
      await contactApi.markAsRead(message.id);
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, isRead: true } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the message.');
    }
  };

  const remove = async (message: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try {
      await contactApi.delete(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the message.');
    }
  };

  return (
    <ProtectedAdminRoute>
      <AdminLayout activeSection="messages">
        <div className="mb-8 flex items-center gap-3">
          <Mail className="h-6 w-6 text-[var(--accent)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Contact messages</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Messages submitted through the public contact form.</p>
          </div>
        </div>
        {error && <p role="alert" className="mb-5 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="space-y-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-[var(--ink)]">{message.name} <span className="text-sm font-normal text-[var(--muted)]">· {message.email}</span></h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{new Date(message.submittedAt).toLocaleString()} · {message.isRead ? 'Read' : 'Unread'}</p>
                </div>
                <div className="flex gap-2">
                  {!message.isRead && <button type="button" onClick={() => void markRead(message)} className="btn-secondary text-xs"><Check className="h-4 w-4" /> Mark read</button>}
                  <button type="button" onClick={() => void remove(message)} className="btn-secondary text-xs" aria-label={`Delete message from ${message.name}`}><Trash2 className="h-4 w-4" /> Delete</button>
                </div>
              </div>
              {message.subject && <p className="mt-4 text-sm font-medium text-[var(--ink)]">{message.subject}</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">{message.message}</p>
            </article>
          ))}
          {!error && messages.length === 0 && <p className="rounded-lg border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">No contact messages have been submitted yet.</p>}
        </div>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
