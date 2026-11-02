import React, { useState, useEffect, useMemo } from 'react';
import { JobRole, CompanyTier, CareerTargetLevel, GapAnalysisOutput } from './types/job';
import { BENCHMARK_JOBS, ONBOARDING_PRESETS } from './data/benchmarkJobs';
import { calculateLocalGapAnalysis } from './services/gapCalculator';
import { requestAiGapAnalysis } from './services/apiService';
import { Header } from './components/Header';
import { JobSelector } from './components/JobSelector';
import { CompetencyInput } from './components/CompetencyInput';
import { GapAnalysisDashboard } from './components/GapAnalysisDashboard';
import { CertificateRecommendations } from './components/CertificateRecommendations';
import { StepLearningPlan } from './components/StepLearningPlan';
import { RealtimeAiCoach } from './components/RealtimeAiCoach';
import { MockInterviewSection } from './components/MockInterviewSection';
import { ResumeAnalyzerModal } from './components/ResumeAnalyzerModal';
import { PrintReportView } from './components/PrintReportView';
import confetti from 'canvas-confetti';

export default function App() {
  // 1. Core State
  const [selectedJob, setSelectedJob] = useState<JobRole>(BENCHMARK_JOBS[0]);
  const [companyTier, setCompanyTier] = useState<CompanyTier>('대기업');
  const [targetLevel, setTargetLevel] = useState<CareerTargetLevel>('신입');

  // Initial user skills setup
  const initialSkills = useMemo(() => {
    const s: Record<string, number> = {};
    BENCHMARK_JOBS[0].benchmarkSkills.forEach((skill) => {
      s[skill.id] = Math.max(1.0, skill.benchmarkLevel - 1.2);
    });
    return s;
  }, []);

  const [userSkills, setUserSkills] = useState<Record<string, number>>(initialSkills);
  const [userCertificates, setUserCertificates] = useState<string[]>(['정보처리기사']);
  const [experienceSummary, setExperienceSummary] = useState<string>(
    '대학교에서 컴퓨터공학을 전공하며 React 및 기본 웹 개발 프로젝트를 진행했습니다. 실무 웹 최적화와 최신 Next.js 프레임워크 적용 경험이 아직 부족하여 보완하고 싶습니다.'
  );

  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<GapAnalysisOutput | null>(null);

  // Modals
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);

  // Active navigation anchor
  const [activeTab, setActiveTab] = useState<'all' | 'gap' | 'certs' | 'roadmap' | 'coach' | 'interview'>('all');

  // 2. Deterministic Local Gap Analysis (re-evaluated instantaneously on any slider tweak)
  const localAnalysis = useMemo(() => {
    return calculateLocalGapAnalysis(selectedJob, {
      targetJobId: selectedJob.id,
      companyTier,
      targetLevel,
      skills: userSkills,
      certificates: userCertificates,
      experienceSummary,
    });
  }, [selectedJob, companyTier, targetLevel, userSkills, userCertificates, experienceSummary]);

  // Combined Active Analysis (AI takes precedence if generated for current state, otherwise local fallback)
  const currentAnalysis = aiAnalysisResult || localAnalysis;

  // Change selected job handler
  const handleSelectJob = (newJob: JobRole) => {
    setSelectedJob(newJob);
    setAiAnalysisResult(null); // Reset AI result so it matches the new job
    // Initialize default skills for this job
    const newSkills: Record<string, number> = {};
    newJob.benchmarkSkills.forEach((skill) => {
      newSkills[skill.id] = Math.max(1.0, skill.benchmarkLevel - 1.2);
    });
    setUserSkills(newSkills);
  };

  // Preset selector handler
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = ONBOARDING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const matchedJob = BENCHMARK_JOBS.find((j) => j.id === preset.targetJobId) || BENCHMARK_JOBS[0];
    setSelectedJob(matchedJob);
    setCompanyTier(preset.companyTier as CompanyTier);
    setTargetLevel(preset.targetLevel as CareerTargetLevel);
    setUserSkills(preset.skills);
    setUserCertificates(preset.certificates);
    setExperienceSummary(preset.experienceSummary);
    setAiAnalysisResult(null);

    // Mini confetti on loading preset
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Slider change handler
  const handleSkillChange = (skillId: string, level: number) => {
    setUserSkills((prev) => ({
      ...prev,
      [skillId]: level,
    }));
    // Invalidate stale AI result so local real-time math reflects immediately
    if (aiAnalysisResult) {
      setAiAnalysisResult(null);
    }
  };

  // Certificate toggles
  const handleToggleCertificate = (certName: string) => {
    setUserCertificates((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === certName.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== certName.toLowerCase());
      } else {
        return [...prev, certName];
      }
    });
    if (aiAnalysisResult) setAiAnalysisResult(null);
  };

  const handleAddCustomCertificate = (certName: string) => {
    if (!userCertificates.includes(certName)) {
      setUserCertificates((prev) => [...prev, certName]);
      if (aiAnalysisResult) setAiAnalysisResult(null);
    }
  };

  const handleRemoveCertificate = (certName: string) => {
    setUserCertificates((prev) => prev.filter((c) => c !== certName));
    if (aiAnalysisResult) setAiAnalysisResult(null);
  };

  // Trigger Gemini AI Deep Analysis
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    const result = await requestAiGapAnalysis(selectedJob, {
      targetJobId: selectedJob.id,
      companyTier,
      targetLevel,
      skills: userSkills,
      certificates: userCertificates,
      experienceSummary,
    });

    if (result) {
      setAiAnalysisResult(result);
      // Celebration if match score is high
      if (result.overallFitScore >= 75) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
    setIsAiLoading(false);
  };

  // Apply skills extracted from resume
  const handleApplyResumeSkills = (detectedSkills: string[], certs: string[]) => {
    // Add certificates
    certs.forEach((c) => {
      if (!userCertificates.includes(c)) {
        setUserCertificates((prev) => [...prev, c]);
      }
    });

    // Match detected skills with benchmark skills and bump level to 3.8+
    setUserSkills((prev) => {
      const updated = { ...prev };
      selectedJob.benchmarkSkills.forEach((bs) => {
        const isMatched = detectedSkills.some((ds) =>
          bs.name.toLowerCase().includes(ds.toLowerCase()) ||
          ds.toLowerCase().includes(bs.name.toLowerCase())
        );
        if (isMatched) {
          updated[bs.id] = Math.max(updated[bs.id] || 1.0, 3.8);
        }
      });
      return updated;
    });

    setAiAnalysisResult(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Reset to default
  const handleReset = () => {
    setSelectedJob(BENCHMARK_JOBS[0]);
    setCompanyTier('대기업');
    setTargetLevel('신입');
    setUserSkills(initialSkills);
    setUserCertificates(['정보처리기사']);
    setExperienceSummary('');
    setSelectedPresetId('');
    setAiAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* 1. Header with live score & actions */}
      <Header
        currentScore={currentAnalysis.overallFitScore}
        isAiLoading={isAiLoading}
        isAiGenerated={!!aiAnalysisResult}
        onRunAiAnalysis={handleRunAiAnalysis}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onPrint={() => setIsPrintReportOpen(true)}
        onReset={handleReset}
        onSelectPreset={handleSelectPreset}
        selectedPresetId={selectedPresetId}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Navigation Quick Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-2xs ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            📋 전체 종합 대시보드
          </button>
          <button
            onClick={() => setActiveTab('gap')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-2xs ${
              activeTab === 'gap'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            📊 역량 갭 분석표
          </button>
          <button
            onClick={() => setActiveTab('certs')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-2xs ${
              activeTab === 'certs'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            📜 자격증 & 기술 추천
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-2xs ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🗺️ 12주 단계별 로드맵
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-2xs ${
              activeTab === 'coach'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🤖 AI 실시간 코치 상담
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-2xs ${
              activeTab === 'interview'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🎙️ 역량 모의 면접
          </button>
        </div>

        {/* Section 1: Job & Target Selector */}
        {(activeTab === 'all' || activeTab === 'gap') && (
          <section id="job-selector">
            <JobSelector
              selectedJob={selectedJob}
              onSelectJob={handleSelectJob}
              companyTier={companyTier}
              onChangeCompanyTier={setCompanyTier}
              targetLevel={targetLevel}
              onChangeTargetLevel={setTargetLevel}
            />
          </section>
        )}

        {/* Section 2: Competency & Spec Input */}
        {(activeTab === 'all' || activeTab === 'gap') && (
          <section id="competency-input">
            <CompetencyInput
              selectedJob={selectedJob}
              userSkills={userSkills}
              onSkillChange={handleSkillChange}
              userCertificates={userCertificates}
              onToggleCertificate={handleToggleCertificate}
              onAddCustomCertificate={handleAddCustomCertificate}
              onRemoveCertificate={handleRemoveCertificate}
              experienceSummary={experienceSummary}
              onChangeExperienceSummary={setExperienceSummary}
              onOpenResumeModal={() => setIsResumeModalOpen(true)}
            />
          </section>
        )}

        {/* Section 3: Gap Analysis Dashboard (Match Score, Radar Chart, Critical Gaps) */}
        {(activeTab === 'all' || activeTab === 'gap') && (
          <section id="gap-dashboard">
            <GapAnalysisDashboard
              selectedJob={selectedJob}
              userScores={userSkills}
              analysis={currentAnalysis}
              isAiLoading={isAiLoading}
              onRunAiAnalysis={handleRunAiAnalysis}
            />
          </section>
        )}

        {/* Section 4: Recommended Certifications & Tech Stacks */}
        {(activeTab === 'all' || activeTab === 'certs') && (
          <section id="cert-recommendations">
            <CertificateRecommendations
              selectedJob={selectedJob}
              analysis={currentAnalysis}
              userCertificates={userCertificates}
              onAddCertificate={handleAddCustomCertificate}
            />
          </section>
        )}

        {/* Section 5: 12-Week Step-by-Step Learning Plan */}
        {(activeTab === 'all' || activeTab === 'roadmap') && (
          <section id="step-learning-plan">
            <StepLearningPlan
              selectedJob={selectedJob}
              roadmap={currentAnalysis.customRoadmap}
              onRegenerateAiPlan={handleRunAiAnalysis}
              isAiLoading={isAiLoading}
            />
          </section>
        )}

        {/* Section 6: Real-time AI Career Coach Feedback */}
        {(activeTab === 'all' || activeTab === 'coach') && (
          <section id="ai-coach">
            <RealtimeAiCoach
              selectedJob={selectedJob}
              currentScore={currentAnalysis.overallFitScore}
              criticalGaps={currentAnalysis.criticalGaps.map((g) => g.skill)}
            />
          </section>
        )}

        {/* Section 7: Mock Interview Simulator */}
        {(activeTab === 'all' || activeTab === 'interview') && (
          <section id="mock-interview">
            <MockInterviewSection selectedJob={selectedJob} />
          </section>
        )}
      </main>

      {/* Modals */}
      <ResumeAnalyzerModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        selectedJob={selectedJob}
        onApplyDetectedSkills={handleApplyResumeSkills}
      />

      <PrintReportView
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        selectedJob={selectedJob}
        companyTier={companyTier}
        targetLevel={targetLevel}
        userScores={userSkills}
        userCertificates={userCertificates}
        analysis={currentAnalysis}
      />
    </div>
  );
}
