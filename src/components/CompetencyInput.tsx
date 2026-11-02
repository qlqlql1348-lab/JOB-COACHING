import React, { useState } from 'react';
import { JobRole } from '../types/job';
import { ALL_CERTIFICATES } from '../data/benchmarkJobs';
import { Sliders, Award, Plus, X, HelpCircle, FileText, Check } from 'lucide-react';

interface CompetencyInputProps {
  selectedJob: JobRole;
  userSkills: Record<string, number>;
  onSkillChange: (skillId: string, level: number) => void;
  userCertificates: string[];
  onToggleCertificate: (certName: string) => void;
  onAddCustomCertificate: (certName: string) => void;
  onRemoveCertificate: (certName: string) => void;
  experienceSummary: string;
  onChangeExperienceSummary: (text: string) => void;
  onOpenResumeModal: () => void;
}

export const CompetencyInput: React.FC<CompetencyInputProps> = ({
  selectedJob,
  userSkills,
  onSkillChange,
  userCertificates,
  onToggleCertificate,
  onAddCustomCertificate,
  onRemoveCertificate,
  experienceSummary,
  onChangeExperienceSummary,
  onOpenResumeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'certs' | 'experience'>('skills');
  const [customCertInput, setCustomCertInput] = useState('');
  const [showLevelGuide, setShowLevelGuide] = useState(false);

  const getLevelLabel = (val: number) => {
    if (val >= 4.5) return '전문가 / 최적화 리드 (5점)';
    if (val >= 3.8) return '실무 적용 & 트러블슈팅 가능 (4점)';
    if (val >= 2.8) return '기본 기능 단독 구현 가능 (3점)';
    if (val >= 1.8) return '기초 실습 / 튜토리얼 완료 (2점)';
    return '입문 / 개념 파악 중 (1점)';
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCertInput.trim()) {
      onAddCustomCertificate(customCertInput.trim());
      setCustomCertInput('');
    }
  };

  // Common certificates relevant to current job or category
  const relevantCertificates = ALL_CERTIFICATES.filter(
    (c) =>
      c.targetCategories.includes(selectedJob.category) ||
      selectedJob.benchmarkCertificates.some((bc) => bc.name === c.name)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Step Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-100">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              내 현재 보유 역량 & 스펙 입력
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              슬라이더를 조절하면 즉시 요구 역량과의 갭이 계산됩니다.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>기술 역량 ({selectedJob.benchmarkSkills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('certs')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'certs'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>보유 자격증 ({userCertificates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'experience'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>경력/프로젝트</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SKILL SLIDERS */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-medium">
              💡 각 슬라이더를 움직여 현재 역량 수준을 1~5점 척도로 입력하세요.
            </span>
            <button
              onClick={() => setShowLevelGuide(!showLevelGuide)}
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 underline underline-offset-2"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              점수 기준표 {showLevelGuide ? '닫기' : '보기'}
            </button>
          </div>

          {showLevelGuide && (
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 text-xs space-y-1.5 text-slate-700 animate-fadeIn">
              <div className="font-bold text-indigo-900 mb-1">📌 역량 평가 점수 척도 기준 가이드:</div>
              <div><strong className="text-indigo-700">1점:</strong> 기초 개념을 알고 있거나 유튜브/강의로 훑어본 수준</div>
              <div><strong className="text-indigo-700">2점:</strong> 예제 튜토리얼을 따라 쳐보았으나 단독 응용은 어려운 수준</div>
              <div><strong className="text-indigo-700">3점:</strong> 구글링이나 공식 문서를 참조해 기본 요구 기능을 혼자 구현 가능한 수준 (신입 기준선)</div>
              <div><strong className="text-indigo-700">4점:</strong> 성능 이슈, 트러블슈팅 경험이 있고 예외 상황을 고려해 설계 가능한 수준 (주니어~중급)</div>
              <div><strong className="text-indigo-700">5점:</strong> 아키텍처 설계, 코드 리뷰 주도 및 깊이 있는 내부 동작 메커니즘을 튜닝하는 수준 (시니어)</div>
            </div>
          )}

          {/* Skill items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedJob.benchmarkSkills.map((skill) => {
              const currentVal = userSkills[skill.id] ?? 1.0;
              const requiredVal = skill.benchmarkLevel;
              const diff = requiredVal - currentVal;
              const isMet = diff <= 0;

              return (
                <div
                  key={skill.id}
                  className="bg-slate-50/80 p-4.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{skill.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            skill.importance === '필수'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {skill.importance}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">
                        {skill.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 font-mono text-xs">
                      <div className="text-slate-500 text-[10px] font-medium">요구: {requiredVal.toFixed(1)}점</div>
                      <div
                        className={`font-black ${
                          isMet ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        내 점수: {currentVal.toFixed(1)}점
                      </div>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={currentVal}
                      onChange={(e) => onSkillChange(skill.id, parseFloat(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                      <span>1.0 입문</span>
                      <span className="text-emerald-700 font-bold">
                        {getLevelLabel(currentVal)}
                      </span>
                      <span>5.0 전문가</span>
                    </div>
                  </div>

                  {/* Status indicator bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                    <span>
                      {isMet ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5" /> 요구 수준 충족 ({currentVal.toFixed(1)}점)
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold">
                          갭: -{diff.toFixed(1)}점 보완 필요
                        </span>
                      )}
                    </span>
                    {skill.learningKeyword && (
                      <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        {skill.learningKeyword}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CERTIFICATES CHECKLIST */}
      {activeTab === 'certs' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-medium">
              💡 현재 보유하고 계신 자격증을 체크하거나, 목록에 없는 자격증은 직접 등록하세요.
            </span>
            <span className="text-emerald-700 font-bold font-mono">
              보유 중: {userCertificates.length}개
            </span>
          </div>

          {/* Currently Selected Certificates Tags */}
          {userCertificates.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <span className="text-xs text-emerald-900 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 내가 등록한 보유 자격증:
              </span>
              {userCertificates.map((cert) => (
                <span
                  key={cert}
                  className="bg-white text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  {cert}
                  <button
                    onClick={() => onRemoveCertificate(cert)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Recommended Relevant Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relevantCertificates.map((cert) => {
              const isChecked = userCertificates.some(
                (uc) =>
                  uc.toLowerCase().includes(cert.name.toLowerCase()) ||
                  cert.name.toLowerCase().includes(uc.toLowerCase())
              );

              return (
                <div
                  key={cert.id}
                  onClick={() => onToggleCertificate(cert.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900">
                        {cert.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          cert.priority === '필수'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {cert.priority}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1 line-clamp-1 font-medium">
                      {cert.reason}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono font-medium">
                      <span>난이도: {cert.difficulty}</span>
                      <span>예상 준비: {cert.estimatedWeeks}주</span>
                      <span>주관: {cert.issuingBody}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Certificate Input Form */}
          <form onSubmit={handleAddCert} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="목록에 없는 자격증 직접 입력 (예: 토익 850점, 리눅스마스터 2급, 컴활 1급 등)"
              value={customCertInput}
              onChange={(e) => setCustomCertInput(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              추가
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: EXPERIENCE & RESUME TEXT */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-medium">
              💡 대학교 전공, 부트캠프, 인턴, 진행했던 프로젝트 경험이나 자기소개서 요약을 적어주세요.
            </span>
            <button
              onClick={onOpenResumeModal}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              AI 자소서 정밀 분석 모달 열기
            </button>
          </div>

          <textarea
            rows={5}
            value={experienceSummary}
            onChange={(e) => onChangeExperienceSummary(e.target.value)}
            placeholder="예시: 컴퓨터공학과 4학년 졸업예정입니다. 팀 프로젝트로 Spring Boot와 React를 연동한 쇼핑몰 서비스를 제작했고, JWT 인증과 MySQL DB 인덱싱을 경험했습니다. 다만 대용량 트래픽 처리 경험과 AWS 배포 실습이 부족하여 어떻게 채워야 할지 고민입니다."
            className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
          />

          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>글자 수: {experienceSummary.length}자</span>
            <span>작성한 경험은 'AI 심층 갭 진단' 시 지원자 맞춤형 액션 플랜 생성에 활용됩니다.</span>
          </div>
        </div>
      )}
    </div>
  );
};
