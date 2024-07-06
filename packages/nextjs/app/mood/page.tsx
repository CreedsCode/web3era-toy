"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { encodeFunctionData } from "viem";
import { PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { useWaitForTransactionReceipt } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

const Mood: NextPage = () => {
  const { targetNetwork } = useTargetNetwork();
  const [wallet, setWallet] = useState<PrivateKeyAccount | null>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whitelistingTxHash, setWhitelistingTxHash] = useState<string | null>(null);

  const moods = [
    { name: "Bored", emoji: "😑" },
    { name: "Good", emoji: "😊" },
    { name: "Hyped", emoji: "🎉" },
  ];

  const {
    data: txReceipt,
    error: txError,
    isSuccess,
  } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash: whitelistingTxHash as `0x${string}`,
  });

  const { data: deployedContractData } = useDeployedContractInfo("DataContract");

  const { data: nonce } = useScaffoldReadContract({
    contractName: "DataContract",
    functionName: "nonces",
    args: [wallet?.address as `0x${string}`],
    enabled: !!wallet,
  });

  useEffect(() => {
    const storedWallet = localStorage.getItem("privateKey");
    if (storedWallet) {
      setWallet(privateKeyToAccount(storedWallet));
    }

    const storedTxHash = localStorage.getItem("whitelistingTxHash");
    if (storedTxHash) {
      setWhitelistingTxHash(storedTxHash);
    }
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setIsSubmitting(true);

    const username = localStorage.getItem("username");

    if (!username || !wallet) {
      console.error("Username or wallet not found in local storage");
      setIsSubmitting(false);
      return;
    }

    const dataString = JSON.stringify({ username, mood });

    try {
      const functionSignature = encodeFunctionData({
        abi: deployedContractData?.abi,
        functionName: "storeData",
        args: [wallet.address, dataString],
      });

      const metaTransaction = {
        nonce: BigInt(nonce?.toString() || "0"),
        from: wallet.address,
        functionSignature: functionSignature,
      };

      const signature = await wallet.signTypedData({
        domain: {
          name: "DataContract",
          version: "2",
          chainId: BigInt(11155111),
          verifyingContract: deployedContractData?.address as `0x${string}`,
        },
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          MetaTransactionStruct: [
            { name: "nonce", type: "uint256" },
            { name: "from", type: "address" },
            { name: "functionSignature", type: "bytes" },
          ],
        },
        primaryType: "MetaTransactionStruct",
        message: metaTransaction,
      });

      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            metaTransaction,
            signature,
            chainId: targetNetwork?.id?.toString(),
          },
          (_, v) => (typeof v === "bigint" ? v.toString() : v),
        ),
      });

      if (response.ok) {
        console.log("Mood submitted successfully");
      } else {
        console.error("Error submitting mood");
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting mood:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-600">How are you feeling?</h1>
        <p className="text-center mb-8 text-gray-700">Select your mood and we&apos;ll store it on-chain!</p>
        {/* {JSON.stringify(txReceipt, (_, v) => (typeof v === "bigint" ? v.toString() : v))} */}
        {!isSuccess ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Waiting for whitelisting...</p>
            <p className="text-gray-500">
              <a
                href={`https://sepolia.etherscan.io/tx/${whitelistingTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Inspect the transaction happening on Chain!
              </a>
            </p>
          </div>
        ) : txReceipt ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {moods.map(mood => (
                <button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood.name)}
                  className={`p-4 rounded-lg text-center transition duration-300 ease-in-out transform hover:scale-105 ${
                    selectedMood === mood.name ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  disabled={isSubmitting}
                >
                  <span className="text-4xl mb-2 block">{mood.emoji}</span>
                  <span className="font-medium">{mood.name}</span>
                </button>
              ))}
            </div>

            {isSubmitting ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-purple-600 font-medium">Storing your mood on-chain...</p>
              </div>
            ) : (
              selectedMood && (
                <Link href="/data" passHref>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
                    See All Moods
                  </button>
                </Link>
              )
            )}
          </>
        ) : txError ? (
          <div className="text-center">
            <p className="text-red-600 font-medium">Error occurred during whitelisting.</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 font-medium">Please wait for whitelisting to complete.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mood;
