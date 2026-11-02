import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, JobRole } from '../types/job';
import { sendChatFeedback } from '../services/apiService';
import { Send, Sparkles, Bot, User, HelpCircle } from 'lucide-react';

interface RealtimeAiCoachProps {
  selectedJob: JobRole;
  currentScore: number;
  criticalGaps: string[];
}

export const RealtimeAiCoach: React.FC<RealtimeAiCoachProps> = ({
  selectedJob,
  currentScore,
  criticalGaps,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `반갑습니다! **${selectedJob.title}** 맞춤 실시간 AI 커리어 코치입니다.\n\n현재 고객님의 역량 매칭률은 **${currentScore}%**이며, ${
        criticalGaps.length > 0
          ? `보완이 시급한 역량은 **[${criticalGaps.slice(0, 3).join(', ')}]**입니다.`
          : '기본적인 필수 역량이 잘 갖추어져 있습니다.'
      }\n\n포트폴리오 프로젝트 주제, 자격증 취득 순서, 면접 방어 전략 등 무엇이든 편하게 물어보세요!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (contentToSend?: string) => {
    const text = contentToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!contentToSend) setInput('');
    setIsLoading(true);

    const replyText = await sendChatFeedback([...messages, userMsg], {
      targetJobTitle: selectedJob.title,
      currentScore,
      criticalGaps,
    });

    const assistantMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  // Quick preset questions tailored to current gaps
  const quickQuestions = [
    `이 갭을 보완할 수 있는 가장 효과적인 실무 프로젝트 아이디어를 추천해주세요.`,
    `자격증 공부와 프로젝트 포트폴리오 중 지금 시점에 시간 배분을 어떻게 해야 할까요?`,
    `비전공자이거나 신입일 때 면접관의 기술 검증 질문을 방어하는 현실적 요령은 무엇인가요?`,
    `${selectedJob.title} 서류 전형에서 채용 담당자의 눈을 사로잡는 이력서 핵심 키워드는?`,
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-100">
            6
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              실시간 AI 커리어 코치 피드백
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Live Coach
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              현재 분석된 역량 갭과 학습 계획에 대해 언제든 실시간으로 상담받으세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AI 코치 실시간 연결 중</span>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          원클릭 질문 추천:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium shadow-2xs"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 h-96 overflow-y-auto space-y-4 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4.5 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs font-normal'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75 font-mono">
                  <span>{isUser ? '나의 질문' : 'CareerGap AI 코치'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-indigo-700 flex items-center gap-2 shadow-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>AI 코치가 맞춤 조언을 작성하고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="궁금한 취업 역량이나 학습 고민을 입력하세요..."
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">전송</span>
        </button>
      </form>
    </div>
  );
};
