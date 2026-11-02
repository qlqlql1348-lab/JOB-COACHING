import React from 'react';
import { Sparkles, Printer, RotateCcw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ONBOARDING_PRESETS } from '../data/benchmarkJobs';

interface HeaderProps {
  currentScore: number;
  isAiLoading: boolean;
  isAiGenerated: boolean;
  onRunAiAnalysis: () => void;
  onOpenResumeModal: () => void;
  onPrint: () => void;
  onReset: () => void;
  onSelectPreset: (presetId: string) => void;
  selectedPresetId: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScore,
  isAiLoading,
  isAiGenerated,
  onRunAiAnalysis,
  onOpenResumeModal,
  onPrint,
  onReset,
  onSelectPreset,
  selectedPresetId,
}) => {
  const getScoreBadge = () => {
    if (currentScore >= 80) {
      return {
        bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
        label: '합격 안정권',
        icon: CheckCircle2,
      };
    }
    if (currentScore >= 60) {
      return {
        bg: 'bg-amber-50 border-amber-300 text-amber-800',
        label: '집중 보강 필요',
        icon: AlertTriangle,
      };
    }
    return {
      bg: 'bg-rose-50 border-rose-300 text-rose-800',
      label: '단계별 기초 학습 요망',
      icon: AlertTriangle,
    };
  };

  const badge = getScoreBadge();
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                CareerGap <span className="text-indigo-600 font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Job Gap Navigator
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              희망 직무 요구 역량과 내 보유 역량 정밀 비교 · 맞춤형 자격증 & 학습 로드맵
            </p>
          </div>
        </div>

        {/* Live Match Score Indicator & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Selector */}
          <div className="relative">
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8 shadow-2xs"
              title="원클릭 샘플 프리셋 적용"
            >
              <option value="">⚡ 샘플 프로필 불러오기</option>
              {ONBOARDING_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Match Score Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-2xs ${badge.bg}`}
          >
            <BadgeIcon className="w-4 h-4 shrink-0" />
            <span>역량 매칭률:</span>
            <span className="font-mono text-sm font-black">{currentScore}%</span>
            <span className="hidden sm:inline-block text-[11px] font-semibold opacity-90">({badge.label})</span>
          </div>

          {/* AI Resume Analyzer Modal Trigger */}
          <button
            onClick={onOpenResumeModal}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs"
            title="이력서/자기소개서 텍스트에서 역량을 자동 추출합니다"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">자소서/이력서</span> 추출
          </button>

          {/* Run AI Deep Analysis Button */}
          <button
            onClick={onRunAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'AI 정밀 분석 중...' : 'AI 심층 갭 진단'}</span>
          </button>

          {/* Print Report */}
          <button
            onClick={onPrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-2xs transition-colors"
            title="진단 리포트 인쇄 / PDF 저장"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-2xs transition-colors"
            title="기본값으로 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
