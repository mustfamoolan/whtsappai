import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import PageContainer from './layout/PageContainer';
import { Send, User, Search, ArrowRight, Bot, UserIcon, Trash } from 'lucide-react';

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [waStatus, setWaStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    let isFetching = false;
    
    // Smart Polling
    const interval = setInterval(async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        await fetchConversations(true); // silent fetch
        
        // Fetch WhatsApp Status
        try {
          const res = await fetch('/api/v1/whatsapp/status');
          if (res.ok) {
            const data = await res.json();
            setWaStatus(data);
          }
        } catch (e) {
          // ignore
        }

        if (selectedConv) {
          await fetchMessages(selectedConv.conversation_id, true);
        }
      } finally {
        isFetching = false;
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedConv]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.phone && c.phone.includes(q))
        )
      );
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async (silent = false) => {
    try {
      const res = await fetch('/api/v1/chat/conversations');
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (!silent) setConversations([]);
    }
  };

  const fetchMessages = async (id, silent = false) => {
    try {
      const res = await fetch(`/api/v1/chat/conversations/${encodeURIComponent(id)}/messages`);
      const data = await res.json();
      setMessages((prev) => {
        // Only update if there's a difference in length to avoid flickering
        if (Array.isArray(data) && data.length !== prev.length) {
          return data;
        }
        return prev;
      });
    } catch (err) {
      console.error(err);
      if (!silent) setMessages([]);
    }
  };

  const handleSelectConv = async (conv) => {
    setSelectedConv(conv);
    fetchMessages(conv.conversation_id);
    
    // Clear unread count locally for instant feedback
    if (conv.unread_count > 0) {
      setConversations(conversations.map(c => 
        c.conversation_id === conv.conversation_id ? { ...c, unread_count: 0 } : c
      ));
      
      try {
        await fetch(`/api/v1/chat/conversations/${conv.conversation_id}/read`, {
          method: 'PUT',
        });
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;
    setLoading(true);
    
    const textToSend = replyText;
    setReplyText(''); // optimistic clear
    
    try {
      const res = await fetch('/api/v1/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConv.conversation_id,
          content: textToSend,
        }),
      });
      if (res.ok) {
        fetchMessages(selectedConv.conversation_id);
        fetchConversations();
      } else {
        setReplyText(textToSend); // restore on fail
      }
    } catch (err) {
      console.error(err);
      setReplyText(textToSend);
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = async (newMode) => {
    if (!selectedConv) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/chat/conversations/${encodeURIComponent(selectedConv.conversation_id)}/mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        setSelectedConv({ ...selectedConv, mode: newMode });
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConv) return;
    if (!window.confirm('هل أنت متأكد من مسح هذه المحادثة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/chat/conversations/${encodeURIComponent(selectedConv.conversation_id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedConv(null);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-1 bg-background border shadow-sm overflow-hidden relative">
        
        {/* Conversations List (Hidden on mobile if a chat is selected) */}
        <div className={`w-full md:w-[350px] lg:w-[400px] flex-col border-l border-border bg-muted/10 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b bg-background flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">جهات الاتصال</h2>
              {waStatus && (
                <div className="flex flex-col items-end text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${waStatus.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {waStatus.status === 'CONNECTED' ? 'متصل' : 
                       waStatus.status === 'RECONNECTING' ? 'يعيد الاتصال...' : 'غير متصل'}
                    </span>
                  </div>
                  {waStatus.status === 'CONNECTED' && (
                    <span className="text-muted-foreground text-[10px]">مدة الاتصال: {waStatus.uptime}</span>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن اسم أو رقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">لا توجد محادثات</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  onClick={() => handleSelectConv(conv)}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                    selectedConv?.conversation_id === conv.conversation_id ? 'bg-muted/80' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm truncate">{conv.name || conv.phone}</h4>
                      {conv.unread_count > 0 && selectedConv?.conversation_id !== conv.conversation_id && (
                        <span className="bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate max-w-[70%]">
                        {conv.last_message}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${conv.mode === 'AI' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        {conv.mode}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 bg-background border-b flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden" 
                    onClick={() => setSelectedConv(null)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      {selectedConv.name || selectedConv.phone}
                    </h3>
                    <p className="text-xs text-muted-foreground" dir="ltr">{selectedConv.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteConversation}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    <span className="hidden sm:inline">مسح</span>
                  </Button>
                  {selectedConv.mode === 'AI' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleModeToggle('HUMAN')}
                      disabled={loading}
                      className="gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">تدخل بشري</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleModeToggle('AI')}
                      disabled={loading}
                      className="gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      <span className="hidden sm:inline">إعادة للذكاء</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
                style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px', opacity: 0.95 }}
              >
                {messages.map((msg) => {
                  const isOutgoing = msg.direction === 'Outgoing';
                  return (
                    <div
                      key={msg.message_id}
                      className={`flex ${isOutgoing ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm relative ${
                          isOutgoing
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground rounded-tr-none'
                            : 'bg-white dark:bg-[#202c33] text-foreground rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-background border-t">
                {selectedConv.mode === 'AI' && (
                  <div className="text-xs text-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 py-1.5 px-3 rounded-md mb-2 flex items-center justify-center gap-2">
                    <Bot className="w-3 h-3" />
                    الذكاء الاصطناعي يرد تلقائياً. إرسالك لأي رسالة سيوقف الذكاء الاصطناعي ويحوله للوضع البشري.
                  </div>
                )}
                <form 
                  onSubmit={(e) => {
                    handleSend(e);
                    if (selectedConv.mode === 'AI') {
                       handleModeToggle('HUMAN');
                    }
                  }} 
                  className="flex gap-2 items-end"
                >
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب رسالة..."
                    className="flex-1 bg-muted/50 border-none focus-visible:ring-1"
                  />
                  <Button type="submit" disabled={!replyText.trim() || loading} size="icon" className="rounded-full h-10 w-10 shrink-0">
                    <Send className="h-4 w-4 ml-1" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bot className="w-10 h-10 opacity-50" />
              </div>
              <h2 className="text-xl font-medium text-foreground mb-2">WhatsApp AI Agent</h2>
              <p className="text-sm max-w-md text-center">
                اختر محادثة من القائمة للبدء أو لمتابعة أداء المساعد الذكي
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
