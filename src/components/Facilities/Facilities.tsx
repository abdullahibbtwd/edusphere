"use client"
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Facility {
  id?: string;
  name: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  order?: number;
}

const Facilities = ({ school }: { school: string }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          setFacilities(schoolData.content?.facilities || []);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchFacilities();
    }
  }, [school]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-bg to-surface">
        <div className="container mx-auto px-4">
          <div className="animate-pulse text-center">
            <div className="h-12 bg-muted/20 rounded mb-4 w-64 mx-auto"></div>
            <div className="h-6 bg-muted/10 rounded mb-12 w-96 mx-auto"></div>
            <div className="relative h-[600px] flex items-center justify-center">
              <div className="w-[350px] h-[500px] bg-muted/20 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const displayFacilities = facilities.length > 0
    ? facilities
      .map((facility, index) => {
        if (typeof facility === "string") {
          return null;
        } else {
          return {
            id: index.toString(),
            name: facility.name,
            imageUrl: facility.image || facility.imageUrl,
            description: facility.description,
            order: index
          };
        }
      })
      .filter((f): f is NonNullable<typeof f> => f !== null && !!f.imageUrl)
    : [];

  if (displayFacilities.length === 0) {
    return null;
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayFacilities.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayFacilities.length) % displayFacilities.length);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + displayFacilities.length) % displayFacilities.length;

    if (position === 0) {
      // Active card - center, full size
      return {
        x: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30,
        rotateY: 0,
      };
    } else if (position === 1) {
      // Next card - slightly to the right
      return {
        x: window.innerWidth < 768 ? 150 : 280,
        scale: 0.85,
        opacity: 0.6,
        zIndex: 20,
        rotateY: -15,
      };
    } else if (position === displayFacilities.length - 1) {
      // Previous card - slightly to the left
      return {
        x: window.innerWidth < 768 ? -150 : -280,
        scale: 0.85,
        opacity: 0.6,
        zIndex: 20,
        rotateY: 15,
      };
    } else {
      // Hidden cards
      return {
        x: position < displayFacilities.length / 2 ? 400 : -400,
        scale: 0.6,
        opacity: 0,
        zIndex: 10,
        rotateY: 0,
      };
    }
  };

  return (
    <section className="py-20 bg-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-6xl font-black text-text mb-4 tracking-tight">
            Our Facilities
          </h1>
          <p className="md:text-xl text-sm md:text-xl text-muted max-w-2xl mx-auto">
            World-class amenities designed to enhance learning and development
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative h-[600px] md:h-[700px] flex items-center justify-center mb-12">
          <AnimatePresence mode="sync">
            {displayFacilities.map((facility, index) => {
              const style = getCardStyle(index);
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={facility.id}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    rotateY: style.rotateY,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  drag={isActive ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!isActive) setActiveIndex(index);
                  }}
                  style={{
                    perspective: 1000,
                    cursor: isActive ? 'grab' : 'pointer',
                  }}
                  whileHover={!isActive ? { scale: style.scale * 1.05 } : {}}
                >
                  {/* Card */}
                  <div className="relative w-[320px] md:w-[400px] h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-surface">
                    {/* Image */}
                    <div className="relative h-[80%] overflow-hidden">
                      <Image
                        src={facility.imageUrl || "/placeholder-facility.jpg"}
                        alt={facility.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                        sizes="(max-width: 768px) 320px, 400px"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80 dark:via-black/40" />

                      
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface via-surface/98 to-transparent h-[20%] flex flex-col justify-end">
                      <h2 className="text-2xl md:text-3xl font-black text-text mb-3 tracking-tight">
                        {facility.name}
                      </h2>
                      {facility.description && (
                        <p className="text-muted text-sm md:text-base line-clamp-2">
                          {facility.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Navigation Arrows */}
          {displayFacilities.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 md:left-8 z-40 p-4 bg-surface/90 backdrop-blur-md rounded-full shadow-xl hover:bg-surface transition-all hover:scale-110 active:scale-95"
                aria-label="Previous facility"
              >
                <ChevronLeft className="w-6 h-6 text-text" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 z-40 p-4 bg-surface/90 backdrop-blur-md rounded-full shadow-xl hover:bg-surface transition-all hover:scale-110 active:scale-95"
                aria-label="Next facility"
              >
                <ChevronRight className="w-6 h-6 text-text" />
              </button>
            </>
          )}
        </div>

        {/* Dots Navigation */}
        {displayFacilities.length > 1 && (
          <div className="flex justify-center gap-3">
            {displayFacilities.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative h-3 rounded-full transition-all duration-300 ${index === activeIndex
                  ? 'w-12 bg-primary'
                  : 'w-3 bg-muted hover:bg-muted/70'
                  }`}
                aria-label={`Go to facility ${index + 1}`}
              >
                {index === activeIndex && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Facility Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm font-bold text-muted uppercase tracking-widest">
            {activeIndex + 1} / {displayFacilities.length}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Facilities;
