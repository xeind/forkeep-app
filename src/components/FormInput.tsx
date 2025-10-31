import { forwardRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label
            htmlFor={id}
            className="mb-1 block text-sm font-medium"
          >
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'border-0 bg-white/60 dark:bg-gray-700/60 px-4 py-3 shadow-sm ring-1 ring-zinc-950/10 dark:ring-white/10 transition-all duration-200 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none dark:text-gray-100',
            error && 'ring-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 px-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
