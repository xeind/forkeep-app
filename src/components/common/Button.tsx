import { motion } from 'motion/react';
import { type ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) {
  const baseStyles =
    'rounded-full font-medium shadow-md transition-all duration-200 ease-out';

  const variantStyles = {
    primary:
      'bg-pink-500 text-white ring-1 ring-pink-600/20 hover:bg-pink-600 hover:shadow-lg dark:bg-pink-600 dark:hover:bg-pink-700',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
    danger:
      'bg-red-500 text-white ring-1 ring-red-600/20 hover:bg-red-600 hover:shadow-lg dark:bg-red-600 dark:hover:bg-red-700',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledStyles = disabled ? 'cursor-not-allowed opacity-50' : '';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
