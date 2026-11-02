import React from 'react';
import { JobRole, CompanyTier, CareerTargetLevel } from '../types/job';
import { BENCHMARK_JOBS } from '../data/benchmarkJobs';
import { Briefcase, Building2, DollarSign, Target } from 'lucide-react';

interface JobSelectorProps {
  selectedJob: JobRole;
  onSelectJob: (job: JobRole) => void;
  companyTier: CompanyTier;
  onChangeCompanyTier: (tier: CompanyTier) => void;
  targetLevel: CareerTargetLevel;
  onChangeTargetLevel: (level: CareerTargetLevel) => void;
}

export const JobSelector: React.FC<JobSelectorProps> = ({
  selectedJob,
  onSelectJob,
  companyTier,
  onChangeCompanyTier,
  targetLevel,
  onChangeTargetLevel,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<string>('전체');

  const categories: Array<string> = [
    '전체',
    '개발/IT',
    '데이터/AI',
    '기획/PM',
    '보안/인프라',
    '디자인',
  ];

  const filteredJobs = BENCHMARK_JOBS.filter((j) => {
    if (activeCategory === '전체') return true;
    return j.category === activeCategory;
  });

  const companyTiers: CompanyTier[] = [
    '대기업',
    '유니콘/스타트업',
    '중견/강소기업',
    '외국계 기업',
  ];

  const targetLevels: CareerTargetLevel[] = [
    '신입',
    '인턴',
    '주니어(1~3년)',
    '직무전환(비전공)',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              희망 직무 & 채용 목표 설정
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              분석 기준이 될 타깃 직무와 목표 기업 규모, 지원 레벨을 선택하세요.
            </p>
          </div>
        </div>

        {/* Selected Job Badge */}
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs">
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-600 font-medium">선택 직무:</span>
          <span className="font-bold text-indigo-900">{selectedJob.title}</span>
        </div>
      </div>

      {/* Target Settings: Tier & Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 p-4 rounded-xl border border-slate-200">
        {/* Company Tier */}
        <div>
          <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            목표 기업군
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {companyTiers.map((tier) => (
              <button
                key={tier}
                onClick={() => onChangeCompanyTier(tier)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  companyTier === tier
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Target Career Level */}
        <div>
          <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            지원 목표 레벨
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {targetLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => onChangeTargetLevel(lvl)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  targetLevel === lvl
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Category Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredJobs.map((job) => {
            const isSelected = selectedJob.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className={`cursor-pointer p-4 rounded-xl border text-left transition-all duration-200 relative group ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                )}

                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {job.category}
                  </span>
                  <span className="text-[11px] text-indigo-700 font-bold">
                    필수역량 {job.benchmarkSkills.length}개
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {job.tags.length > 4 && (
                    <span className="text-[10px] text-slate-500 self-center font-medium">
                      +{job.tags.length - 4}
                    </span>
                  )}
                </div>

                {/* Salary & Outlook footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span className="flex items-center gap-1 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    {job.averageSalaryTrend.split('(')[0].replace('신입 기준', '신입').trim()}
                  </span>
                  <span className="text-emerald-700 font-bold text-[10px]">수요 높음</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
