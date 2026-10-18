"use client";

import { useEffect, useState } from "react";

const words = [
  "Medical",
  "Climate",
  "Meaningful",
  "Jumbo",
];

const TYPING_SPEED = 110;
const DELETING_SPEED = 65;
const HOLD_DURATION = 1300;
const longestWord = words.reduce(
  (longest, current) => (current.length > longest.length ? current : longest),
  words[0]
);

export function TypingHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = window.setTimeout(() => {
      if (!isDeleting && visibleText === currentWord) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && visibleText.length === 0) {
        setIsDeleting(false);
        setWordIndex((currentIndex) => (currentIndex + 1) % words.length);
        return;
      }

      setVisibleText((currentText) =>
        isDeleting
          ? currentText.slice(0, -1)
          : currentWord.slice(0, currentText.length + 1)
      );
    },
    !isDeleting && visibleText === currentWord
      ? HOLD_DURATION
      : isDeleting
        ? DELETING_SPEED
        : TYPING_SPEED);

    return () => window.clearTimeout(timeout);
  }, [isDeleting, visibleText, wordIndex]);

  return (
    <h1 className="max-w-5xl text-5xl leading-[1.08] font-semibold sm:text-7xl">
      <span className="relative inline-block text-left align-baseline">
        <span className="invisible">{longestWord}</span>
        <span className="absolute inset-0 whitespace-nowrap">
          {visibleText}
          <span className="ml-1 inline-block h-[0.95em] w-[0.08em] translate-y-[0.08em] animate-pulse bg-[#222e38] align-baseline" />
        </span>
      </span>
      <br />
      <span>technology for the </span>
      <span className="text-[#8f7220]">world.</span>
    </h1>
  );
}