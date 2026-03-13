"use client";

export default function AssignmentsPage() {
  return (
    <div className="m-4 mt-0 flex flex-1 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Assignments</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          The assignments module is being updated to match the current school system.
        </p>
      </div>

      <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)]/50 p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-lg font-medium text-[var(--text)]">Coming soon</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Assignment creation, tracking, and submission will be reintroduced here with the new data model.
          </p>
        </div>
      </div>
    </div>
  );
}
