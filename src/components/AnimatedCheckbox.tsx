import { useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function AnimatedCheckbox({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
}: AnimatedCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleToggle = () => {
    const newChecked = !checked;
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative h-6 w-6 cursor-pointer"
      aria-checked={checked}
      role="checkbox"
    >
      <motion.div
        className="h-6 w-6 rounded border-2 transition-colors duration-200"
        animate={{
          borderColor: checked ? '#ec4899' : '#d4d4d8',
          backgroundColor: checked ? '#ec4899' : '#ffffff',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-full w-full"
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={false}
            animate={{
              pathLength: checked ? 1 : 0,
              opacity: checked ? 1 : 0,
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
    </button>
  );
}
