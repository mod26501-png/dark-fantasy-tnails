import React from "react";

interface LoadingScreenProps {
  message: string;
}

const Spinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#8d1a1a]">
  </div>
);

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-[#0b0b0f]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <Spinner />
      <p className="mt-6 text-xl text-[#e8e6e3] font-semibold text-center max-w-md">
        {message || "Generating... Please wait."}
      </p>
      <p className="mt-2 text-sm text-[#9aa0a6]">
        This may take a minute or two.
      </p>
    </div>
  );
};
