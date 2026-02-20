"use client";

import { motion } from "framer-motion";

const WelcomeAnimation = () => {
    return (
        <div className="flex items-center justify-center min-h-[200px] w-full bg-transparent p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0, 0.71, 0.2, 1.01],
                    scale: {
                        type: "spring",
                        damping: 5,
                        stiffness: 100,
                        restDelta: 0.001
                    }
                }}
                className="text-center"
            >
                <motion.h1
                    className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Welcome
                </motion.h1>
                <motion.p
                    className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    to Edusphere
                </motion.p>
            </motion.div>
        </div>
    );
};

export default WelcomeAnimation;
