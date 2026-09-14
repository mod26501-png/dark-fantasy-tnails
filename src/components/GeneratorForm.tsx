import React, { useState } from "react";
import { Relic } from "../types";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

interface GeneratorFormProps {
  setRelics: (relics: Relic[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = (
  { setRelics, setIsLoading, isLoading },
) => {
  const [theme, setTheme] = useState("");

  const examplePrompts = [
    {
      title: "The Black Oathkeeper",
      prompt: "Armored knight with cracked helm, haunted eyes",
    },
    {
      title: "Wyrm's Reckoning",
      prompt: "Ancient dragon curled around shattered cathedral",
    },
    {
      title: "Watcher Beneath the Ash",
      prompt: "Hooded figure with luminous glyph tattoos in an ash storm",
    },
    {
      title: "The Ossuary Throne",
      prompt: "Undead king seated on bone throne",
    },
    {
      title: "Sigil Echo Variant",
      prompt: "Abstract arcane sigil pulsing with light",
    },
    {
      title: "Timekeeper’s Crypt",
      prompt: "glowing fractures, whisper gears, eternal dusk",
    },
    {
      title: "Void Weaver",
      prompt: "cosmic threads, lone monologues, space-sigil textures",
    },
    {
      title: "Mirror Sovereign",
      prompt: "identity loops, crown paradoxes, ocular myths",
    },
    {
      title: "The Crimson Alchemist",
      prompt:
        "A haunted alchemist surrounded by bubbling potions and vengeful spirits",
    },
    {
      title: "Ghost of the Old War",
      prompt:
        "A spectral soldier patrolling the ruins of a forgotten battlefield",
    },
    {
      title: "Cathedral of Whispers",
      prompt:
        "An immense, silent cathedral where the walls whisper secrets to those who listen",
    },
    {
      title: "The Star-Forged Blade",
      prompt:
        "A legendary sword forged from a fallen star, glowing with cosmic energy",
    },
    {
      title: "Nightmare's Menagerie",
      prompt:
        "A bizarre collection of creatures born from nightmares, displayed in an otherworldly zoo",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      toast.error("Please enter a theme.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      setRelics(data.cards);
      toast.success("New relics have been forged!");
    } catch (error) {
      console.error("Failed to generate relics:", error);
      toast.error(
        (error instanceof Error ? error.message : null) ||
          "Failed to generate relics. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl flex flex-col items-center gap-4"
    >
      <textarea
        aria-label="Fantasy theme input"
        className="w-full p-4 rounded-lg border-2 border-[#242830] focus:border-[#c26b3a] focus:ring-2 focus:ring-[#c26b3a]/50 transition-colors bg-[#111318] shadow-inner text-lg text-[#e8e6e3] placeholder:text-[#70757e]"
        placeholder="Enter a dark fantasy theme, e.g., 'The Sunken Kingdom'"
        rows={3}
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />

      <div className="w-full text-center">
        <p className="text-sm text-[#9aa0a6] mb-2">Or try an example:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {examplePrompts.map(({ title, prompt }) => (
            <button
              key={title}
              type="button"
              aria-label={`Set theme to ${prompt}`}
              className="bg-[#1b1f27] border border-[#242830] rounded-full px-4 py-1.5 text-sm text-[#dcd8d3] hover:bg-[#242830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setTheme(prompt)}
              disabled={isLoading}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full md:w-auto bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white font-bold text-lg py-3 px-12 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        disabled={!theme.trim() || isLoading}
      >
        Generate Relics
      </button>
    </form>
  );
};

export default GeneratorForm;
