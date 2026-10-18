import { FormEvent, useEffect, useMemo, useState } from 'react';

type Filter = 'all' | 'active' | 'completed';

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

const initialTasks: Task[] = [
  { id: 1, title: 'Plan the week ahead', completed: true },
  { id: 2, title: 'Reply to project messages', completed: false },
  { id: 3, title: 'Take a 20-minute walk', completed: false },
];

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Done' },
];

function readTasks() {
  try {
    const saved = localStorage.getItem('daylist-tasks');
    return saved ? (JSON.parse(saved) as Task[]) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6.5 12.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 3h6l1 4H8l1-4ZM7 7l1 14h8l1-14M10 11v6M14 11v6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c.6 5.2 4.1 8.8 9 10-4.9 1.2-8.4 4.8-9 10-.6-5.2-4.1-8.8-9-10 4.9-1.2 8.4-4.8 9-10Z" />
    </svg>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    localStorage.setItem('daylist-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      }),
    [filter, tasks],
  );

  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    setTasks((current) => [
      ...current,
      { id: Date.now(), title, completed: false },
    ]);
    setNewTask('');
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="todo-card" aria-labelledby="page-title">
        <header className="card-header">
          <div>
            <div className="eyebrow">
              <span className="spark">
                <SparkIcon />
              </span>
              Make today count
            </div>
            <h1 id="page-title">My day</h1>
            <p className="subtitle">
              {remainingCount === 0
                ? 'Everything is done. Nice work.'
                : `${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} left to finish`}
            </p>
          </div>

          <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
            <div>
              <strong>{progress}%</strong>
              <span>done</span>
            </div>
          </div>
        </header>

        <form className="add-task" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">
            Add a new task
          </label>
          <input
            id="new-task"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="What needs to get done?"
            autoComplete="off"
          />
          <button type="submit" disabled={!newTask.trim()} aria-label="Add task">
            <PlusIcon />
            <span>Add task</span>
          </button>
        </form>

        <div className="toolbar">
          <div className="filters" aria-label="Filter tasks">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? 'active' : ''}
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
              >
                {item.label}
                {item.value === 'all' && <span>{tasks.length}</span>}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setTasks((current) => current.filter((task) => !task.completed))}
            >
              Clear completed
            </button>
          )}
        </div>

        <div className="task-list" aria-live="polite">
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => (
              <article className={`task-item ${task.completed ? 'is-complete' : ''}`} key={task.id}>
                <button
                  type="button"
                  className="check-button"
                  onClick={() => toggleTask(task.id)}
                  aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}
                >
                  <CheckIcon />
                </button>
                <span className="task-title">{task.title}</span>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  <TrashIcon />
                </button>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <CheckIcon />
              </span>
              <strong>{filter === 'completed' ? 'No finished tasks yet' : 'Your list is clear'}</strong>
              <p>
                {filter === 'completed'
                  ? 'Complete a task and it will show up here.'
                  : 'Add something above when you are ready.'}
              </p>
            </div>
          )}
        </div>

        <footer className="card-footer">
          <span>Small steps add up.</span>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </footer>
      </section>
    </main>
  );
}
