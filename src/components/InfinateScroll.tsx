'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type CarouselSchool = {
  id: string;
  name: string;
  subdomain: string;
  logo: string | null;
};

const sliderVariants = {
  initial: {
    x: 0,
  },
  animate: {
    x: '-100%',
    transition: {
      repeat: Infinity,
      repeatType: 'loop' as const,
      duration: 18,
      ease: 'linear' as const,
    },
  },
};

function SchoolCard({ school }: { school: CarouselSchool }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (school.logo && !logoFailed) {
    return (
      <div className="mx-3 flex h-24 min-w-40 items-center justify-center rounded-3xl bg-surface-50 p-2 shadow-sm">
        <Image
          width={120}
          height={120}
          className="h-full w-full object-contain"
          src={school.logo}
          alt={school.name}
          unoptimized={school.logo.startsWith('http')}
          onError={() => setLogoFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="mx-3 flex h-24 min-w-40 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 shadow-sm">
      <span className="text-center font-poppins text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
        {school.subdomain}
      </span>
    </div>
  );
}

const InfinateCarousel = () => {
  const [schools, setSchools] = useState<CarouselSchool[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools/carousel');
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setSchools(data.schools ?? []);
        setCount(data.count ?? 0);
      } catch (error) {
        console.error('Failed to fetch carousel schools:', error);
      }
    };

    fetchSchools();
  }, []);

  const displayItems = useMemo(() => {
    if (schools.length > 0) {
      return schools;
    }

    return Array.from({ length: 5 }, (_, index) => ({
      id: `fallback-${index}`,
      name: 'EduSphere',
      subdomain: 'edusphere',
      logo: '/eduspherelogo1.png',
    }));
  }, [schools]);

  const marqueeItems = useMemo(() => {
    if (displayItems.length >= 5) {
      return displayItems;
    }

    return Array.from({ length: 5 }, (_, index) => {
      const school = displayItems[index % displayItems.length];
      return {
        ...school,
        id: `${school.id}-${index}`,
      };
    });
  }, [displayItems]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center overflow-hidden py-8">
      <p className="mb-5 text-center font-poppins text-sm font-bold text-muted md:text-2xl">
        Join {count} School{count === 1 ? '' : 's'}
      </p>

      <div className="relative flex w-full overflow-hidden rounded-3xl bg-bg/60 px-2 py-2">
        <motion.div
          initial="initial"
          animate="animate"
          variants={sliderVariants}
          className="flex w-max flex-shrink-0 items-center py-2"
        >
          {marqueeItems.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={sliderVariants}
          className="flex w-max flex-shrink-0 items-center py-2"
        >
          {marqueeItems.map((school, index) => (
            <SchoolCard
              key={`${school.id}-duplicate-${index}`}
              school={school}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default InfinateCarousel;