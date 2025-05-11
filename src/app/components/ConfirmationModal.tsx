import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export default function ConfirmationModal({ isOpen, onConfirm, onCancel, message }: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed left-0 right-0 top-0 bottom-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-dark-200/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white/90 mb-4">Change Assistant Type</h3>
              
              <p className="text-white/70 mb-6">
                {message}
              </p>
              
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg bg-dark-100/50 text-white/70 hover:bg-dark-100/70 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-accent-blue/90 text-white hover:bg-accent-blue transition-colors"
                >
                  Confirm
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 