import React, { useEffect, useState } from "react";

const funMessages = [
  "Asking our AI elves...",
  "Scanning the gift-a-verse...",
  "Unwrapping a few great ideas...",
  "Checking Santa's list...",
  "Consulting the gift gurus...",
];

const GiftLoadingScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % funMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-12 animate-fade-in-up">
      {/* Animated Gift Box Spinner */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="w-20 h-16 bg-primary rounded-b-lg shadow-lg relative z-10 animate-bounce" />
        <div className="absolute left-0 right-0 -bottom-3 mx-auto w-16 h-3 bg-primary/60 rounded-full blur-sm opacity-60 z-0" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-secondary rounded-t-lg shadow-md animate-gift-lid"
          style={{ animationDelay: "0.2s" }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-24 bg-yellow-400 rounded-full z-20 animate-pulse-slow" />
        <div className="absolute top-8 left-0 w-20 h-4 bg-yellow-400 rounded-full z-20 animate-pulse-slow" />
      </div>
      <div className="mt-4 text-lg font-semibold text-primary animate-fade-in-up">
        {funMessages[messageIndex]}
      </div>
      <div className="text-sm text-text-secondary mt-2 animate-fade-in">
        Our AI is wrapping up your recommendations!
      </div>
    </div>
  );
};

export default GiftLoadingScreen;
