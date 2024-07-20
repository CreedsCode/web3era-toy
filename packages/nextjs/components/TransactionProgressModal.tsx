import React, { useEffect, useState } from "react";

interface TransactionProgressModalProps {
  isOpen: boolean;
  transactionStatus: string;
  onClose: () => void;
}

const TransactionProgressModal: React.FC<TransactionProgressModalProps> = ({ isOpen, transactionStatus, onClose }) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (transactionStatus === "Submitting mood to the blockchain...") {
      setCompletedSteps(["Signing the Mood"]);
    } else if (transactionStatus === "Mood submitted successfully. Waiting for block inclusion...") {
      setCompletedSteps(["Signing the Mood", "Submitting to Backend", "Wrapping the Transaction"]);
    } else if (transactionStatus === "Mood included in block. Processing complete!") {
      setCompletedSteps([
        "Signing the Mood",
        "Submitting to Backend",
        "Wrapping the Transaction",
        "Submitting to Blockchain",
      ]);
    }
  }, [transactionStatus]);

  const steps = ["Signing the Mood", "Submitting to Backend", "Wrapping the Transaction", "Submitting to Blockchain"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Transaction Progress</h2>
        <ul className="mb-6">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center mb-2">
              <span className="mr-2">
                {completedSteps.includes(step) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="h-5 w-5 border-2 border-gray-300 rounded-full inline-block"></span>
                )}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
        <p className="mb-6 font-bold">{transactionStatus}</p>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TransactionProgressModal;
