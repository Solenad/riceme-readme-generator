"use client";

import Link from "next/link";
import { Suspense } from "react";
import { motion } from "motion/react";
import { ReadmeBuilder } from "@/components/readme-builder";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function BuildPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <motion.div
        className="mx-auto max-w-5xl"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="mb-2 flex items-baseline justify-between" variants={fadeUp}>
          <h1 className="text-2xl font-bold">
            <Link href="/" className="text-term-green hover:underline">
              RiceMe
            </Link>
          </h1>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            &larr; back
          </Link>
        </motion.div>

        <motion.section variants={fadeUp}>
          <h2 className="mb-1 mt-8 text-lg font-bold">
            <span className="text-term-green">build your own</span>
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your GitHub username to auto-populate, or fill in the fields
            manually. Toggle ASCII art, then paste the snippet into your README.
          </p>
          <Suspense>
            <ReadmeBuilder />
          </Suspense>
        </motion.section>
      </motion.div>
    </main>
  );
}
