import { JobRole, UserCompetencyInput, GapAnalysisOutput, ChatMessage } from '../types/job';

export interface ResumeExtractResult {
  detectedSkills: string[];
  certificatesFound: string[];
  strengths: string[];
  missingCrucialSkills: string[];
  overallFeedback: string;
}

export interface MockInterviewResult {
  score: number;
  goodPoints: string;
  improvementAreas: string;
  modelAnswerSnippet: string;
}

export async function requestAiGapAnalysis(
  job: JobRole,
  input: UserCompetencyInput
): Promise<GapAnalysisOutput | null> {
  try {
    const res = await fetch('/api/analyze-gap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetJobTitle: job.title,
        targetCategory: job.category,
        targetCompanyTier: input.companyTier,
        targetLevel: input.targetLevel,
        currentSkills: Object.entries(input.skills).map(([skillId, level]) => {
          const match = job.benchmarkSkills.find((s) => s.id === skillId);
          return {
            skillName: match?.name || skillId,
            currentLevel: level,
            requiredLevel: match?.benchmarkLevel || 3.0,
            importance: match?.importance || '필수',
          };
        }),
        certificates: input.certificates,
        experienceSummary: input.experienceSummary,
        benchmarkSkills: job.benchmarkSkills,
      }),
    });

    if (!res.ok) {
      console.warn('AI Gap Analysis server returned error status:', res.status);
      return null;
    }

    const data = await res.json();
    if (data?.analysis) {
      return {
        ...data.analysis,
        isAiGenerated: true,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch AI Gap Analysis:', error);
    return null;
  }
}

export async function sendChatFeedback(
  messages: ChatMessage[],
  context: { targetJobTitle: string; currentScore: number; criticalGaps: string[] }
): Promise<string> {
  try {
    const res = await fetch('/api/chat-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });

    if (!res.ok) {
      throw new Error('서버 응답 오류');
    }

    const data = await res.json();
    return data.reply || '답변을 불러오지 못했습니다.';
  } catch (err: any) {
    console.error('Chat error:', err);
    return '죄송합니다. AI 코칭 서버와 연결하는 도중 일시적인 문제가 발생했습니다. 잠시 후 다시 질문해 주세요.';
  }
}

export async function analyzeResumeText(
  text: string,
  targetJobTitle: string
): Promise<ResumeExtractResult> {
  const res = await fetch('/api/resume-extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetJobTitle }),
  });

  if (!res.ok) {
    throw new Error('이력서 텍스트 분석에 실패했습니다.');
  }

  return await res.json();
}

export async function evaluateMockInterviewAnswer(
  targetJobTitle: string,
  question: string,
  candidateAnswer: string,
  targetSkill: string
): Promise<MockInterviewResult> {
  const res = await fetch('/api/mock-interview-evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetJobTitle, question, candidateAnswer, targetSkill }),
  });

  if (!res.ok) {
    throw new Error('모의면접 피드백 평가 실패');
  }

  return await res.json();
}
