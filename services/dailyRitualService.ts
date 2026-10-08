import type { DailyRitual } from '../types';

export const DAILY_RITUAL_THEMES: Array<Omit<DailyRitual, 'id' | 'dateKey' | 'resetTimeEpochMs'>> = [
  {
    title: "Ritual of the Sunless Citadel",
    theme: "Sunless Citadel",
    directive: "Forge a monumental relic carved from obsidian monoliths, dedicated to an ancient black star.",
    lore: "Deep beneath the crust of the forgotten realm, the black sun casts reverse shadows upon cold granite altars. Only relics woven with eclipse iron may withstand its gaze.",
    tag: "SunlessCitadel",
    recommendedArchetype: "Obsidian Effigy",
    suggestedPrompt: "Monumental obsidian effigy of the Sunless Citadel, black stone covered in glowing violet eclipse runes, subterranean dark fantasy altar, hyperdetailed digital painting, cinematic gothic lighting, volumetric shadows",
    altarBoon: "✦ +40% Eclipse Resonance"
  },
  {
    title: "The Bone Carver's Requiem",
    theme: "Bone Carver",
    directive: "Manifest an ossuary relic carved from leviathan ivory and engraved with binding necromantic scripts.",
    lore: "In the silent catacombs of the Mortis Scriptorium, the bone carvers chant in dead tongues, inscribing every sorrowful soul into bleached leviathan ribcages.",
    tag: "BoneCarver",
    recommendedArchetype: "Ossuary Reliquary",
    suggestedPrompt: "Ancient ornate bone-carved dagger with ivory skull pommel, scrimshaw occult engravings, glowing crimson marrow runes, dark fantasy reliquary velvet cushion, gothic necromancy aesthetic, octane render",
    altarBoon: "💀 Soul-Bound Marrow Affinity"
  },
  {
    title: "Eclipse of the Blood Moon",
    theme: "Blood Moon",
    directive: "Craft an altar chalice or blade attuned to the celestial blood tide of the red moon.",
    lore: "Once every celestial revolution, the moon bleeds across the sky. Chalices filled during this alignment grant immortality at the cost of one's reflection.",
    tag: "BloodMoon",
    recommendedArchetype: "Blood Chalice",
    suggestedPrompt: "Ornate silver and ruby blood chalice reflecting a crimson lunar eclipse, dripping vital demonic essence, surrounded by dark fantasy roses and thorny vines, dramatic blood-red chiaroscuro lighting",
    altarBoon: "🩸 2x Blood Offering Potency"
  },
  {
    title: "The Obsidian Tide",
    theme: "Obsidian Tide",
    directive: "Forge an aquatic relic submerged in vitrified volcanic seas and bound with siren iron.",
    lore: "The black sea does not drown; it fossilizes. Those who reach into the obsidian surf pull forth relics of drowned leviathans singing silent frequencies.",
    tag: "ObsidianTide",
    recommendedArchetype: "Abyssal Pearl",
    suggestedPrompt: "Vitrified black volcanic glass anchor entwined with glowing bioluminescent tentacles, barnacles encrusted with black opals, deep dark fantasy underwater trench, volumetric rays",
    altarBoon: "🌊 Abyssal Depth Piercing"
  },
  {
    title: "The Weeping Iron Idol",
    theme: "Weeping Iron",
    directive: "Construct an effigy of rusted demon plate that sheds tears of molten sulfur.",
    lore: "Forged in the siege of Pandemonium, the iron idol was forged with the sorrow of fallen archons. Its tears ignite stone into smoldering magma.",
    tag: "WeepingIron",
    recommendedArchetype: "Demonic Icon",
    suggestedPrompt: "Gothic rusted iron demonic idol statue shedding tears of molten orange sulfur, spiked armor plate, heavy chains, smoldering embers, dark fantasy church ruins, high contrast grimdark",
    altarBoon: "⚡ Molten Sulfur Cleaving"
  },
  {
    title: "The Ashen Archive",
    theme: "Ashen Archive",
    directive: "Manifest a smoldering forbidden grimoire whose ash particles tell prophecies of the apocalypse.",
    lore: "The books in the Ash Archive never stop burning, yet their parchment is never consumed. Inhale the soot to perceive truths forbidden to mortals.",
    tag: "AshenArchive",
    recommendedArchetype: "Forbidden Tome",
    suggestedPrompt: "Ancient grimoire bound in scorched dragonhide with glowing embers leaking from parchment edges, smoldering ash floating in dark air, illuminated occult manuscripts, dark fantasy library",
    altarBoon: "📜 Eternal Ash Inscription"
  },
  {
    title: "Void Weaver's Loom",
    theme: "Void Weaver",
    directive: "Forge an ethereal mask or tapestry spun from threads of severed starlight.",
    lore: "At the edge of the universe sits the Weaver, spinning threads between dying galaxies. Relics spun on this loom phase between dimensions.",
    tag: "VoidWeaver",
    recommendedArchetype: "Astral Mask",
    suggestedPrompt: "Ethereal porcelain mask woven with threads of deep space void and glowing starlight filaments, cosmic rift eyes, dark fantasy astral deity, volumetric nebula haze, iridescent details",
    altarBoon: "👁️ Eldritch Void Sight"
  },
  {
    title: "The Carrion King's Scepter",
    theme: "Carrion King",
    directive: "Forge an emblem of pestilence and sovereignty crowned with black raven feathers.",
    lore: "He rules the battlefield after the kings have fallen. His crown is wrought of lead, and his touch renders gold into withered bone.",
    tag: "CarrionKing",
    recommendedArchetype: "Cursed Regalia",
    suggestedPrompt: "Tarnished lead royal scepter adorned with a black raven skull and iridescent crow plumage, encrusted with venomous emeralds, dark fantasy throne room in ruins, gloomy mist",
    altarBoon: "👑 Death Sovereign Dominion"
  },
  {
    title: "The Frostbound Crypt",
    theme: "Frostbound Crypt",
    directive: "Craft a rime-cursed blade that freezes the souls of those who behold its edge.",
    lore: "Beyond the northern wastes lies the Glacial Tomb where time itself has frozen solid. Relics retrieved from its ice never warm, even in dragon fire.",
    tag: "FrostboundCrypt",
    recommendedArchetype: "Glacial Broadsword",
    suggestedPrompt: "Crystalline rime-frosted longsword made of dark blue black ice, freezing mist pouring from jagged blade, ancient frost runes glowing pale cyan, gothic winter tundra, dark fantasy",
    altarBoon: "❄️ Absolute Zero Stasis"
  },
  {
    title: "The Clockwork Necropolis",
    theme: "Clockwork Necropolis",
    directive: "Synthesize an occult mechanism where brass cogs count down mortal heartbeats.",
    lore: "The architects of the Under-City built machines to prolong life through brass gears and sulfur oil. Every tick claims one breath from an unseen soul.",
    tag: "ClockworkNecropolis",
    recommendedArchetype: "Occult Automaton",
    suggestedPrompt: "Gothic steampunk brass skull containing exposed ticking clockwork gears and glowing vacuum tubes, copper pipes with dark ichor, dark fantasy workshop, moody cinematic lighting",
    altarBoon: "⚙️ Chrono-Mortis Precision"
  },
  {
    title: "The Serpent God's Chalice",
    theme: "Serpent God",
    directive: "Forge an ouroboros emblem or goblet holding the emerald venom of the primordial serpent.",
    lore: "Coiled around the roots of the world tree, the great wyrm sheds venom that transmutes lead into living jade.",
    tag: "SerpentGod",
    recommendedArchetype: "Ouroboros Chalice",
    suggestedPrompt: "Emerald and blackened silver goblet shaped like a serpent biting its own tail, luminous green venomous elixir inside, serpent scale patterns, dark fantasy temple altar",
    altarBoon: "🐍 Primordial Venom Ward"
  },
  {
    title: "Tears of the Bleeding Star",
    theme: "Bleeding Star",
    directive: "Manifest a comet fragment radiating crimson starlight from an elder dimension.",
    lore: "When the dead star collided with the outer sphere, its bleeding shards rained across the wastes. Priests who wore them spoke prophesies of shattered skies.",
    tag: "BleedingStar",
    recommendedArchetype: "Meteorite Amulet",
    suggestedPrompt: "Jagged cosmic meteorite amulet glowing with pulsing crimson starlight, floating weightless within dark metal gyroscope rings, dark fantasy deep space altar, hyperdetailed",
    altarBoon: "✦ Starlight Annihilation"
  }
];

export const getTodayRitualDateKey = (): string => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
};

export const getTodayRitual = (): DailyRitual => {
  const dateKey = getTodayRitualDateKey();
  
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  
  const themeIndex = hash % DAILY_RITUAL_THEMES.length;
  const theme = DAILY_RITUAL_THEMES[themeIndex];
  
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));

  return {
    ...theme,
    id: `ritual-${dateKey}`,
    dateKey,
    resetTimeEpochMs: nextMidnight.getTime(),
  };
};

export const getTimeUntilMidnight = (): { hours: number; minutes: number; seconds: number; formatted: string } => {
  const now = Date.now();
  const today = getTodayRitual();
  const diff = Math.max(0, today.resetTimeEpochMs - now);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return { hours, minutes, seconds, formatted };
};
