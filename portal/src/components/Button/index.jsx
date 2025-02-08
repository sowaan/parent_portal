export function ButtonWithIcon({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
    >
      <span>{icon}</span>
      {text}
    </button>
  );
}
