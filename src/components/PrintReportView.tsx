import React from 'react';
import { JobRole, GapAnalysisOutput, CompanyTier, CareerTargetLevel } from '../types/job';
import { Printer, X, Award, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

interface PrintReportViewProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: JobRole;
  companyTier: CompanyTier;
  targetLevel: CareerTargetLevel;
  userScores: Record<string, number>;
  userCertificates: string[];
  analysis: GapAnalysisOutput;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  isOpen,
  onClose,
  selectedJob,
  companyTier,
  targetLevel,
  userScores,
  userCertificates,
  analysis,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* Container */}
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 p-8 sm:p-12 print:p-0 print:m-0 print:shadow-none print:w-full">
        {/* Screen Controls */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8 print:hidden">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            인쇄 및 PDF 다운로드 미리보기
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-8">
          {/* Header Title */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                CareerGap AI Employment Diagnostic Report
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                취업 역량 갭 분석 & 커리어 로드맵 종합 리포트
              </h1>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>진단 일시: {todayStr}</div>
              <div>발행: CareerGap AI 엔진</div>
            </div>
          </div>

          {/* Target Profile Summary Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">목표 희망 직무</span>
              <strong className="text-slate-900 text-sm font-bold">{selectedJob.title}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">목표 기업 규모</span>
              <strong className="text-slate-900 text-sm font-bold">{companyTier}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">지원 레벨</span>
              <strong className="text-slate-900 text-sm font-bold">{targetLevel}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">역량 종합 매칭률</span>
              <strong className="text-indigo-600 text-sm font-black font-mono">
                {analysis.overallFitScore}%
              </strong>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
              1. 종합 평가 브리핑
            </h2>
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs leading-relaxed text-slate-700">
              <strong className="text-indigo-900 block font-bold text-sm mb-1">
                "{analysis.evaluationHeadline}"
              </strong>
              {analysis.evaluationSummary}
            </div>
          </div>

          {/* Competency Gap Comparison Table */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
              2. 직무 역량 1:1 세부 비교 분석표
            </h2>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">역량 항목</th>
                  <th className="py-2.5 px-3">분류</th>
                  <th className="py-2.5 px-3 text-center">요구 수준</th>
                  <th className="py-2.5 px-3 text-center">현재 수준</th>
                  <th className="py-2.5 px-3 text-center">갭 (차이)</th>
                  <th className="py-2.5 px-3">판정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedJob.benchmarkSkills.map((s) => {
                  const current = userScores[s.id] ?? 1.0;
                  const req = s.benchmarkLevel;
                  const diff = req - current;
                  const isMet = diff <= 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.category}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{req.toFixed(1)}점</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {current.toFixed(1)}점
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-mono font-bold ${
                          isMet ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isMet ? `+${Math.abs(diff).toFixed(1)}` : `-${diff.toFixed(1)}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isMet
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff >= 1.5
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isMet ? '충족' : diff >= 1.5 ? '보완 시급' : '보강 필요'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Critical Gaps & Action Items */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-rose-600 pl-3">
              3. 우선 해결 과제 (Critical Gaps)
            </h2>
            <div className="space-y-2 text-xs">
              {analysis.criticalGaps.slice(0, 4).map((g, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                    <span>
                      {idx + 1}. {g.skill} (요구: {g.requiredLevel.toFixed(1)} / 현재:{' '}
                      {g.currentLevel.toFixed(1)})
                    </span>
                    <span className="text-rose-600 font-semibold">{g.gapDegree}</span>
                  </div>
                  <div className="text-slate-600">
                    <strong>탈락 리스크:</strong> {g.urgentReason}
                  </div>
                  <div className="text-indigo-700 mt-1">
                    <strong>액션 플랜:</strong> {g.actionItem}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Certifications */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
              4. 부족한 추천 자격증
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {analysis.recommendedCertifications.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-indigo-600 font-bold">{c.priority}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    예상 준비: {c.estimatedWeeks}주 | 난이도: {c.difficulty}
                  </div>
                  <div className="text-slate-600">{c.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 12-Week Roadmap */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
              5. 12주 단계별 맞춤 학습 계획
            </h2>
            <div className="space-y-3 text-xs">
              {analysis.customRoadmap.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      {p.phase}단계: {p.phaseTitle} ({p.durationWeeks}주)
                    </span>
                    <span className="text-slate-500">{p.goal}</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {p.weeklyTasks.map((t, tIdx) => (
                      <li key={tIdx}>{t}</li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-indigo-700 font-medium">
                    📦 최종 산출물: {p.milestoneDeliverable}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            본 리포트는 CareerGap AI 시스템에 의해 생성되었으며, 지원자의 취업 성공을 응원합니다.
          </div>
        </div>
      </div>
    </div>
  );
};
