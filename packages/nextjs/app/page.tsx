"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useTheme } from "next-themes";
import { PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const Login: NextPage = () => {
  const router = useRouter();
  const { setTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [wallet, setWallet] = useState<PrivateKeyAccount | null>(null);
  const [privateKey, setPrivateKey] = useState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTheme("light");
    const _privateKey = generatePrivateKey();
    setPrivateKey(_privateKey);
    const account = privateKeyToAccount(_privateKey);

    setWallet(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsReady(e.target.value.length > 0);
  };

  const handleLogin = async () => {
    if (username && wallet) {
      localStorage.setItem("username", username);
      localStorage.setItem("privateKey", privateKey);

      try {
        const response = await fetch("/api/whitelist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicKey: wallet.address }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("whitelistingTxHash", data.transactionHash);
          console.log("Public key sent for whitelisting");
          router.push("/mood");
        } else {
          console.error("Failed to send public key for whitelisting");
        }
      } catch (error) {
        console.error("Error sending public key for whitelisting:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-600">Web3Era TOY</h1>
        <h2 className="text-2xl text-center mb-8 text-gray-700">
          Let&apos;s get everyone to store something on-chain, without pain!
        </h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Choose your fun username!
            </label>
            <input
              type="text"
              id="username"
              placeholder="SuperCoolUser123"
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <p className="text-red-600 text-sm font-medium bg-red-100 border border-red-200 rounded-md p-3">
            Warning: Do not use your email address or full name as your username. This information will be publicly
            readable on the blockchain. Twitter handles, Discord usernames, or your first name are fine, but avoid using
            any personally identifiable information.
          </p>

          {isReady ? (
            <button
              onClick={handleLogin}
              className="mt-6 float w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start the Adventure!
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-md cursor-not-allowed"
            >
              Enter a username to start
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">No wallet? No problem! We&apos;ve got you covered.</p>
      </div>
    </div>
  );
};
export default Login;
