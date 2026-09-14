import React, { useCallback, useState } from "react";
import { GeneratorForm } from "./components/GeneratorForm";
import { LoadingScreen } from "./components/LoadingScreen";
import { PromptCardSet } from "./components/PromptCardSet";
import * as geminiService from "./services/geminiService";
import type { GeneratedData } from "./types";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (idea: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    setUserInput(idea); // keep the idea in case of error

    try {
      setLoadingMessage("Crafting a new dark fantasy universe...");
      const textData = await geminiService.generatePromptSet(idea);

      setLoadingMessage("Summoning ancient visuals...");

      const imagePrompts = [
        {
          type: "banner",
          prompt:
            `An epic dark fantasy landscape or scene that could serve as a banner for a collection called "The Demon Codex". Tones: ${textData.tone}. Cinematic, dramatic, gothic, high contrast. Do not include any text.`,
          aspectRatio: "16:9" as const,
        },
        ...textData.cards.map((card, index) => ({
          type: `card-${index}`,
          prompt: `${card.title}, ${
            card.prompt.replace(/\n/g, ", ")
          }, cinematic reference, dark fantasy art, high detail`,
          aspectRatio: "16:9" as const,
        })),
      ];

      const imageUrls: { [key: string]: string } = {};

      for (let i = 0; i < imagePrompts.length; i++) {
        const p = imagePrompts[i];
        setLoadingMessage(
          `Generating visual ${i + 1} of ${imagePrompts.length}: ${p.type}...`,
        );
        const imageUrl = await geminiService.generateImage(
          p.prompt,
          p.aspectRatio,
        );
        imageUrls[p.type] = imageUrl;
      }

      const finalData: GeneratedData = {
        ...textData,
        mainTitle: "The Demon Codex",
        bannerImageUrl: imageUrls["banner"],
        cards: textData.cards.map((card, index) => ({
          ...card,
          imageUrl: imageUrls[`card-${index}`] || "",
        })),
      };

      setGeneratedData(finalData);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error
        ? err.message
        : "An unknown error occurred during generation.";
      setError(`Failed to generate relic series. ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, []);

  const handleStartOver = () => {
    setGeneratedData(null);
    setError(null);
    setUserInput("");
  };

  return (
    <div className="bg-[#0b0b0f] text-[#e8e6e3] font-['Inter'] min-h-screen w-full">
      <main className="max-w-[1100px] mx-auto p-4 md:p-5">
        {isLoading && <LoadingScreen message={loadingMessage} />}

        {!isLoading && !generatedData && (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center mb-8 animate-fade-in">
              <h1
                className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#f5a16f] to-[#b14a38]"
                style={{ filter: "drop-shadow(0 0 10px #8d1a1a)" }}
              >
                The Demon Codex
              </h1>
              <p className="text-xl text-[#9aa0a6] mt-4">
                Dark Fantasy Thumbnail Vault
              </p>
            </div>
            <GeneratorForm
              initialValue={userInput}
              onGenerate={handleGenerate}
              isGenerating={isLoading}
            />
            {error && (
              <div className="mt-6 p-4 bg-[#8d1a1a]/20 border border-[#8d1a1a] text-[#f0d7c2] rounded-lg max-w-xl text-center">
                <p className="font-bold">Generation Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {generatedData && (
          <PromptCardSet data={generatedData} onStartOver={handleStartOver} />
        )}
      </main>
    </div>
  );
};

export default App;
