"use client";

import { useEffect, useMemo, useState } from "react";
import { N } from "@/lib/colors";
import type { Task, Goal, Partner, UserData } from "@/types";
import { refreshOverdue } from "@/lib/overdue";
import { calculateStreak, recordCompletion } from "@/lib/streak";
import { todayIso as nowIso, humanDueLabel } from "@/lib/dates";

import GreetingHeader from "./GreetingHeader";
import WeekStrip from "./WeekStrip";
import VoicePromo from "./VoicePromo";
import TaskList from "./TaskList";
import GoalGrid from "./GoalGrid";
import GoalDetail from "./GoalDetail";
import Confetti, { type ConfettiTier } from "./Confetti";
import CreateGoalModal from "./CreateGoalModal";

interface Props {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  isDesktop?: boolean;
}

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

export default function HomeTab({ user, setUser, isDesktop = false }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(() => nowIso());
  const [confetti, setConfetti] = useState<ConfettiTier | null>(null);
  const [goalModal, setGoalModal] = useState<{ mode: "create" } | { mode: "edit"; goal: Goal } | null>(null);
  /** When set, replace the home view with the Goal detail screen (sec 7). */
  const [detailGoalId, setDetailGoalId] = useState<string | null>(null);

  // Recompute overdue flags on every mount
  useEffect(() => {
    setUser((u) => ({
      ...u,
      tasks: refreshOverdue(u.tasks),
      goals: u.goals.map((g) => ({ ...g, tasks: refreshOverdue(g.tasks) })),
    }));
    // intentional one-shot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayIsoStr = nowIso();
  const isToday = selectedDate === todayIsoStr;

  // Combined task list for the selected date (standalone + tasks-of-goals)
  const visibleTasks = useMemo(() => {
    const goalTasks = user.goals.flatMap((g) => g.tasks);
    const all = [...user.tasks, ...goalTasks];
    if (isToday) {
      return all.filter((t) =>
        t.dueDate === selectedDate ||
        t.dueDate == null ||
        t.recurring != null
      );
    }
    return all.filter((t) =>
      t.dueDate === selectedDate ||
      t.recurring != null
    );
  }, [user.tasks, user.goals, selectedDate, isToday]);

  // Dates that have at least one task (for the WeekStrip dot)
  const datesWithTasks = useMemo(() => {
    const set = new Set<string>();
    const goalTasks = user.goals.flatMap((g) => g.tasks);
    for (const t of [...user.tasks, ...goalTasks]) {
      if (t.dueDate) set.add(t.dueDate);
    }
    return set;
  }, [user.tasks, user.goals]);

  /* ---------- Mutations ---------- */

  const setTaskInUser = (taskId: string, updater: (t: Task) => Task) => {
    setUser((u) => ({
      ...u,
      tasks: u.tasks.map((t) => (t.id === taskId ? updater(t) : t)),
      goals: u.goals.map((g) => ({ ...g, tasks: g.tasks.map((t) => (t.id === taskId ? updater(t) : t)) })),
    }));
  };

  const removeTaskFromUser = (taskId: string) => {
    setUser((u) => ({
      ...u,
      tasks: u.tasks.filter((t) => t.id !== taskId),
      goals: u.goals.map((g) => ({ ...g, tasks: g.tasks.filter((t) => t.id !== taskId) })),
    }));
  };

  const addStandalone = (text: string, dueDate: string | null) => {
    const newTask: Task = {
      id: id("t"),
      text,
      done: false,
      star: false,
      overdue: false,
      goalId: null,
      partnerId: null,
      dueDate,
      recurring: null,
      createdAt: nowIso(),
    };
    setUser((u) => ({ ...u, tasks: [newTask, ...u.tasks] }));
  };

  const addTaskToGoal = (goalId: string, text: string) => {
    const newTask: Task = {
      id: id("t"),
      text,
      done: false,
      star: false,
      overdue: false,
      goalId,
      partnerId: null,
      dueDate: nowIso(),
      recurring: null,
      createdAt: nowIso(),
    };
    setUser((u) => ({
      ...u,
      goals: u.goals.map((g) => g.id === goalId ? { ...g, tasks: [newTask, ...g.tasks] } : g),
    }));
  };

  const toggleTask = (taskId: string) => {
    let becameDone = false;
    let allTodayDone = false;
    let goalCompleted = false;

    setUser((u) => {
      const map = (t: Task): Task => {
        if (t.id !== taskId) return t;
        const flipped = { ...t, done: !t.done, completedAt: !t.done ? nowIso() : undefined };
        becameDone = !t.done;
        return flipped;
      };
      const updated: UserData = {
        ...u,
        tasks: u.tasks.map(map),
        goals: u.goals.map((g) => {
          const newTasks = g.tasks.map(map);
          // Detect goal complete (all tasks now done, and at least one)
          if (newTasks.some((x) => x.id === taskId)) {
            const allDone = newTasks.length > 0 && newTasks.every((t) => t.done);
            const wasNotAllDone = g.tasks.length > 0 && !g.tasks.every((t) => t.done);
            if (allDone && wasNotAllDone) goalCompleted = true;
          }
          return { ...g, tasks: newTasks };
        }),
      };

      // Check if all today's tasks are now done
      const todayIsoNow = nowIso();
      const goalTasks = updated.goals.flatMap((g) => g.tasks);
      const todays = [...updated.tasks, ...goalTasks].filter((t) =>
        t.dueDate === todayIsoNow || t.dueDate == null || t.recurring != null
      );
      allTodayDone = todays.length > 0 && todays.every((t) => t.done);

      // Update streak + completion dates on completion
      if (becameDone) {
        const completionDates = recordCompletion(updated.completionDates);
        updated.completionDates = completionDates;
        updated.lastActiveDate = nowIso();
        updated.streak = calculateStreak(completionDates);
      }

      return updated;
    });

    // Fire confetti AFTER state updates (use rAF for layout settle)
    requestAnimationFrame(() => {
      if (!becameDone) return;
      // pick highest tier
      if (allTodayDone) setConfetti("daily");
      else if (goalCompleted) setConfetti("goal");
      else setConfetti("task");
    });
  };

  const updateTask = (t: Task) => setTaskInUser(t.id, () => t);
  const deleteTask = (id: string) => removeTaskFromUser(id);

  /* ---------- Goal CRUD ---------- */

  const upsertGoal = (g: Goal) => {
    setUser((u) => {
      const exists = u.goals.some((x) => x.id === g.id);
      return {
        ...u,
        goals: exists ? u.goals.map((x) => (x.id === g.id ? { ...g, tasks: x.tasks } : x)) : [g, ...u.goals],
      };
    });
    setGoalModal(null);
  };

  const deleteGoal = (goalId: string) => {
    setUser((u) => {
      // Unlink any tasks pointing at this goal (standalone tasks AND tasks inside other goals)
      const goalToRemove = u.goals.find((g) => g.id === goalId);
      const orphanedTasks: Task[] = (goalToRemove?.tasks ?? []).map((t) => ({ ...t, goalId: null }));
      return {
        ...u,
        tasks: [...u.tasks.map((t) => (t.goalId === goalId ? { ...t, goalId: null } : t)), ...orphanedTasks],
        goals: u.goals.filter((g) => g.id !== goalId),
      };
    });
    setGoalModal(null);
    if (detailGoalId === goalId) setDetailGoalId(null);
  };

  /** Inline goal creation from inside a task expansion: create the goal AND link the task. */
  const createGoalAndLink = (g: Goal, taskId: string) => {
    setUser((u) => ({
      ...u,
      goals: [g, ...u.goals],
      tasks: u.tasks.map((t) => (t.id === taskId ? { ...t, goalId: g.id } : t)),
      // also handle if the task is inside another goal's tasks array
      // (we move it out of standalone but DON'T move it between goals; spec implies updating goalId is sufficient)
    }));
  };

  const reorderTask = (sourceId: string, _targetIndex: number) => {
    // Move source to targetIndex within the standalone tasks array (goal tasks reorder within their own goal)
    setUser((u) => {
      const inStandalone = u.tasks.findIndex((t) => t.id === sourceId);
      if (inStandalone >= 0) {
        const arr = [...u.tasks];
        const [item] = arr.splice(inStandalone, 1);
        arr.splice(Math.max(0, Math.min(arr.length, _targetIndex)), 0, item);
        return { ...u, tasks: arr };
      }
      return {
        ...u,
        goals: u.goals.map((g) => {
          const idx = g.tasks.findIndex((t) => t.id === sourceId);
          if (idx < 0) return g;
          const arr = [...g.tasks];
          const [item] = arr.splice(idx, 1);
          arr.splice(Math.max(0, Math.min(arr.length, _targetIndex)), 0, item);
          return { ...g, tasks: arr };
        }),
      };
    });
  };

  const header = (
    <GreetingHeader name={user.name} onCreate={() => setGoalModal({ mode: "create" })} />
  );

  const weekStrip = (
    <WeekStrip
      selected={selectedDate}
      onSelect={setSelectedDate}
      datesWithTasks={datesWithTasks}
    />
  );

  const voicePromo = <VoicePromo />;

  const taskList = (
    <TaskList
      tasks={visibleTasks}
      goals={user.goals}
      partners={user.partners}
      selectedDate={selectedDate}
      isToday={isToday}
      dayLabel={isToday ? "today" : humanDueLabel(selectedDate)}
      onAddStandalone={addStandalone}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onToggleTask={toggleTask}
      onReorder={reorderTask}
      onCreateGoalAndLink={createGoalAndLink}
      isDesktop={isDesktop}
    />
  );

  const goalGrid = (
    <GoalGrid
      goals={user.goals}
      onAddTaskToGoal={addTaskToGoal}
      onToggleTaskInGoal={(_goalId, taskId) => toggleTask(taskId)}
      onCreateGoal={() => setGoalModal({ mode: "create" })}
      onOpenGoal={(g) => setDetailGoalId(g.id)}
      onEditGoal={(g) => setGoalModal({ mode: "edit", goal: g })}
    />
  );

  /* ---------- Goal detail (sec 7): full-screen takeover when set ---------- */
  const detailGoal = detailGoalId ? user.goals.find((g) => g.id === detailGoalId) ?? null : null;
  if (detailGoal) {
    return (
      <div className="anim-up">
        <GoalDetail
          goal={detailGoal}
          partners={user.partners}
          onBack={() => setDetailGoalId(null)}
          onAddTask={(text) => addTaskToGoal(detailGoal.id, text)}
          onToggleTask={(taskId) => toggleTask(taskId)}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onEdit={() => setGoalModal({ mode: "edit", goal: detailGoal })}
          isDesktop={isDesktop}
        />
        <Confetti tier={confetti} onDone={() => setConfetti(null)} />
        {goalModal && (
          <CreateGoalModal
            goal={goalModal.mode === "edit" ? goalModal.goal : undefined}
            onCancel={() => setGoalModal(null)}
            onSave={upsertGoal}
            onDelete={goalModal.mode === "edit" ? deleteGoal : undefined}
          />
        )}
      </div>
    );
  }

  /* ---------- Desktop: 2-column body under the greeting + week strip ---------- */
  if (isDesktop) {
    return (
      <div className="anim-up">
        {header}
        {weekStrip}
        <div className="flex gap-6 px-4 pt-4 items-start">
          <div className="flex-1 min-w-0">{taskList}</div>
          <div className="w-[400px] shrink-0 sticky top-4">{goalGrid}</div>
        </div>
        <Confetti tier={confetti} onDone={() => setConfetti(null)} />
        {goalModal && (
          <CreateGoalModal
            goal={goalModal.mode === "edit" ? goalModal.goal : undefined}
            onCancel={() => setGoalModal(null)}
            onSave={upsertGoal}
            onDelete={goalModal.mode === "edit" ? deleteGoal : undefined}
          />
        )}
      </div>
    );
  }

  /* ---------- Mobile: stacked single column. Voice promo between Today and Goals. ---------- */
  return (
    <div className="anim-up">
      {header}
      {weekStrip}
      {taskList}
      {voicePromo}
      {goalGrid}
      <Confetti tier={confetti} onDone={() => setConfetti(null)} />
      {goalModal && (
        <CreateGoalModal
          goal={goalModal.mode === "edit" ? goalModal.goal : undefined}
          onCancel={() => setGoalModal(null)}
          onSave={upsertGoal}
          onDelete={goalModal.mode === "edit" ? deleteGoal : undefined}
        />
      )}
    </div>
  );
}
