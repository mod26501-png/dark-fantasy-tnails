import React, { useMemo, useState } from "react";
import type { GeneratedData, PromptCard as PromptCardType } from "../types";

const Card: React.FC<
  {
    card: PromptCardType;
    archetype: string;
    onImageClick: (src: string) => void;
  }
> = ({ card, archetype, onImageClick }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setCopied(false);
    }
  };

  return (
    <article className="card bg-[#111318] border border-[#242830] rounded-xl overflow-hidden flex flex-col print:border-gray-300">
      <div className="thumb aspect-video bg-[#0f1116] border-b border-[#242830] relative">
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover block cursor-pointer"
          onClick={() => onImageClick(card.imageUrl)}
        />
      </div>
      <div className="card-body p-4 flex flex-col gap-3">
        <h3 className="title-sm font-bold text-lg text-[#e8e6e3]">
          {card.title}
        </h3>
        <div className="meta flex gap-2 flex-wrap">
          <span className="chip bg-[#1b1f27] border border-[#242830] rounded-full px-3 py-1 text-xs text-[#dcd8d3]">
            {archetype}
          </span>
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="chip bg-[#1b1f27] border border-[#242830] rounded-full px-3 py-1 text-xs text-[#dcd8d3]"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="actions flex gap-2 flex-wrap mt-2 no-print">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="btn secondary bg-transparent border border-[#242830] text-[#e8e6e3] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#242830] transition-colors"
          >
            {showPrompt ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={handleCopy}
            className="btn bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
        <div
          className={`prompt-container overflow-hidden transition-all duration-300 ${
            showPrompt ? "max-h-96" : "max-h-0"
          }`}
        >
          <pre className="prompt mt-2 bg-[#0f1116] border border-[#242830] rounded-lg p-3 font-mono text-xs text-[#d9d5ce] whitespace-pre-wrap">{card.prompt}</pre>
        </div>
      </div>
    </article>
  );
};

const Lightbox: React.FC<{ src: string; onClose: () => void }> = (
  { src, onClose },
) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={src}
        alt="Lightbox preview"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg border border-[#242830]"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="lightbox-close absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg border border-[#242830] hover:bg-black/80 transition-colors"
        aria-label="Close lightbox"
      >
        Close
      </button>
    </div>
  );
};

export const PromptCardSet: React.FC<
  { data: GeneratedData; onStartOver: () => void }
> = ({ data, onStartOver }) => {
  const [tagFilter, setTagFilter] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = data.cards.flatMap((c) => c.tags);
    return [...new Set(tags)].sort();
  }, [data.cards]);

  const filteredCards = useMemo(() => {
    return data.cards.filter((card) =>
      !tagFilter || card.tags.includes(tagFilter)
    );
  }, [data.cards, tagFilter]);

  const handleResetFilters = () => {
    setTagFilter("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      <header className="hero relative overflow-hidden border border-[#242830] rounded-lg no-print">
        <img
          src={data.bannerImageUrl}
          alt={`${data.mainTitle} banner`}
          className="w-full h-[30vh] md:h-[40vh] object-cover"
        />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-transparent">
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center">
            <h1
              className="text-5xl md:text-7xl font-extrabold text-white"
              style={{
                textShadow:
                  "0 0 10px #c26b3a, 0 0 20px #8d1a1a, 0 2px 5px #000",
              }}
            >
              {data.mainTitle}
            </h1>
            <p
              className="tagline text-[#dcd8d3] mt-4 text-lg md:text-2xl font-semibold"
              style={{ textShadow: "0 0 5px #000, 0 0 10px #000" }}
            >
              Dark Fantasy Thumbnail Vault —{" "}
              <span className="text-[#e89d72]">{data.archetype}</span> •{" "}
              <span className="italic">{data.tone}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="printable-area">
        <main className="wrap max-w-full mx-auto py-6">
          <div className="toolbar no-print flex gap-3 flex-wrap items-center mb-6">
            <button
              onClick={onStartOver}
              className="btn bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              ✨ Generate New Series
            </button>
            <div className="flex-grow md:flex-grow-0"></div>
            <span className="chip hidden md:inline-block bg-[#1b1f27] border border-[#242830] rounded-full px-3 py-1.5 text-xs text-[#dcd8d3]">
              Filter:
            </span>
            <select
              id="filter-tag"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="select bg-[#1b1f27] text-[#e8e6e3] border border-[#242830] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#c26b3a]"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}
              </option>)}
            </select>
            <button
              onClick={handleResetFilters}
              className="btn secondary bg-transparent border border-[#242830] text-[#e8e6e3] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#242830] transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handlePrint}
              className="btn secondary bg-transparent border border-[#242830] text-[#e8e6e3] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#242830] transition-colors"
            >
              Print / PDF
            </button>
          </div>

          <section
            id="cards"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCards.map((card) => (
              <Card
                key={card.title}
                card={card}
                archetype={data.archetype}
                onImageClick={setLightboxImage}
              />
            ))}
          </section>

          <section className="mt-8 p-4 bg-[#111318] border border-[#242830] rounded-lg no-print">
            <h2 className="title-sm font-bold text-lg text-[#e8e6e3]">
              Negative Prompt Overlay
            </h2>
            <p className="muted text-[#9aa0a6] text-sm mt-1">
              {data.negativePrompts.join("; ")}.
            </p>
            <h2 className="title-sm font-bold text-lg text-[#e8e6e3] mt-4">
              Remix Ritual Suggestions
            </h2>
            <ul className="muted list-disc list-inside text-[#9aa0a6] text-sm mt-1 space-y-1">
              {data.remixSuggestions.map((sugg) => <li key={sugg}>{sugg}</li>)}
            </ul>
          </section>
        </main>
      </div>

      {lightboxImage && (
        <Lightbox
          src={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}

      <footer className="my-10 text-center text-sm text-[#9aa0a6] no-print">
        © {new Date().getFullYear()} {data.mainTitle} • Relic Series
      </footer>
    </div>
  );
};
