import React, { useState } from 'react';
import GeneratorForm from './components/GeneratorForm';
import RelicCarousel from './components/RelicCarousel';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';
import { Relic } from './types';
import Loader from './components/Loader';

const initialRelics: Relic[] = [
  {
    title: "The Sunken Kingdom",
    image: "https://placehold.co/600x400/0b0b0f/e8e6e3?text=The+Sunken+Kingdom",
    prompt: "The Sunken Kingdom, ancient ruins, glowing runes, deep sea, high fantasy",
    tags: ["ancient", "ruins", "glowing", "runes", "deep sea"],
  },
  {
    title: "The Obsidian Blade",
    image: "https://placehold.co/600x400/0b0b0f/e8e6e3?text=The+Obsidian+Blade",
    prompt: "The Obsidian Blade, dark fantasy, sword, volcanic glass, intricate design",
    tags: ["dark fantasy", "sword", "volcanic", "glass", "intricate"],
  },
  {
    title: "The Astral Orrery",
    image: "https://placehold.co/600x400/0b0b0f/e8e6e3?text=The+Astral+Orrery",
    prompt: "The Astral Orrery, celestial, mechanical, planets, stars, magic",
    tags: ["celestial", "mechanical", "planets", "stars", "magic"],
  },
];

const App: React.FC = () => {
  const [relics, setRelics] = useState<Relic[]>(initialRelics);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-[#0b0b0f] text-[#e8e6e3] font-['Inter'] min-h-screen w-full">
      <Toaster position="top-center" />
      <Header />
      <main className="max-w-[1100px] mx-auto p-4 md:p-5">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <GeneratorForm setRelics={setRelics} setIsLoading={setIsLoading} isLoading={isLoading} />
          {isLoading ? (
            <div className="mt-8">
              <Loader />
            </div>
          ) : (
            <RelicCarousel relics={relics} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
