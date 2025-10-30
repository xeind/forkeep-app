import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function TopBar() {
  return (
    <Link to="/discover" className="fixed top-6 left-6 z-50">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-md bg-linear-to-b from-[#FB64B6] to-[#E60076] px-6 py-3 text-xl font-bold text-white shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#ec4899] transition-all duration-200"
        style={{
          fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
        }}
      >
        Forkeep
      </motion.button>
    </Link>
  );
}
