import React, { useState } from 'react';
import { RoadmapPhase, JobRole } from '../types/job';
import {
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Sparkles,
  Trophy,
  CheckSquare,
  Square,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StepLearningPlanProps {
  selectedJob: JobRole;
  roadmap: RoadmapPhase[];
  onRegenerateAiPlan: () => void;
  isAiLoading: boolean;
}

export const StepLearningPlan: React.FC<StepLearningPlanProps> = ({
  roadmap,
  onRegenerateAiPlan,
  isAiLoading,
}) => {
  // Store completed task ids: `${phaseIndex}-${taskIndex}`
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    '0-0': true,
  });

  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const toggleTask = (phaseIdx: number, taskIdx: number) => {
    const key = `${phaseIdx}-${taskIdx}`;
    const nextState = !completedTasks[key];
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: nextState,
    }));

    if (nextState) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const togglePhaseExpand = (phaseIdx: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseIdx]: !prev[phaseIdx],
    }));
  };

  // Calculate total progress
  let totalTasks = 0;
  let completedCount = 0;

  roadmap.forEach((phase, pIdx) => {
    phase.weeklyTasks.forEach((_, tIdx) => {
      totalTasks++;
      if (completedTasks[`${pIdx}-${tIdx}`]) {
        completedCount++;
      }
    });
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100">
            5
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              단계별 맞춤 학습 로드맵 (12주 커리큘럼)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              취약 갭을 가장 효율적으로 메워 합격선에 도달하는 주차별 실행 과제입니다.
            </p>
          </div>
        </div>

        {/* AI custom plan button */}
        <button
          onClick={onRegenerateAiPlan}
          disabled={isAiLoading}
          className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{isAiLoading ? '생성 중...' : '내 상황에 맞게 AI 재설계'}</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-600" />
            나의 로드맵 실행 진척률
          </span>
          <span className="font-mono text-emerald-700 font-black">
            {completedCount} / {totalTasks} 태스크 완료 ({progressPercentage}%)
          </span>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 4 Phases Timeline */}
      <div className="space-y-4">
        {roadmap.map((phase, pIdx) => {
          const isExpanded = expandedPhases[pIdx] ?? true;
          const phaseTasksCompleted = phase.weeklyTasks.filter(
            (_, tIdx) => completedTasks[`${pIdx}-${tIdx}`]
          ).length;
          const isPhaseDone = phaseTasksCompleted === phase.weeklyTasks.length;

          return (
            <div
              key={pIdx}
              className={`rounded-2xl border transition-all ${
                isPhaseDone
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhaseExpand(pIdx)}
                className="p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-mono shadow-xs ${
                      isPhaseDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {phase.phase}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {phase.phaseTitle}
                      </h3>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        {phase.durationWeeks}주 과정
                      </span>
                      {isPhaseDone && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          단계 완료됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {phase.goal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-500 font-bold hidden sm:inline">
                    {phaseTasksCompleted} / {phase.weeklyTasks.length}
                  </span>
                  <button className="text-slate-500 hover:text-slate-800 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phase Content (Expanded) */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                  {/* Task Checklist */}
                  <div className="space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      주차별 핵심 실천 태스크 (체크하여 완료 기록):
                    </span>
                    {phase.weeklyTasks.map((task, tIdx) => {
                      const isChecked = completedTasks[`${pIdx}-${tIdx}`];
                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTask(pIdx, tIdx)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs font-medium'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className="text-xs leading-relaxed select-none">
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Milestone Deliverable Box */}
                  <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl flex items-start gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-900 text-xs block mb-0.5 font-bold">
                        📦 이 단계의 최종 검증 산출물 (Milestone Deliverable):
                      </strong>
                      <span className="text-xs text-slate-700 font-medium">
                        {phase.milestoneDeliverable}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
