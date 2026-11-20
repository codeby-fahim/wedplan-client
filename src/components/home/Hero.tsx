import Image from 'next/image';
import React from 'react';

const Hero = () => {
  return (
    <div>
      <Image
        src="/hero.jpg"
        alt="Hero Image"  
      />    
    </div>
  );
};

export default Hero;