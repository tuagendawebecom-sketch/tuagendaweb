export default function Loading() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-5">
        <div className="h-16 animate-pulse rounded-3xl bg-mint" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[2rem] bg-mint" />
          <div className="h-80 animate-pulse rounded-[2rem] bg-mint" />
        </div>
      </div>
    </main>
  );
}
