"use client";
import { motion } from "framer-motion";
import React from "react";
import { ImagesSlider } from "@/components/ui/images-slider";

export function ImagesSliderDemo() {
  const images = [
    // Car images (direct Unsplash image URLs)
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3",
   
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3",
  ];
  return 
    <ImagesSlider className="h-[40rem]" images={images}>
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-50 flex flex-col justify-center items-center"
      >
        <motion.p className="font-bold text-xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4">
          The hero section slideshow <br /> nobody asked for
        </motion.p>
        <button className="px-4 py-2 backdrop-blur-sm border bg-emerald-300/10 border-emerald-500/20 text-white mx-auto text-center rounded-full relative mt-4">
          <span>Join now →</span>
          <div className="absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-emerald-500 to-transparent" />
        </button>
      </motion.div>
    </ImagesSlider>
  
}
