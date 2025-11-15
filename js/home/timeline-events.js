/**
 * Timeline Events - 30 Days of Chemistry History
 * ✅ FIXED: Only saves Wikipedia URL & summary, not full text
 * ✅ Covers November 16 - December 15, 2025
 * ✅ Year corrected to 2025!
 */

const timelineEvents = {
  // November 16
  "11-16": {
    title: "Discovery of Radium",
    year: 1898,
    scientist: "Marie Curie & Pierre Curie",
    wikiTitle: "Radium",
    category: "Discovery",
    importance: "high",
    relatedElements: ["Ra", "Po"],
    relatedMolecules: [],
    description: "Marie and Pierre Curie announced the discovery of radium, a highly radioactive element that glows in the dark.",
    icon: "⚛️",
    color: "#ff6b6b",
    graphs: {
      type: "discovery_timeline",
      data: {
        events: [
          { year: 1898, event: "Radium discovered" },
          { year: 1910, event: "Pure radium isolated" },
          { year: 1934, event: "Artificial radioactivity" }
        ]
      }
    },
    funFact: "Radium glows in the dark and was once used in watch dials before its dangers were known!"
  },

  // November 17
  "11-17": {
    title: "Kekulé's Dream of Benzene",
    year: 1865,
    scientist: "Friedrich August Kekulé",
    wikiTitle: "Benzene",
    category: "Theory",
    importance: "high",
    relatedElements: ["C", "H"],
    relatedMolecules: ["benzene"],
    description: "Kekulé proposed the revolutionary ring structure of benzene after dreaming of a snake biting its tail.",
    icon: "💍",
    color: "#4ecdc4",
    graphs: {
      type: "molecular_structure",
      data: {
        formula: "C6H6",
        bondAngles: [120, 120, 120]
      }
    },
    funFact: "The Ouroboros (snake eating its tail) in Kekulé's dream led to one of chemistry's greatest breakthroughs!"
  },

  // November 18
  "11-18": {
    title: "Discovery of Deuterium",
    year: 1931,
    scientist: "Harold Urey",
    wikiTitle: "Deuterium",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["H"],
    relatedMolecules: ["water"],
    description: "Harold Urey discovered deuterium (heavy hydrogen), which later earned him the 1934 Nobel Prize in Chemistry.",
    icon: "💧",
    color: "#58a6ff",
    graphs: {
      type: "isotope_comparison",
      data: {
        isotopes: ["¹H", "²H (D)", "³H (T)"],
        masses: [1.008, 2.014, 3.016]
      }
    },
    funFact: "Heavy water (D₂O) was crucial in World War II nuclear research!"
  },

  // November 19
  "11-19": {
    title: "Haber Process Perfected",
    year: 1909,
    scientist: "Fritz Haber",
    wikiTitle: "Haber_process",
    category: "Process",
    importance: "high",
    relatedElements: ["N", "H"],
    relatedMolecules: ["ammonia"],
    description: "Fritz Haber perfected the synthesis of ammonia from nitrogen and hydrogen, revolutionizing agriculture.",
    icon: "🏭",
    color: "#7ce38b",
    graphs: {
      type: "reaction_conditions",
      data: {
        labels: ["Temp (°C)", "Pressure (atm)"],
        values: [450, 200]
      }
    },
    funFact: "The Haber process feeds 1/3 of the world's population through fertilizers!"
  },

  // November 20
  "11-20": {
    title: "Discovery of Oxygen",
    year: 1774,
    scientist: "Joseph Priestley",
    wikiTitle: "Oxygen",
    category: "Discovery",
    importance: "high",
    relatedElements: ["O"],
    relatedMolecules: ["oxygen", "water"],
    description: "Joseph Priestley discovered oxygen by heating mercuric oxide, calling it 'dephlogisticated air'.",
    icon: "🫁",
    color: "#ffa657",
    graphs: {
      type: "atmosphere_composition",
      data: {
        gases: ["N₂", "O₂", "Ar", "CO₂"],
        percentages: [78, 21, 0.9, 0.04]
      }
    },
    funFact: "Oxygen makes up 21% of Earth's atmosphere and 65% of human body mass!"
  },

  // November 21
  "11-21": {
    title: "Helium Isolated on Earth",
    year: 1895,
    scientist: "William Ramsay",
    wikiTitle: "Helium",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["He"],
    relatedMolecules: [],
    description: "William Ramsay isolated helium from uranium ore, confirming its existence on Earth after being found in the Sun.",
    icon: "🎈",
    color: "#bc8cff",
    graphs: {
      type: "noble_gases",
      data: {
        elements: ["He", "Ne", "Ar", "Kr", "Xe"],
        abundance: [5.2, 18.2, 9340, 1.1, 0.09]
      }
    },
    funFact: "Helium was discovered on the Sun 27 years before being found on Earth!"
  },

  // November 22
  "11-22": {
    title: "Discovery of Polonium",
    year: 1898,
    scientist: "Marie Curie",
    wikiTitle: "Polonium",
    category: "Discovery",
    importance: "high",
    relatedElements: ["Po", "Ra"],
    relatedMolecules: [],
    description: "Marie Curie discovered polonium and named it after her homeland Poland (Latin: Polonia).",
    icon: "☢️",
    color: "#f2cc60",
    graphs: {
      type: "radioactive_decay",
      data: {
        element: "Po-210",
        halfLife: 138.376,
        unit: "days"
      }
    },
    funFact: "Polonium-210 is 250,000 times more toxic than hydrogen cyanide!"
  },

  // November 23
  "11-23": {
    title: "Discovery of Chlorine",
    year: 1774,
    scientist: "Carl Wilhelm Scheele",
    wikiTitle: "Chlorine",
    category: "Discovery",
    importance: "high",
    relatedElements: ["Cl"],
    relatedMolecules: [],
    description: "Carl Wilhelm Scheele discovered chlorine by reacting hydrochloric acid with manganese dioxide.",
    icon: "☁️",
    color: "#9acd32",
    graphs: {
      type: "halogen_properties",
      data: {
        halogens: ["F", "Cl", "Br", "I"],
        electroneg: [3.98, 3.16, 2.96, 2.66]
      }
    },
    funFact: "Chlorine's name comes from Greek 'chloros' meaning greenish-yellow!"
  },

  // November 24
  "11-24": {
    title: "Origin of Species Published",
    year: 1859,
    scientist: "Charles Darwin",
    wikiTitle: "On_the_Origin_of_Species",
    category: "Biology",
    importance: "medium",
    relatedElements: ["C", "H", "O", "N"],
    relatedMolecules: [],
    description: "Darwin's 'Origin of Species' revolutionized understanding of biological chemistry and evolution.",
    icon: "🧬",
    color: "#8b7355",
    graphs: {
      type: "timeline",
      data: {
        events: [
          { year: 1859, event: "Origin published" },
          { year: 1953, event: "DNA discovered" },
          { year: 2003, event: "Genome sequenced" }
        ]
      }
    },
    funFact: "All 1,250 copies of the first edition sold out on the first day!"
  },

  // November 25
  "11-25": {
    title: "Discovery of Element 118",
    year: 2002,
    scientist: "Joint Institute for Nuclear Research",
    wikiTitle: "Oganesson",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["Og"],
    relatedMolecules: [],
    description: "Element 118 (Oganesson) was synthesized by bombarding californium with calcium ions.",
    icon: "🔬",
    color: "#a020f0",
    graphs: {
      type: "superheavy_elements",
      data: {
        elements: ["Fl-114", "Mc-115", "Lv-116", "Ts-117", "Og-118"],
        years: [1999, 2003, 2000, 2010, 2002]
      }
    },
    funFact: "Oganesson has only been created a few atoms at a time and exists for milliseconds!"
  },

  // November 26
  "11-26": {
    title: "Synthesis of Vitamin B12",
    year: 1972,
    scientist: "Robert Woodward & Albert Eschenmoser",
    wikiTitle: "Vitamin_B12",
    category: "Synthesis",
    importance: "high",
    relatedElements: ["C", "H", "O", "N", "Co"],
    relatedMolecules: [],
    description: "The total synthesis of Vitamin B12 was completed after 11 years, a milestone in organic chemistry.",
    icon: "💊",
    color: "#ff1493",
    graphs: {
      type: "synthesis_steps",
      data: {
        steps: ["1961", "1965", "1969", "1972"],
        progress: [25, 50, 75, 100]
      }
    },
    funFact: "The synthesis required over 100 steps and is considered one of chemistry's greatest achievements!"
  },

  // November 27
  "11-27": {
    title: "Nobel Prize Announcement",
    year: 1895,
    scientist: "Alfred Nobel",
    wikiTitle: "Alfred_Nobel",
    category: "History",
    importance: "medium",
    relatedElements: [],
    relatedMolecules: [],
    description: "Alfred Nobel signed his will establishing the Nobel Prizes, including the Chemistry Prize.",
    icon: "🏆",
    color: "#ffd700",
    graphs: {
      type: "nobel_prizes",
      data: {
        categories: ["Physics", "Chemistry", "Medicine"],
        count: [220, 192, 229]
      }
    },
    funFact: "Nobel invented dynamite and held 355 patents in his lifetime!"
  },

  // November 28
  "11-28": {
    title: "Discovery of Fluorine",
    year: 1886,
    scientist: "Henri Moissan",
    wikiTitle: "Fluorine",
    category: "Discovery",
    importance: "high",
    relatedElements: ["F"],
    relatedMolecules: [],
    description: "Henri Moissan isolated fluorine gas through electrolysis, winning the 1906 Nobel Prize.",
    icon: "⚡",
    color: "#90ee90",
    graphs: {
      type: "reactivity_series",
      data: {
        elements: ["F", "Cl", "Br", "I"],
        reactivity: [100, 75, 50, 25]
      }
    },
    funFact: "Fluorine is the most reactive element and can make water burn!"
  },

  // November 29
  "11-29": {
    title: "Discovery of Graphene",
    year: 2004,
    scientist: "Andre Geim & Konstantin Novoselov",
    wikiTitle: "Graphene",
    category: "Discovery",
    importance: "high",
    relatedElements: ["C"],
    relatedMolecules: [],
    description: "Graphene was isolated using scotch tape, leading to a 2010 Nobel Prize.",
    icon: "📊",
    color: "#2f4f4f",
    graphs: {
      type: "carbon_allotropes",
      data: {
        forms: ["Diamond", "Graphite", "Graphene", "Fullerene"],
        strength: [100, 30, 200, 40]
      }
    },
    funFact: "Graphene is 200 times stronger than steel but only one atom thick!"
  },

  // November 30
  "11-30": {
    title: "Discovery of Neon",
    year: 1898,
    scientist: "William Ramsay & Morris Travers",
    wikiTitle: "Neon",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["Ne"],
    relatedMolecules: [],
    description: "Neon was discovered by fractional distillation of liquid air.",
    icon: "🌈",
    color: "#ff6347",
    graphs: {
      type: "noble_gas_discovery",
      data: {
        gases: ["He", "Ne", "Ar", "Kr", "Xe"],
        years: [1895, 1898, 1894, 1898, 1898]
      }
    },
    funFact: "Neon lights were first demonstrated in Paris in 1910, creating the iconic glow!"
  },

  // December 1
  "12-01": {
    title: "Discovery of Protactinium",
    year: 1913,
    scientist: "Kasimir Fajans & Otto Göhring",
    wikiTitle: "Protactinium",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Pa"],
    relatedMolecules: [],
    description: "Protactinium was discovered in uranium ore, named for being the 'parent' of actinium.",
    icon: "☢️",
    color: "#c71585",
    graphs: {
      type: "actinide_series",
      data: {
        elements: ["Th", "Pa", "U", "Np", "Pu"],
        numbers: [90, 91, 92, 93, 94]
      }
    },
    funFact: "Protactinium is one of the rarest naturally occurring elements on Earth!"
  },

  // December 2
  "12-02": {
    title: "First Controlled Nuclear Reaction",
    year: 1942,
    scientist: "Enrico Fermi",
    wikiTitle: "Chicago_Pile-1",
    category: "Nuclear",
    importance: "high",
    relatedElements: ["U"],
    relatedMolecules: [],
    description: "Enrico Fermi achieved the first controlled nuclear chain reaction under a Chicago stadium.",
    icon: "⚛️",
    color: "#ff4500",
    graphs: {
      type: "nuclear_timeline",
      data: {
        events: [
          { year: 1942, event: "First reactor" },
          { year: 1945, event: "First bomb" },
          { year: 1954, event: "First power plant" }
        ]
      }
    },
    funFact: "The reactor was built in secret under a football stadium during World War II!"
  },

  // December 3
  "12-03": {
    title: "Discovery of Cadmium",
    year: 1817,
    scientist: "Friedrich Stromeyer",
    wikiTitle: "Cadmium",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Cd"],
    relatedMolecules: [],
    description: "Cadmium was discovered as an impurity in zinc carbonate (calamine).",
    icon: "🔵",
    color: "#4169e1",
    graphs: {
      type: "metal_properties",
      data: {
        metals: ["Zn", "Cd", "Hg"],
        meltingPoints: [420, 321, -39]
      }
    },
    funFact: "Cadmium yellow was Vincent van Gogh's favorite painting pigment!"
  },

  // December 4
  "12-04": {
    title: "Discovery of Rutherfordium",
    year: 1969,
    scientist: "Albert Ghiorso",
    wikiTitle: "Rutherfordium",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Rf"],
    relatedMolecules: [],
    description: "Element 104 was synthesized and named after Ernest Rutherford.",
    icon: "⚛️",
    color: "#da70d6",
    graphs: {
      type: "transactinides",
      data: {
        elements: ["Rf-104", "Db-105", "Sg-106"],
        halfLife: [13, 1.6, 0.9]
      }
    },
    funFact: "Rutherfordium atoms last only seconds before decaying!"
  },

  // December 5
  "12-05": {
    title: "Discovery of Artificial Radioactivity",
    year: 1934,
    scientist: "Irène Joliot-Curie & Frédéric Joliot",
    wikiTitle: "Induced_radioactivity",
    category: "Discovery",
    importance: "high",
    relatedElements: [],
    relatedMolecules: [],
    description: "The Joliot-Curies discovered that stable elements can be made radioactive, winning the 1935 Nobel Prize.",
    icon: "☢️",
    color: "#ff69b4",
    graphs: {
      type: "radioactivity_types",
      data: {
        types: ["Natural", "Artificial"],
        discovered: [1896, 1934]
      }
    },
    funFact: "Irène was Marie Curie's daughter, making them the only mother-daughter Nobel laureates!"
  },

  // December 6
  "12-06": {
    title: "Discovery of Hafnium",
    year: 1923,
    scientist: "Dirk Coster & George de Hevesy",
    wikiTitle: "Hafnium",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Hf"],
    relatedMolecules: [],
    description: "Hafnium was discovered in zirconium ores in Copenhagen (Latin: Hafnia).",
    icon: "🔬",
    color: "#4682b4",
    graphs: {
      type: "transition_metals",
      data: {
        metals: ["Zr", "Hf", "Ti"],
        density: [6.51, 13.31, 4.51]
      }
    },
    funFact: "Hafnium was the last stable element to be discovered!"
  },

  // December 7
  "12-07": {
    title: "Discovery of Argon",
    year: 1894,
    scientist: "Lord Rayleigh & William Ramsay",
    wikiTitle: "Argon",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["Ar"],
    relatedMolecules: [],
    description: "Argon was discovered by comparing the density of nitrogen from air and from chemical reactions.",
    icon: "💨",
    color: "#87ceeb",
    graphs: {
      type: "atmospheric_gases",
      data: {
        gases: ["N₂", "O₂", "Ar", "CO₂"],
        percentages: [78.08, 20.95, 0.93, 0.04]
      }
    },
    funFact: "Argon's name means 'lazy' in Greek because it's so unreactive!"
  },

  // December 8
  "12-08": {
    title: "Discovery of X-rays",
    year: 1895,
    scientist: "Wilhelm Conrad Röntgen",
    wikiTitle: "X-ray",
    category: "Physics",
    importance: "high",
    relatedElements: [],
    relatedMolecules: [],
    description: "Röntgen discovered X-rays accidentally while experimenting with cathode rays, winning the first Nobel Prize in Physics.",
    icon: "🩻",
    color: "#00ced1",
    graphs: {
      type: "em_spectrum",
      data: {
        types: ["Radio", "Micro", "IR", "Visible", "UV", "X-ray"],
        wavelength: [1e3, 1e-2, 1e-5, 5e-7, 1e-7, 1e-9]
      }
    },
    funFact: "The first X-ray image was of Röntgen's wife's hand, showing her wedding ring!"
  },

  // December 9
  "12-09": {
    title: "Discovery of Technetium",
    year: 1937,
    scientist: "Emilio Segrè & Carlo Perrier",
    wikiTitle: "Technetium",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["Tc"],
    relatedMolecules: [],
    description: "Technetium was the first artificially produced element, filling a gap in the periodic table.",
    icon: "⚗️",
    color: "#9370db",
    graphs: {
      type: "artificial_elements",
      data: {
        elements: ["Tc-43", "Pm-61", "Np-93"],
        years: [1937, 1945, 1940]
      }
    },
    funFact: "Technetium's name means 'artificial' in Greek!"
  },

  // December 10
  "12-10": {
    title: "Nobel Prize Ceremony Day",
    year: 1901,
    scientist: "Various Nobel Laureates",
    wikiTitle: "Nobel_Prize",
    category: "History",
    importance: "high",
    relatedElements: [],
    relatedMolecules: [],
    description: "The first Nobel Prizes were awarded on the anniversary of Alfred Nobel's death.",
    icon: "🏅",
    color: "#ffd700",
    graphs: {
      type: "chemistry_nobel",
      data: {
        decades: ["1901-10", "2011-20"],
        prizes: [10, 11]
      }
    },
    funFact: "Marie Curie won Nobel Prizes in both Physics (1903) and Chemistry (1911)!"
  },

  // December 11
  "12-11": {
    title: "Discovery of Krypton",
    year: 1898,
    scientist: "William Ramsay & Morris Travers",
    wikiTitle: "Krypton",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Kr"],
    relatedMolecules: [],
    description: "Krypton was discovered through fractional distillation of liquid air.",
    icon: "💎",
    color: "#48d1cc",
    graphs: {
      type: "noble_gas_uses",
      data: {
        gases: ["He", "Ne", "Ar", "Kr", "Xe"],
        uses: ["Balloons", "Signs", "Welding", "Lasers", "Anesthesia"]
      }
    },
    funFact: "Krypton's name means 'hidden' in Greek, and it's used in high-speed photography!"
  },

  // December 12
  "12-12": {
    title: "Discovery of Xenon",
    year: 1898,
    scientist: "William Ramsay & Morris Travers",
    wikiTitle: "Xenon",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Xe"],
    relatedMolecules: [],
    description: "Xenon was discovered as the heaviest stable noble gas in liquid air residues.",
    icon: "💫",
    color: "#6a5acd",
    graphs: {
      type: "noble_gas_density",
      data: {
        gases: ["He", "Ne", "Ar", "Kr", "Xe"],
        density: [0.18, 0.90, 1.78, 3.75, 5.89]
      }
    },
    funFact: "Xenon compounds were thought impossible until 1962!"
  },

  // December 13
  "12-13": {
    title: "Discovery of Ytterbium",
    year: 1878,
    scientist: "Jean Charles Galissard de Marignac",
    wikiTitle: "Ytterbium",
    category: "Discovery",
    importance: "low",
    relatedElements: ["Yb"],
    relatedMolecules: [],
    description: "Ytterbium was discovered in the mineral gadolinite from Ytterby, Sweden.",
    icon: "🪨",
    color: "#b0c4de",
    graphs: {
      type: "rare_earths",
      data: {
        elements: ["Y", "Er", "Yb", "Tb"],
        abundance: [33, 3.5, 3.2, 1.2]
      }
    },
    funFact: "Four elements are named after the tiny Swedish village of Ytterby!"
  },

  // December 14
  "12-14": {
    title: "Discovery of Americium",
    year: 1944,
    scientist: "Glenn Seaborg, Ralph James & Leon Morgan",
    wikiTitle: "Americium",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["Am"],
    relatedMolecules: [],
    description: "Americium was synthesized during the Manhattan Project and named after the Americas.",
    icon: "🔬",
    color: "#ff1493",
    graphs: {
      type: "transuranics",
      data: {
        elements: ["Np", "Pu", "Am", "Cm"],
        numbers: [93, 94, 95, 96]
      }
    },
    funFact: "Americium-241 is used in smoke detectors in millions of homes!"
  },

  // December 15
  "12-15": {
    title: "Discovery of Zinc",
    year: 1746,
    scientist: "Andreas Sigismund Marggraf",
    wikiTitle: "Zinc",
    category: "Discovery",
    importance: "medium",
    relatedElements: ["Zn"],
    relatedMolecules: [],
    description: "Marggraf isolated pure metallic zinc by heating calamine and carbon.",
    icon: "🔩",
    color: "#708090",
    graphs: {
      type: "metal_production",
      data: {
        metals: ["Fe", "Al", "Cu", "Zn"],
        production: [1800, 64, 24, 13]
      }
    },
    funFact: "Zinc is essential for human immune function and wound healing!"
  }
};

/**
 * Get event for a specific date
 */
function getEventForDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;
  return timelineEvents[key] || null;
}

/**
 * Get today's event
 */
function getTodaysEvent() {
  return getEventForDate(new Date());
}

/**
 * Format date for display (e.g., "November 16")
 */
function formatEventDate(date) {
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format full date with year (e.g., "November 16, 1898")
 */
function formatFullEventDate(date, year) {
  const options = { month: 'long', day: 'numeric' };
  const dateStr = date.toLocaleDateString('en-US', options);
  return `${dateStr}, ${year}`;
}

// Export
window.timelineEvents = timelineEvents;
window.getEventForDate = getEventForDate;
window.getTodaysEvent = getTodaysEvent;
window.formatEventDate = formatEventDate;
window.formatFullEventDate = formatFullEventDate;

console.log('✅ Timeline Events loaded (30 days: Nov 16 - Dec 15)');
