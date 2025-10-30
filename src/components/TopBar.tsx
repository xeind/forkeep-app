export default function TopBar() {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 border-b border-zinc-950/10 bg-white">
      <div className="flex h-16 items-center px-6">
        <h1
          className="text-2xl font-bold text-pink-600"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          Forkeep
        </h1>
      </div>
    </div>
  );
}
