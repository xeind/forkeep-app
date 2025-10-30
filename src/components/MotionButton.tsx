import { motion, AnimatePresence } from 'motion/react';
import { forwardRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type MotionButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    enableHover?: boolean;
    enableTap?: boolean;
    gradientStyle?: 'default' | 'brand';
    buttonState?: 'idle' | 'loading' | 'success';
    loadingText?: string;
    successText?: string;
  };

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      children,
      enableHover = true,
      enableTap = true,
      disabled,
      gradientStyle,
      buttonState = 'idle',
      loadingText = 'Loading...',
      successText = 'Success!',
      className,
      ...props
    },
    ref
  ) => {
    const hasGradient = gradientStyle !== undefined;

    const gradientClasses = {
      default: 'bg-linear-to-b from-[#1994ff] to-[#157cff]',
      brand: 'bg-linear-to-b from-[#FB64B6] to-[#E60076]',
    };

    const shadowClasses = {
      default:
        'shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#1a94ff]',
      brand:
        'shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#ec4899]',
    };

    const currentText =
      buttonState === 'loading'
        ? loadingText
        : buttonState === 'success'
          ? successText
          : children;

    const exitY = buttonState === 'loading' ? -25 : 25;

    return (
      <motion.div
        whileHover={!disabled && enableHover ? { scale: 1.02 } : {}}
        whileTap={!disabled && enableTap ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
        style={{ display: 'inline-block' }}
      >
        <Button
          ref={ref}
          disabled={
            disabled || buttonState === 'loading' || buttonState === 'success'
          }
          className={cn(
            hasGradient && [
              gradientClasses[gradientStyle!],
              shadowClasses[gradientStyle!],
              'overflow-hidden',
              'text-white',
              '[text-shadow:0px_1px_1.5px_rgba(0,0,0,0.16)]',
              'hover:bg-gradient-to-b',
              'border-0',
            ],
            className
          )}
          {...props}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={exitY}>
            <motion.span
              key={buttonState}
              custom={exitY}
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: exitY }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              style={{ display: 'block' }}
            >
              {currentText}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    );
  }
);

MotionButton.displayName = 'MotionButton';

export { MotionButton };
