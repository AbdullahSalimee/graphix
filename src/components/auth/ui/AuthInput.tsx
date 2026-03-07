import { forwardRef } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  right?: React.ReactNode; // e.g. "Forgot?" link
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, right, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[#6b7280]">
          {label}
        </label>
        {right}
      </div>
      <input
        ref={ref}
        {...props}
        className={`w-full bg-[#0d1014] border text-white text-[0.92rem] font-light px-4 py-3.5 outline-none placeholder-[#6b7280] transition-all duration-200 focus:shadow-[0_0_0_2px_rgba(0,212,200,0.1)] ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-[#1e2227] focus:border-[#00d4c8]"
        }`}
      />
      {error && (
        <p className="text-red-400 text-[0.72rem] leading-tight">{error}</p>
      )}
    </div>
  ),
);

AuthInput.displayName = "AuthInput";
export default AuthInput;
