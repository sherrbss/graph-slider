"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isDark = React.useMemo(() => theme === "dark", [theme]);
  return (
    <button
      className="w-9 px-0"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SunIcon className="absolute h-[1.2rem] w-[1.2rem]" />
          </motion.span>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fill-[--gray-1]"
          >
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default ThemeSwitcher;
