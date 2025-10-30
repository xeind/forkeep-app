import { forwardRef } from 'react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  error?: string;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'border-0 bg-white/60 px-4 py-3 shadow-sm ring-1 ring-zinc-950/10 transition-all duration-200 ring-inset placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none',
            error && 'ring-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 px-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
