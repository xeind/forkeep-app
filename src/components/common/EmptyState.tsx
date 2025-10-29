import { motion } from 'motion/react';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        className="text-center"
      >
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="mb-4 text-6xl"
          >
            {icon}
          </motion.div>
        )}
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        {action && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className="mt-6 rounded-full bg-pink-500 px-6 py-3 font-medium text-white shadow-md ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600 hover:shadow-lg"
          >
            {action.label}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
