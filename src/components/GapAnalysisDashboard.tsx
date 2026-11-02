import React from 'react';
import { JobRole, GapAnalysisOutput, SkillItem } from '../types/job';
import { RadarChart } from './RadarChart';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface GapAnalysisDashboardProps {
  selectedJob: JobRole;
  userScores: Record<string, number>;
  analysis: GapAnalysisOutput;
  isAiLoading: boolean;
  onRunAiAnalysis: () => void;
}

export const GapAnalysisDashboard: React.FC<GapAnalysisDashboardProps> = ({
  selectedJob,
  userScores,
  analysis,
  isAiLoading,
  onRunAiAnalysis,
}) => {
  const score = analysis.overallFitScore;

  // Determine score status
  const getScoreInfo = () => {
    if (score >= 80) {
      return {
        color: 'text-emerald-700',
        strokeColor: '#059669',
        label: '서류 및 1차 면접 합격 안정권',
        subtext: '요구 역량 대부분을 충족 중입니다. 포트폴리오 디테일에 집중하세요.',
      };
    }
    if (score >= 60) {
      return {
        color: 'text-amber-700',
        strokeColor: '#D97706',
        label: '핵심 역량 보완 시 합격선 진입',
        subtext: `안정권(80점)까지 약 ${80 - score}%p의 역량 보완이 필요합니다.`,
      };
    }
    return {
      color: 'text-rose-700',
      strokeColor: '#E11D48',
      label: '단계별 기초 학습 집중 필요',
      subtext: `안정권(80점)까지 약 ${80 - score}%p의 역량 갭이 존재합니다.`,
    };
  };

  const scoreInfo = getScoreInfo();

  // SVG circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Group all skills into statuses for the matrix
  const matrix = {
    satisfied: [] as { skill: SkillItem; current: number; req: number }[],
    urgent: [] as { skill: SkillItem; current: number; req: number; diff: number }[],
    moderate: [] as { skill: SkillItem; current: number; req: number; diff: number }[],
  };

  selectedJob.benchmarkSkills.forEach((skill) => {
    const current = userScores[skill.id] ?? 1.0;
    const req = skill.benchmarkLevel;
    const diff = req - current;

    if (diff <= 0) {
      matrix.satisfied.push({ skill, current, req });
    } else if (diff >= 1.5 || skill.importance === '필수') {
      matrix.urgent.push({ skill, current, req, diff });
    } else {
      matrix.moderate.push({ skill, current, req, diff });
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100">
            3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                취업 역량 갭(Gap) 정밀 진단 결과
              </h2>
              {analysis.isAiGenerated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Gemini AI 심층 분석 완료
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {selectedJob.title} 직무 기준선과 내 현재 수준의 1:1 비교 분석표입니다.
            </p>
          </div>
        </div>

        {/* Action button if not AI generated */}
        {!analysis.isAiGenerated && (
          <button
            onClick={onRunAiAnalysis}
            disabled={isAiLoading}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 심층 첨삭 리포트 받기
          </button>
        )}
      </div>

      {/* Top Overview: Score Radial Gauge & Radar Chart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Fit Score Gauge Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            종합 직무 적합도 점수
          </span>

          {/* Radial SVG Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-200"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={scoreInfo.strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black font-mono tracking-tight ${scoreInfo.color}`}>
                {score}
                <span className="text-2xl font-bold text-slate-400 font-sans">%</span>
              </span>
              <span className="text-[11px] font-bold text-slate-600 mt-0.5">매칭 지수</span>
            </div>
          </div>

          {/* Status Label */}
          <div className={`mt-2 font-bold text-sm ${scoreInfo.color}`}>
            {scoreInfo.label}
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed font-medium">
            {scoreInfo.subtext}
          </p>

          {/* Mini Stat counts */}
          <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-slate-200 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-emerald-700 font-black font-mono text-base">
                {matrix.satisfied.length}개
              </div>
              <div className="text-[10px] text-slate-500 font-medium">요구 충족</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-rose-700 font-black font-mono text-base">
                {matrix.urgent.length}개
              </div>
              <div className="text-[10px] text-slate-500 font-medium">보완 시급</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-amber-700 font-black font-mono text-base">
                {matrix.moderate.length}개
              </div>
              <div className="text-[10px] text-slate-500 font-medium">중점 보강</div>
            </div>
          </div>
        </div>

        {/* Right: SVG Radar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              다각 역량 비교 레이더 차트
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">점수 범위: 1.0 ~ 5.0</span>
          </div>

          <RadarChart
            skills={selectedJob.benchmarkSkills}
            userScores={userScores}
            size={380}
          />
        </div>
      </div>

      {/* AI Evaluation Headline & Summary Box */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-white p-6 rounded-2xl border border-indigo-200 space-y-2.5 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>컨설턴트 종합 평가 브리핑</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {analysis.evaluationHeadline}
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {analysis.evaluationSummary}
        </p>
      </div>

      {/* Critical Gaps Section: Priority Gaps & Action Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              우선 해결 역량 갭 (Critical Gaps) & 즉각 액션 플랜
            </h3>
          </div>
          <span className="text-xs text-rose-700 font-bold">
            우선순위순 정렬 ({analysis.criticalGaps.length}개 항목)
          </span>
        </div>

        {analysis.criticalGaps.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center text-xs text-emerald-900 font-medium">
            🎉 축하합니다! 모든 필수 역량이 기준선 이상으로 채워져 있습니다. 이제 포트폴리오 다듬기와 모의 면접을 진행하세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.criticalGaps.map((gap, idx) => {
              const diff = (gap.requiredLevel - gap.currentLevel).toFixed(1);
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl space-y-3.5 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{gap.skill}</h4>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        gap.gapDegree === '보완 시급'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {gap.gapDegree} (-{diff}점)
                    </span>
                  </div>

                  {/* Level compare bars */}
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-500 text-[10px] font-medium">
                      <span>현재: {gap.currentLevel.toFixed(1)}점</span>
                      <span>요구: {gap.requiredLevel.toFixed(1)}점</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                      />
                      <div
                        className="bg-rose-400 h-full border-l border-white"
                        style={{
                          width: `${((gap.requiredLevel - gap.currentLevel) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Urgent Reason */}
                  <div className="text-xs text-rose-950 bg-rose-50/70 border border-rose-200 p-3 rounded-lg leading-relaxed">
                    <strong className="text-rose-800 text-[11px] block mb-0.5 font-bold">
                      ⚠️ 면접관 시각의 탈락 리스크:
                    </strong>
                    {gap.urgentReason}
                  </div>

                  {/* Immediate Action Item */}
                  <div className="text-xs text-indigo-950 bg-indigo-50/70 border border-indigo-200 p-3 rounded-lg leading-relaxed flex items-start gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-800 text-[11px] block mb-0.5 font-bold">
                        💡 즉각 실천 과제:
                      </strong>
                      {gap.actionItem}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Strengths & Interview Defense Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Strengths */}
        <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>지원자의 확실한 강점 (이력서 어필 포인트)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-800 font-medium">
            {analysis.strengthPoints.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-emerald-200/80 shadow-2xs">
                <span className="text-emerald-700 font-bold">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Defense Tips */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>부족한 역량에 대한 면접관 압박 질문 방어 팁</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-800 font-medium">
            {analysis.interviewDefenseTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-indigo-600 font-bold">🛡️</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
