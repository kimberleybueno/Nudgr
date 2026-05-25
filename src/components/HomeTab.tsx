"use client";

import { useEffect, useMemo, useState } from "react";
import { C } from "@/lib/colors";
import type { Task, Goal, Partner, UserData } from "@/types";
import { refreshOverdue } from "@/lib/overdue";
import { calculateStreak, recordCompletion } from "@/lib/streak";

import Hero from "./Hero";
import Calendar from "./Calendar";
import TaskList from "./TaskList";
import GoalGrid from "./GoalGrid";
import Confetti, { type ConfettiTier } from "./Confetti";

interface Props {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
}

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
const todayDate = () => new Date().toISOString().slice(0, 10);
const todayDayOfMonth = () => new Date().getDate();
const dayLabel = (day: number) => {
  const d = new Date();
  d.setDate(day);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function HomeTab({ user, setUser }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(() => todayDayOfMonth());
  const [confetti, setConfetti] = useState<ConfettiTier | null>(null);

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

  const isToday = selectedDay === todayDayOfMonth();
  const todayLabelStr = isToday ? undefined : dayLabel(selectedDay);

  // Combined task list for the selected date (standalone + tasks-of-goals)
  const visibleTasks = useMemo(() => {
    const goalTasks = user.goals.flatMap((g) => g.tasks);
    const all = [...user.tasks, ...goalTasks];
    if (isToday) {
      return all.filter((t) =>
        t.due === selectedDay ||
        t.due == null ||
        t.recurring != null
      );
    }
    return all.filter((t) =>
      t.due === selectedDay ||
      t.recurring != null
    );
  }, [user.tasks, user.goals, selectedDay, isToday]);

  // Days that have tasks (for the calendar dots)
  const daysWithTasks = useMemo(() => {
    const set = new Set<number>();
    const goalTasks = user.goals.flatMap((g) => g.tasks);
    for (const t of [...user.tasks, ...goalTasks]) {
      if (t.due != null) set.add(t.due);
    }
    return set;
  }, [user.tasks, user.goals]);

  // Hero metrics — always today, ignore selectedDay per brief? Re-reading:
  // "The label changes to show the selected date when viewing another day: 'MAY 26'"
  // So both label AND values reflect selectedDay.
  const heroMetrics = useMemo(() => {
    const todayDay = todayDayOfMonth();
    const relevantDay = selectedDay;
    const goalTasks = user.goals.flatMap((g) => g.tasks);
    const pool = [...user.tasks, ...goalTasks].filter((t) => {
      if (relevantDay === todayDay) return t.due === relevantDay || t.due == null || t.recurring != null;
      return t.due === relevantDay || t.recurring != null;
    });
    const done = pool.filter((t) => t.done).length;
    const total = pool.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { pct, done, total };
  }, [user.tasks, user.goals, selectedDay]);

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

  const addStandalone = (text: string, due: number) => {
    const newTask: Task = {
      id: id("t"),
      text,
      done: false,
      star: false,
      overdue: false,
      goalId: null,
      partnerId: null,
      due,
      recurring: null,
      createdAt: todayDate(),
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
      due: todayDayOfMonth(),
      recurring: null,
      createdAt: todayDate(),
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
        const flipped = { ...t, done: !t.done, completedAt: !t.done ? todayDate() : undefined };
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
      const todayDay = todayDayOfMonth();
      const goalTasks = updated.goals.flatMap((g) => g.tasks);
      const todays = [...updated.tasks, ...goalTasks].filter((t) =>
        t.due === todayDay || t.due == null || t.recurring != null
      );
      allTodayDone = todays.length > 0 && todays.every((t) => t.done);

      // Update streak + completion dates on completion
      if (becameDone) {
        const completionDates = recordCompletion(updated.completionDates);
        updated.completionDates = completionDates;
        updated.lastActiveDate = todayDate();
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

  return (
    <div className="anim-up">
      <Hero
        name={user.name}
        todayPct={heroMetrics.pct}
        doneToday={heroMetrics.done}
        totalToday={heroMetrics.total}
        streak={user.streak}
        selectedDayLabel={todayLabelStr}
      />

      <Calendar
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
        daysWithTasks={daysWithTasks}
      />

      <TaskList
        tasks={visibleTasks}
        goals={user.goals}
        partners={user.partners}
        selectedDay={selectedDay}
        isToday={isToday}
        dayLabel={isToday ? "today" : dayLabel(selectedDay)}
        onAddStandalone={addStandalone}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onToggleTask={toggleTask}
        onReorder={reorderTask}
      />

      <GoalGrid
        goals={user.goals}
        onAddTaskToGoal={addTaskToGoal}
        onToggleTaskInGoal={(_goalId, taskId) => toggleTask(taskId)}
      />

      <Confetti tier={confetti} onDone={() => setConfetti(null)} />
    </div>
  );
}
