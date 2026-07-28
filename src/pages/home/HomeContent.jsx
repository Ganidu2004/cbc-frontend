import React from 'react';
import HeroBanner from '../../components/home/HeroBanner';
import ShadeMatcher from '../../components/home/ShadeMatcher';
import ShoppableReel from '../../components/home/ShoppableReel';

export default function HomeContent() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <HeroBanner />
      <ShadeMatcher />
      <ShoppableReel />
    </div>
  );
}
