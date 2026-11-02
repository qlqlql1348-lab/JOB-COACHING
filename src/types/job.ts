export type JobCategory =
  | '개발/IT'
  | '데이터/AI'
  | '기획/PM'
  | '디자인'
  | '마케팅/사업'
  | '보안/인프라';

export type CompanyTier = '대기업' | '유니콘/스타트업' | '중견/강소기업' | '외국계 기업';

export type CareerTargetLevel = '신입' | '인턴' | '주니어(1~3년)' | '직무전환(비전공)';

export interface SkillItem {
  id: string;
  name: string;
  category: 'Hard Skill' | 'Soft Skill' | '도구/인프라' | '비즈니스';
  benchmarkLevel: number; // 1 to 5
  importance: '필수' | '우대' | '선택';
  description: string;
  learningKeyword?: string;
}

export interface CertificateInfo {
  id: string;
  name: string;
  issuingBody: string;
  priority: '필수' | '강력추천' | '우대';
  estimatedWeeks: number;
  difficulty: '상' | '중' | '하';
  reason: string;
  studyTips: string;
  targetCategories: string[];
}

export interface RoadmapTask {
  id: string;
  text: string;
  completed?: boolean;
}

export interface RoadmapPhase {
  phase: number;
  phaseTitle: string;
  durationWeeks: number;
  goal: string;
  weeklyTasks: string[];
  milestoneDeliverable: string;
}

export interface JobRole {
  id: string;
  title: string;
  category: JobCategory;
  description: string;
  tags: string[];
  hiringOutlook: string;
  averageSalaryTrend: string;
  benchmarkSkills: SkillItem[];
  benchmarkCertificates: CertificateInfo[];
  defaultRoadmap: RoadmapPhase[];
  interviewQuestions: Array<{
    id: string;
    question: string;
    targetSkill: string;
    intent: string;
  }>;
}

export interface UserCompetencyInput {
  targetJobId: string;
  companyTier: CompanyTier;
  targetLevel: CareerTargetLevel;
  skills: Record<string, number>; // skillId -> level (1~5)
  certificates: string[];
  experienceSummary: string;
  additionalCustomSkills?: string[];
}

export interface CriticalGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gapDegree: '보완 시급' | '중점 보강' | '기초 필요';
  urgentReason: string;
  actionItem: string;
  importance?: '필수' | '우대' | '선택';
}

export interface GapAnalysisOutput {
  overallFitScore: number;
  evaluationHeadline: string;
  evaluationSummary: string;
  strengthPoints: string[];
  criticalGaps: CriticalGap[];
  recommendedCertifications: Array<{
    name: string;
    priority: '필수' | '강력추천' | '우대';
    estimatedWeeks: number;
    difficulty: '상' | '중' | '하';
    reason: string;
    studyTips: string;
  }>;
  recommendedTechStack: Array<{
    name: string;
    category: string;
    reason: string;
    recommendedResources: string[];
  }>;
  customRoadmap: RoadmapPhase[];
  interviewDefenseTips: string[];
  isAiGenerated?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
