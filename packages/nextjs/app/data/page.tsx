"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TransactionModal from "./component/TransactionModal";
import type { NextPage } from "next";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Data: NextPage = () => {
  const [formattedEntries, setFormattedEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: events,
    isLoading,
    error,
  } = useScaffoldEventHistory({
    contractName: "DataContract",
    eventName: "DataStored",
    fromBlock: 0n,
    watch: true,
  });

  useEffect(() => {
    console.log("=====================");
    console.log(events, isLoading, error);
    setIsModalOpen(true);

    if (events) {
      setIsModalOpen(true);

      const formatted = events.map(event => {
        let parsedData;
        try {
          parsedData = JSON.parse(event.args.location);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          parsedData = { username: "Unknown", mood: "Unknown" };
        }

        return {
          id: event.args.id,
          user: event.args.user,
          data: parsedData,
          timestamp: new Date(Number(event.args.timestamp) * 1000).toLocaleString(),
        };
      });
      setFormattedEntries(formatted);
    }
  }, [error, events, isLoading]);

  const getMoodEmoji = mood => {
    switch (mood.toLowerCase()) {
      case "bored":
        return "😑";
      case "good":
        return "😊";
      case "hyped":
        return "🎉";
      default:
        return "🤔";
    }
  };

  if (error) {
    return <div>Error fetching events: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex flex-col items-center justify-center p-4">
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-600">Mood Board</h1>
        <p className="text-center mb-8 text-gray-700">Check out everyone&apos;s on-chain moods!</p>

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading moods from the chain...</p>
          </div>
        ) : formattedEntries.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">🌱</span>
            <p className="text-xl text-purple-600 font-medium">No moods stored yet!</p>
            <p className="text-gray-600 mt-2">Be the first to share your mood on-chain.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formattedEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-gray-100 rounded-lg p-4 shadow transition duration-300 ease-in-out hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600">{entry.data.username}</span>
                  <span className="text-sm text-gray-500">{entry.timestamp}</span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-2xl mr-2">{getMoodEmoji(entry.data.mood)}</span>
                  <span className="font-medium text-gray-700">{entry.data.mood}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" passHref>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Data;
