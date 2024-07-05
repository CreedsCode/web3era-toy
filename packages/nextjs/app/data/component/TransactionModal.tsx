// components/TransactionModal.tsx
import React from "react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Transaction in Progress</h2>
        <p className="mb-6">
          Your mood is being stored on the blockchain. Please wait while the transaction is being processed.
        </p>
        <p className="mb-6">
          Interested in learning more about meta transactions and the technology behind this app? Check out the{" "}
          <a href="https://github.com/CreedsCode/web3era-toy">
            <a className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
          </a>{" "}
          for a detailed guide and the source code. Stay up to date by following me on{" "}
          <a href="https://x.com/spanish_vanish">
            <a className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          </a>
          .
        </p>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TransactionModal;
