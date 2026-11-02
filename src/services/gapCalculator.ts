import { JobRole, UserCompetencyInput, GapAnalysisOutput, CriticalGap } from '../types/job';

/**
 * Calculates deterministic competency gap metrics instantly on the client side.
 * This guarantees instantaneous UI updates without waiting for network requests.
 */
export function calculateLocalGapAnalysis(
  job: JobRole,
  input: UserCompetencyInput
): GapAnalysisOutput {
  const benchmarkSkills = job.benchmarkSkills;
  let totalBenchmarkScore = 0;
  let totalUserScore = 0;
  const criticalGaps: CriticalGap[] = [];
  const strengthPoints: string[] = [];

  // Calculate skill scores
  benchmarkSkills.forEach((skill) => {
    const required = skill.benchmarkLevel;
    const current = input.skills[skill.id] ?? 1.0;

    // Weight by importance
    const weight = skill.importance === '필수' ? 1.5 : skill.importance === '우대' ? 1.1 : 0.8;

    totalBenchmarkScore += required * weight;
    totalUserScore += Math.min(current, required * 1.1) * weight;

    const diff = required - current;

    if (diff > 0.8) {
      let gapDegree: '보완 시급' | '중점 보강' | '기초 필요' = '중점 보강';
      if (diff >= 1.8 || skill.importance === '필수') {
        gapDegree = '보완 시급';
      } else if (current <= 1.5) {
        gapDegree = '기초 필요';
      }

      criticalGaps.push({
        skill: skill.name,
        currentLevel: current,
        requiredLevel: required,
        gapDegree,
        urgentReason: `${skill.importance} 역량으로, 실무 요구 수준(${required.toFixed(1)}점) 대비 ${diff.toFixed(1)}점 부족합니다.`,
        actionItem: `${skill.learningKeyword || skill.name} 관련 핵심 개념 및 미니 실습 프로젝트를 통한 역량 증명이 필요합니다.`,
        importance: skill.importance,
      });
    } else if (current >= required) {
      strengthPoints.push(
        `${skill.name} 역량이 요구 수준(${required}점) 이상으로 안정권(${current}점)에 도달해 있습니다.`
      );
    }
  });

  // Calculate certificate gap
  const requiredCertNames = job.benchmarkCertificates.map((c) => c.name);
  const userCerts = input.certificates || [];
  const missingCertInfos = job.benchmarkCertificates.filter(
    (c) => !userCerts.some((uc) => uc.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(uc.toLowerCase()))
  );

  // Raw score ratio
  let rawScore = Math.round((totalUserScore / (totalBenchmarkScore || 1)) * 100);

  // Certificate bonus / penalty
  const certRatio = job.benchmarkCertificates.length > 0 
    ? (job.benchmarkCertificates.length - missingCertInfos.length) / job.benchmarkCertificates.length 
    : 1;
  
  // Adjusted overall fit score
  const overallFitScore = Math.min(
    98,
    Math.max(15, Math.round(rawScore * 0.85 + certRatio * 15))
  );

  // Generate headline based on score
  let evaluationHeadline = '';
  let evaluationSummary = '';

  if (overallFitScore >= 80) {
    evaluationHeadline = '🎯 합격 안정권 진입! 실전 면접 및 포트폴리오 디테일에 집중할 타이밍';
    evaluationSummary = `${job.title}에 필요한 핵심 기술 역량을 대부분 충족하고 있습니다. 이제 부족한 1~2개 세부 영역을 보강하고, 포트폴리오의 트러블슈팅 경험과 모의 면접으로 합격 확률을 굳히세요.`;
  } else if (overallFitScore >= 60) {
    evaluationHeadline = '📈 기본기 양호! 핵심 필수 역량 2~3개와 자격증 보완 시 합격선 도달';
    evaluationSummary = `기초 학습은 충실히 진행되었으나, ${job.title} 채용 시장에서 필수로 요구하는 실무 적용력과 일부 전문 지식에서 갭이 발견되었습니다. 우선순위 추천 로드맵에 맞춰 4~6주 집중 보완을 권장합니다.`;
  } else {
    evaluationHeadline = '🚀 체계적인 단계별 학습 로드맵 실행이 필요한 시점';
    evaluationSummary = `희망하시는 ${job.title} 직무의 기준선 대비 기초 지식 및 실무 프로젝트 경험의 보강이 필요합니다. 조급해하지 말고 제공된 12주 표준 로드맵 1단계부터 차근차근 실행해 보세요.`;
  }

  // Recommended certifications from missing
  const recommendedCertifications = missingCertInfos.map((c) => ({
    name: c.name,
    priority: c.priority,
    estimatedWeeks: c.estimatedWeeks,
    difficulty: c.difficulty,
    reason: c.reason,
    studyTips: c.studyTips,
  }));

  // Recommended tech stack
  const recommendedTechStack = criticalGaps.slice(0, 4).map((g) => ({
    name: g.skill,
    category: '핵심 실무 기술',
    reason: g.urgentReason,
    recommendedResources: ['공식 기술 문서', '실무 레퍼런스 프로젝트', '인터랙티브 튜토리얼'],
  }));

  return {
    overallFitScore,
    evaluationHeadline,
    evaluationSummary,
    strengthPoints: strengthPoints.length > 0 ? strengthPoints : ['성실한 학습 태도와 구체적인 목표 직무 설정'],
    criticalGaps: criticalGaps.sort((a, b) => (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel)),
    recommendedCertifications,
    recommendedTechStack,
    customRoadmap: job.defaultRoadmap,
    interviewDefenseTips: [
      '부족한 기술에 대한 질문을 받았을 때는 변명 대신 현재 학습 중인 구체적 경로와 완료 목표일을 당당히 제시하세요.',
      '이론 지식이 부족한 부분은 "직접 토이 프로젝트를 만들어보며 겪었던 시행착오"와 연결하여 실천력을 강조하세요.',
      '자격증 미보유 질문에는 "실제 문제해결 코드와 깃허브 커밋 기록을 통해 실질적 역량을 증명하고 있다"는 논리로 대응하세요.',
    ],
    isAiGenerated: false,
  };
}
