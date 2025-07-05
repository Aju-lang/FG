"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientDemo() {
  useEffect(() => {
    toast.success("Welcome to the client demo!");
  }, []);

  return (
    <div>
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-blue-100 rounded-lg shadow"
      >
        <h2 className="text-xl font-bold mb-2">Framer Motion Animation</h2>
        <p>This box fades in and slides up using Framer Motion.</p>
      </motion.div>
    </div>
  );
} 