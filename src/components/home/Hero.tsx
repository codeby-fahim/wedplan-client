import Image from 'next/image';
import React from 'react';

const Hero = () => {
  return (
    <div className="relative aspect-video w-full">
      <Image src="/hero.jpg" alt="Hero Image" fill className="object-cover" />
    </div>
  );
};

export default Hero;