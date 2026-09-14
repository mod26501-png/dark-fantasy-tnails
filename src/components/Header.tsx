import React from "react";

const Header: React.FC = () => {
  return (
    <header className="text-center py-8">
      <h1
        className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#f5a16f] to-[#b14a38]"
        style={{ filter: "drop-shadow(0 0 10px #8d1a1a)" }}
      >
        The Demon Codex
      </h1>
      <p className="text-xl text-[#9aa0a6] mt-4">
        Dark Fantasy Thumbnail Vault
      </p>
    </header>
  );
};

export default Header;
