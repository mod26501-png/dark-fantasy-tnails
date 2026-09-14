import React from "react";
import { Relic } from "../types";
import toast from "react-hot-toast";

interface RelicCardProps {
  relic: Relic;
}

const RelicCard: React.FC<RelicCardProps> = ({ relic }) => {
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(relic.prompt);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <img
        src={relic.image}
        alt={relic.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2">{relic.title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {relic.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#2a2a2a] text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleCopyPrompt}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-300"
          >
            Copy Prompt
          </button>
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-300">
            Remix
          </button>
          <button className="text-gray-400 hover:text-white transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v1h2a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h2V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelicCard;
