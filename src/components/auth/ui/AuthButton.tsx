interface AuthButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
}

export default function AuthButton({
  loading,
  label,
  loadingLabel,
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full bg-[#00d4c8] text-[#090b0e] font-syne font-bold text-[0.82rem] uppercase tracking-widest py-4 hover:opacity-85 transition-opacity duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-[#090b0e] border-t-transparent rounded-full animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
