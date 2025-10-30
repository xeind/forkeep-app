import { motion } from 'motion/react';
import { forwardRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';

type MotionButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    enableHover?: boolean;
    enableTap?: boolean;
  };

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, enableHover = true, enableTap = true, disabled, ...props }, ref) => {
    return (
      <motion.div
        whileHover={!disabled && enableHover ? { scale: 1.02 } : {}}
        whileTap={!disabled && enableTap ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
        style={{ display: 'inline-block' }}
      >
        <Button ref={ref} disabled={disabled} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

MotionButton.displayName = 'MotionButton';

export { MotionButton };
