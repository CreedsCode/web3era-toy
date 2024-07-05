"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const Login: NextPage = () => {
  const [username, setUsername] = useState("");
  const [wallet, setWallet] = useState<PrivateKeyAccount | null>(null);
  const [privateKey, setPrivateKey] = useState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const _privateKey = generatePrivateKey();
    setPrivateKey(_privateKey);
    const account = privateKeyToAccount(_privateKey);

    setWallet(account);
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
          console.log("Public key sent for whitelisting");
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

          {isReady ? (
            <Link href="/mood" passHref>
              <button
                onClick={handleLogin}
                className="mt-6 float w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Start the Adventure!
              </button>
            </Link>
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
