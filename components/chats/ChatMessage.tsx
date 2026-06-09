'use client';

interface Message {
  id: number;
  content: string;
  type: 'incoming' | 'outgoing';
  time: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isOutgoing = message.type === 'outgoing';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[65%] px-3 py-2"
        style={{
          backgroundColor: isOutgoing ? '#DCF8C6' : '#FFFFFF',
          borderRadius: isOutgoing ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p className="text-[10px] text-gray-500 text-right mt-1 leading-none">
          {message.time}
        </p>
      </div>
    </div>
  );
}
