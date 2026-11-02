import React, { useState } from 'react';
import { GapAnalysisOutput, JobRole } from '../types/job';
import { Award, Code2, Calendar, Clock, Target, Check } from 'lucide-react';

interface CertificateRecommendationsProps {
  selectedJob: JobRole;
  analysis: GapAnalysisOutput;
  userCertificates: string[];
  onAddCertificate: (name: string) => void;
}

export const CertificateRecommendations: React.FC<CertificateRecommendationsProps> = ({
  selectedJob,
  analysis,
  userCertificates,
}) => {
  const [targetCerts, setTargetCerts] = useState<Record<string, { targetDate: string; active: boolean }>>({
    '정보처리기사': { targetDate: '2026-12-15', active: true },
  });

  const toggleTargetCert = (certName: string) => {
    setTargetCerts((prev) => ({
      ...prev,
      [certName]: {
        targetDate: prev[certName]?.targetDate || '2026-12-31',
        active: !prev[certName]?.active,
      },
    }));
  };

  const updateTargetDate = (certName: string, date: string) => {
    setTargetCerts((prev) => ({
      ...prev,
      [certName]: {
        targetDate: date,
        active: true,
      },
    }));
  };

  const getDDay = (targetDateStr: string) => {
    if (!targetDateStr) return null;
    const now = new Date();
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-100">
            4
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              부족한 자격증 & 핵심 기술 스택 추천
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {selectedJob.title} 채용 시장에서 서류 통과율을 극대화하는 자격증과 필수 기술입니다.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold">
          추천 자격증: {analysis.recommendedCertifications.length}개
        </div>
      </div>

      {/* Part 1: Recommended Certifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>우선순위별 추천 자격증 & D-Day 목표 설정</span>
        </div>

        {analysis.recommendedCertifications.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center text-xs text-emerald-900 font-medium">
            🎉 이 직무에 권장되는 주요 공인 자격증을 이미 모두 취득하셨습니다! 이제 실무 프로젝트 포트폴리오에 집중하세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.recommendedCertifications.map((cert, idx) => {
              const isAlreadyAcquired = userCertificates.some(
                (uc) =>
                  uc.toLowerCase().includes(cert.name.toLowerCase()) ||
                  cert.name.toLowerCase().includes(uc.toLowerCase())
              );
              const targetGoal = targetCerts[cert.name];
              const dDay = targetGoal?.active ? getDDay(targetGoal.targetDate) : null;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border space-y-3.5 transition-all ${
                    isAlreadyAcquired
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{cert.name}</h4>
                        {isAlreadyAcquired && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> 보유 완료
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          예상 소요: {cert.estimatedWeeks}주
                        </span>
                        <span>난이도: {cert.difficulty}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        cert.priority === '필수'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : cert.priority === '강력추천'
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {cert.priority}
                    </span>
                  </div>

                  {/* Why it matters */}
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-100 font-medium">
                    <strong className="text-indigo-800 text-[11px] block mb-0.5 font-bold">
                      📌 채용 가치 및 우대 사유:
                    </strong>
                    {cert.reason}
                  </div>

                  {/* Study tip */}
                  <div className="text-xs text-slate-700 bg-emerald-50/50 p-3 rounded-lg leading-relaxed border border-emerald-100 font-medium">
                    <strong className="text-emerald-800 text-[11px] block mb-0.5 font-bold">
                      📖 추천 수험 전략 & 교재 팁:
                    </strong>
                    {cert.studyTips}
                  </div>

                  {/* D-Day & Goal Setting interactive footer */}
                  {!isAlreadyAcquired && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTargetCert(cert.name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${
                            targetGoal?.active
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>{targetGoal?.active ? '목표 등록됨' : '목표로 등록'}</span>
                        </button>

                        {targetGoal?.active && dDay && (
                          <span className="font-mono text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                            {dDay}
                          </span>
                        )}
                      </div>

                      {targetGoal?.active && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>시험 목표일:</span>
                          <input
                            type="date"
                            value={targetGoal.targetDate}
                            onChange={(e) => updateTargetDate(cert.name, e.target.value)}
                            className="bg-white border border-slate-300 text-slate-800 text-[11px] rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part 2: Recommended Technical Stacks */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>시급히 보강해야 할 실무 기술 스택 (Tech Stack)</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">실무 채용 공고 빈출 키워드</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysis.recommendedTechStack.map((tech, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  {tech.name}
                </span>
                <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  {tech.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {tech.reason}
              </p>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  추천 학습 리소스:
                </span>
                <div className="flex flex-wrap gap-1">
                  {tech.recommendedResources.map((res, rIdx) => (
                    <span
                      key={rIdx}
                      className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-medium"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
