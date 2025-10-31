import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full rounded-full border-0 px-6 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/60 shadow-sm ring-1 ring-zinc-950/10 dark:ring-white/10 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-900/50 focus:outline-none ${error ? 'ring-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-2 px-6 text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
