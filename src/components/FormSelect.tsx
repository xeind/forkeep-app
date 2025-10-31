import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormSelectProps {
  id: string;
  label?: ReactNode;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export default function FormSelect({
  id,
  label,
  required = false,
  error,
  placeholder = 'Select an option...',
  value,
  onValueChange,
  options,
  className,
}: FormSelectProps) {
  const hasError = Boolean(error);

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          aria-invalid={hasError}
          className="mt-1 w-full rounded-lg border-0 bg-white/60 dark:bg-gray-700/60 px-4 py-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-zinc-950/10 dark:ring-white/10 transition-all duration-200 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
