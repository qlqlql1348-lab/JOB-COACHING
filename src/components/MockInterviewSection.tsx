import React, { useState } from 'react';
import { JobRole } from '../types/job';
import { evaluateMockInterviewAnswer, MockInterviewResult } from '../services/apiService';
import { Mic, CheckCircle, Sparkles } from 'lucide-react';

interface MockInterviewSectionProps {
  selectedJob: JobRole;
}

export const MockInterviewSection: React.FC<MockInterviewSectionProps> = ({ selectedJob }) => {
  const questions = selectedJob.interviewQuestions;
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MockInterviewResult | null>(null);

  const currentQ = questions[selectedQuestionIndex] || questions[0];

  const handleEvaluate = async () => {
    if (!candidateAnswer.trim() || candidateAnswer.length < 15 || !currentQ) return;

    setIsLoading(true);
    try {
      const res = await evaluateMockInterviewAnswer(
        selectedJob.title,
        currentQ.question,
        candidateAnswer,
        currentQ.targetSkill
      );
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleAnswer =
    '네, 해당 질문에 대해 말씀드리겠습니다. 초기 프로젝트에서는 빠른 구현에 집중하다 보니 가상 돔 렌더링 최적화까지는 미처 고려하지 못했습니다. 하지만 이후 컴포넌트 단위가 커지면서 리렌더링 병목을 확인했고, React DevTools 프로파일러를 활용해 불필요하게 렌더링되는 자식 컴포넌트를 측정했습니다. 이를 통해 의존성 배열을 재정의하고 메모이제이션을 적용하여 렌더링 시간을 약 35% 단축한 경험이 있습니다.';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100">
            7
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              실전 역량 면접 시뮬레이터 & AI 실시간 첨삭
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {selectedJob.title} 면접관이 던지는 핵심 역량 검증 질문에 답하고 합격 피드백을 받아보세요.
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold font-mono">
          실전 빈출 질문: {questions.length}개
        </span>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => {
              setSelectedQuestionIndex(idx);
              setResult(null);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedQuestionIndex === idx
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>질문 {idx + 1}: {q.targetSkill}</span>
          </button>
        ))}
      </div>

      {/* Active Question Box */}
      {currentQ && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200 font-mono">
              검증 대상 역량: {currentQ.targetSkill}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              면접관 의도: {currentQ.intent}
            </span>
          </div>

          <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
            Q. "{currentQ.question}"
          </div>

          <div className="text-[11px] text-slate-500 font-medium border-t border-slate-200 pt-2 flex items-center justify-between">
            <span>💡 팁: 단순 지식 나열보다 [문제 상황 - 내 액션 - 정량적 결과] 형태로 답변해보세요.</span>
            <button
              onClick={() => setCandidateAnswer(sampleAnswer)}
              className="text-indigo-600 hover:text-indigo-700 underline font-mono text-[11px] font-bold"
            >
              예시 모범답변 채우기
            </button>
          </div>
        </div>
      )}

      {/* Answer Form */}
      <div className="space-y-3">
        <textarea
          rows={5}
          value={candidateAnswer}
          onChange={(e) => setCandidateAnswer(e.target.value)}
          placeholder="면접관에게 말하듯 답변을 구체적으로 입력하세요 (최소 15자 이상)..."
          className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
        />

        <button
          onClick={handleEvaluate}
          disabled={isLoading || candidateAnswer.trim().length < 15}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? '면접관의 시선에서 답변을 정밀 채점하는 중...' : '실시간 답변 평가 및 피드백 받기'}</span>
        </button>
      </div>

      {/* Evaluation Result Feedback */}
      {result && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 animate-fadeIn shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                AI 면접관의 실시간 피드백 리포트
              </h4>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs text-slate-500 font-medium">답변 획득 점수:</span>
              <span className="text-lg font-black text-emerald-700">{result.score}점</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Good Points */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-1">
              <strong className="text-emerald-800 block font-bold">
                👍 긍정적인 평가 요소:
              </strong>
              <p className="text-slate-700 leading-relaxed font-medium">{result.goodPoints}</p>
            </div>

            {/* Improvements */}
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-1">
              <strong className="text-amber-800 block font-bold">
                💡 아쉬운 점 및 보완 조언:
              </strong>
              <p className="text-slate-700 leading-relaxed font-medium">{result.improvementAreas}</p>
            </div>
          </div>

          {/* Model Answer Script */}
          <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl text-xs space-y-1.5">
            <strong className="text-indigo-900 block font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              합격선에 드는 모범 답변 스크립트 예시:
            </strong>
            <p className="text-slate-800 leading-relaxed italic bg-white p-3.5 rounded-lg border border-indigo-100 font-medium shadow-2xs">
              "{result.modelAnswerSnippet}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
