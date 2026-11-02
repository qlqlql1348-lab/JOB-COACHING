import React, { useState } from 'react';
import { JobRole } from '../types/job';
import { analyzeResumeText, ResumeExtractResult } from '../services/apiService';
import { X, Sparkles, FileText, CheckCircle2, AlertTriangle, Wand2 } from 'lucide-react';

interface ResumeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: JobRole;
  onApplyDetectedSkills: (skills: string[], certs: string[]) => void;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  onApplyDetectedSkills,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.length < 20) {
      setError('최소 20자 이상의 이력서 또는 프로젝트 설명 텍스트를 입력해주세요.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await analyzeResumeText(resumeText, selectedJob.title);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError('이력서 분석 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToState = () => {
    if (!result) return;
    onApplyDetectedSkills(result.detectedSkills, result.certificatesFound);
    onClose();
  };

  const sampleResumeSnippet = `[프로젝트: AI 기반 북마크 큐레이션 웹 서비스]
- 기간: 2024.03 ~ 2024.06 (4인 팀 프로젝트, 프론트엔드 리드)
- 기술 스택: React, TypeScript, Next.js, Tailwind CSS, TanStack Query
- 주요 역할:
  - 반응형 UI 컴포넌트 15종 및 무한 스크롤 피드 구현
  - TanStack Query를 도입하여 불필요한 API 중복 호출 40% 절감
  - Lighthouse 웹 성능 점수 62점에서 89점으로 개선 (WebP 포맷 전환 및 동적 임포트)
- 보유 자격증: 정보처리기사 필기 합격, SQLD 취득`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                이력서 / 자기소개서 AI 역량 추출기
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                기존 작성한 서류 텍스트를 붙여넣으면 보유 기술과 보완점을 자동 추출합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-slate-700">
                이력서 / 프로젝트 경험 / 자기소개서 내용 붙여넣기
              </span>
              <button
                type="button"
                onClick={() => setResumeText(sampleResumeSnippet)}
                className="text-indigo-600 hover:text-indigo-700 underline font-mono text-[11px] font-bold"
              >
                샘플 서류 불러오기
              </button>
            </div>

            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="예시: 프로젝트 경험, 담당 업무, 사용 기술 스택, 해결했던 기술적 문제 등을 자유롭게 붙여넣으세요..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {error && (
            <div className="text-xs bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !resumeText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'AI가 텍스트에서 역량을 정밀 추출하는 중...' : '텍스트 기반 역량 & 갭 추출하기'}</span>
          </button>

          {/* Analysis Results Display */}
          {result && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 mt-2 animate-fadeIn shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  AI 분석 결과 브리핑
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  타깃: {selectedJob.title}
                </span>
              </div>

              {/* Detected Skills */}
              <div>
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  ✓ 서류에서 입증된 보유 기술 ({result.detectedSkills.length}개):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.detectedSkills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certificates Found */}
              {result.certificatesFound.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-indigo-800 block mb-1">
                    ✓ 발견된 자격증 ({result.certificatesFound.length}개):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.certificatesFound.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Crucial Skills */}
              <div>
                <span className="text-[11px] font-bold text-rose-800 block mb-1">
                  ⚠️ {selectedJob.title} 합격을 위해 이 서류에 시급히 보강해야 할 누락 역량:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingCrucialSkills.map((m, i) => (
                    <span
                      key={i}
                      className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-semibold"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Narrative Feedback */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs font-medium">
                <strong className="text-slate-900 block mb-1 font-bold">
                  ✍️ 이력서 / 자기소개서 첨삭 코칭:
                </strong>
                {result.overallFeedback}
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyToState}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20"
              >
                <Wand2 className="w-4 h-4" />
                <span>추출된 보유 역량 및 자격증을 내 진단표에 자동 적용하기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
