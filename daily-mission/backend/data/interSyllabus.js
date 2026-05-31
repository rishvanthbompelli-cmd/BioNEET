const WEIGHTAGE_SCORE = { LOW: 2, MEDIUM: 5, HIGH: 8, VERY_HIGH: 10 };

function ch(year, subject, name, weightage, difficulty, linked = [], flags = {}) {
  return {
    year,
    subject,
    name,
    weightageLevel: weightage,
    weightage: WEIGHTAGE_SCORE[weightage] || 5,
    difficulty: difficulty.toUpperCase(),
    linkedChapters: linked.length ? JSON.stringify(linked) : null,
    isHighPriority: !!flags.highPriority,
    isRankBooster: !!flags.rankBooster,
    isMostDifficult: !!flags.mostDifficult,
  };
}

const INTER_1 = [
  // BOTANY
  ch('INTER_1', 'Botany', 'Living World', 'LOW', 'Easy', ['Biological Classification']),
  ch('INTER_1', 'Botany', 'Biological Classification', 'MEDIUM', 'Medium', ['Plant Kingdom']),
  ch('INTER_1', 'Botany', 'Plant Kingdom', 'HIGH', 'Hard', ['Morphology of Flowering Plants']),
  ch('INTER_1', 'Botany', 'Morphology of Flowering Plants', 'HIGH', 'Medium', ['Anatomy of Flowering Plants']),
  ch('INTER_1', 'Botany', 'Anatomy of Flowering Plants', 'HIGH', 'Hard', ['Transport in Plants'], { highPriority: true }),
  ch('INTER_1', 'Botany', 'Cell: Structure & Function', 'VERY_HIGH', 'Hard', ['Biomolecules', 'Cell Cycle & Division'], { highPriority: true }),
  ch('INTER_1', 'Botany', 'Biomolecules', 'HIGH', 'Medium', ['Cell: Structure & Function'], { rankBooster: true }),
  ch('INTER_1', 'Botany', 'Cell Cycle & Division', 'VERY_HIGH', 'Hard', ['Principles of Inheritance']),
  ch('INTER_1', 'Botany', 'Transport in Plants', 'HIGH', 'Hard', ['Mineral Nutrition']),
  ch('INTER_1', 'Botany', 'Mineral Nutrition', 'MEDIUM', 'Medium', ['Photosynthesis']),
  ch('INTER_1', 'Botany', 'Photosynthesis', 'VERY_HIGH', 'Hard', ['Respiration in Plants'], { highPriority: true, rankBooster: true, mostDifficult: true }),
  ch('INTER_1', 'Botany', 'Respiration in Plants', 'VERY_HIGH', 'Hard', ['Plant Growth & Development'], { highPriority: true }),
  ch('INTER_1', 'Botany', 'Plant Growth & Development', 'VERY_HIGH', 'Hard', ['Chemical Coordination'], { highPriority: true }),

  // ZOOLOGY
  ch('INTER_1', 'Zoology', 'Animal Kingdom', 'VERY_HIGH', 'Hard', ['Structural Organisation in Animals'], { highPriority: true }),
  ch('INTER_1', 'Zoology', 'Structural Organisation in Animals', 'MEDIUM', 'Medium', ['Digestion & Absorption']),
  ch('INTER_1', 'Zoology', 'Digestion & Absorption', 'HIGH', 'Medium', ['Breathing & Exchange of Gases']),
  ch('INTER_1', 'Zoology', 'Breathing & Exchange of Gases', 'HIGH', 'Medium', ['Body Fluids & Circulation']),
  ch('INTER_1', 'Zoology', 'Body Fluids & Circulation', 'VERY_HIGH', 'Hard', ['Excretory Products & their Elimination'], { highPriority: true, rankBooster: true }),
  ch('INTER_1', 'Zoology', 'Excretory Products & their Elimination', 'HIGH', 'Medium', ['Locomotion & Movement']),
  ch('INTER_1', 'Zoology', 'Locomotion & Movement', 'MEDIUM', 'Easy', ['Neural Control & Coordination']),
  ch('INTER_1', 'Zoology', 'Neural Control & Coordination', 'VERY_HIGH', 'Hard', ['Chemical Coordination & Integration'], { highPriority: true, mostDifficult: true }),
  ch('INTER_1', 'Zoology', 'Chemical Coordination & Integration', 'VERY_HIGH', 'Hard', ['Human Reproduction'], { highPriority: true, mostDifficult: true }),

  // PHYSICS
  ch('INTER_1', 'Physics', 'Units & Measurements', 'LOW', 'Easy'),
  ch('INTER_1', 'Physics', 'Motion in a Straight Line', 'MEDIUM', 'Easy'),
  ch('INTER_1', 'Physics', 'Motion in a Plane', 'MEDIUM', 'Medium'),
  ch('INTER_1', 'Physics', 'Laws of Motion', 'HIGH', 'Medium'),
  ch('INTER_1', 'Physics', 'Work, Power & Energy', 'HIGH', 'Medium'),
  ch('INTER_1', 'Physics', 'Rotational Motion', 'VERY_HIGH', 'Hard', [], { mostDifficult: true }),
  ch('INTER_1', 'Physics', 'Gravitation', 'MEDIUM', 'Medium'),
  ch('INTER_1', 'Physics', 'Mechanical Properties of Fluids', 'HIGH', 'Hard'),
  ch('INTER_1', 'Physics', 'Thermodynamics', 'VERY_HIGH', 'Hard', [], { mostDifficult: true, rankBooster: true }),
  ch('INTER_1', 'Physics', 'Kinetic Theory of Gases', 'MEDIUM', 'Easy'),
  ch('INTER_1', 'Physics', 'Oscillations (SHM)', 'HIGH', 'Hard', [], { mostDifficult: true }),
  ch('INTER_1', 'Physics', 'Waves', 'HIGH', 'Hard', [], { mostDifficult: true }),

  // CHEMISTRY
  ch('INTER_1', 'Chemistry', 'Some Basic Concepts of Chemistry (Mole Concept)', 'HIGH', 'Medium'),
  ch('INTER_1', 'Chemistry', 'Structure of Atom', 'MEDIUM', 'Medium'),
  ch('INTER_1', 'Chemistry', 'Classification of Elements (Periodic Table)', 'HIGH', 'Easy'),
  ch('INTER_1', 'Chemistry', 'Chemical Bonding & Molecular Structure', 'VERY_HIGH', 'Hard', [], { mostDifficult: true }),
  ch('INTER_1', 'Chemistry', 'States of Matter', 'MEDIUM', 'Medium'),
  ch('INTER_1', 'Chemistry', 'Thermodynamics', 'HIGH', 'Hard', [], { rankBooster: true }),
  ch('INTER_1', 'Chemistry', 'Equilibrium', 'VERY_HIGH', 'Hard', [], { mostDifficult: true }),
  ch('INTER_1', 'Chemistry', 'Redox Reactions', 'MEDIUM', 'Medium'),
  ch('INTER_1', 'Chemistry', 'Hydrogen', 'LOW', 'Easy'),
  ch('INTER_1', 'Chemistry', 's-Block Elements', 'MEDIUM', 'Easy'),
  ch('INTER_1', 'Chemistry', 'Organic Chemistry: Basic Principles (GOC)', 'VERY_HIGH', 'Hard', [], { mostDifficult: true, rankBooster: true }),
];

const INTER_2 = [
  // BOTANY
  ch('INTER_2', 'Botany', 'Reproduction in Organisms', 'MEDIUM', 'Easy'),
  ch('INTER_2', 'Botany', 'Sexual Reproduction in Flowering Plants', 'VERY_HIGH', 'Hard', [], { highPriority: true, rankBooster: true }),
  ch('INTER_2', 'Botany', 'Principles of Inheritance & Variation', 'VERY_HIGH', 'Hard', [], { highPriority: true, rankBooster: true, mostDifficult: true }),
  ch('INTER_2', 'Botany', 'Molecular Basis of Inheritance', 'VERY_HIGH', 'Hard', [], { highPriority: true, mostDifficult: true }),
  ch('INTER_2', 'Botany', 'Evolution', 'HIGH', 'Medium'),
  ch('INTER_2', 'Botany', 'Biotechnology: Principles & Processes', 'VERY_HIGH', 'Medium', [], { highPriority: true, rankBooster: true }),
  ch('INTER_2', 'Botany', 'Biotechnology & its Applications', 'HIGH', 'Easy'),
  ch('INTER_2', 'Botany', 'Organisms & Populations', 'HIGH', 'Medium', [], { rankBooster: true }),
  ch('INTER_2', 'Botany', 'Ecosystem', 'HIGH', 'Easy', [], { rankBooster: true }),
  ch('INTER_2', 'Botany', 'Biodiversity & Conservation', 'HIGH', 'Easy'),
  ch('INTER_2', 'Botany', 'Environmental Issues', 'MEDIUM', 'Easy'),

  // ZOOLOGY
  ch('INTER_2', 'Zoology', 'Human Reproduction', 'VERY_HIGH', 'Medium', [], { highPriority: true, rankBooster: true }),
  ch('INTER_2', 'Zoology', 'Reproductive Health', 'HIGH', 'Easy'),
  ch('INTER_2', 'Zoology', 'Human Health & Disease', 'VERY_HIGH', 'Medium', [], { highPriority: true, rankBooster: true }),
  ch('INTER_2', 'Zoology', 'Microbes in Human Welfare', 'MEDIUM', 'Easy'),
  ch('INTER_2', 'Zoology', 'Biotechnology & its Applications', 'HIGH', 'Medium', [], { rankBooster: true }),
  ch('INTER_2', 'Zoology', 'Evolution', 'HIGH', 'Medium'),

  // PHYSICS
  ch('INTER_2', 'Physics', 'Electric Charges & Fields (Electrostatics)', 'VERY_HIGH', 'Hard', [], { mostDifficult: true, rankBooster: true }),
  ch('INTER_2', 'Physics', 'Current Electricity', 'HIGH', 'Hard'),
  ch('INTER_2', 'Physics', 'Moving Charges & Magnetism', 'HIGH', 'Hard', [], { mostDifficult: true }),
  ch('INTER_2', 'Physics', 'Electromagnetic Induction (EMI)', 'HIGH', 'Hard'),
  ch('INTER_2', 'Physics', 'Alternating Current (AC)', 'HIGH', 'Medium'),
  ch('INTER_2', 'Physics', 'Ray Optics', 'HIGH', 'Medium'),
  ch('INTER_2', 'Physics', 'Wave Optics', 'HIGH', 'Hard'),
  ch('INTER_2', 'Physics', 'Dual Nature of Radiation & Matter', 'MEDIUM', 'Easy', [], { rankBooster: true }),
  ch('INTER_2', 'Physics', 'Atoms', 'MEDIUM', 'Easy', [], { rankBooster: true }),
  ch('INTER_2', 'Physics', 'Nuclei', 'MEDIUM', 'Easy', [], { rankBooster: true }),
  ch('INTER_2', 'Physics', 'Semiconductor Electronics', 'VERY_HIGH', 'Easy', [], { rankBooster: true }),
  ch('INTER_2', 'Physics', 'Communication Systems', 'MEDIUM', 'Easy', [], { rankBooster: true }),

  // CHEMISTRY
  ch('INTER_2', 'Chemistry', 'The Solid State', 'MEDIUM', 'Easy'),
  ch('INTER_2', 'Chemistry', 'Solutions', 'VERY_HIGH', 'Medium', [], { rankBooster: true }),
  ch('INTER_2', 'Chemistry', 'Electrochemistry', 'HIGH', 'Medium'),
  ch('INTER_2', 'Chemistry', 'Chemical Kinetics', 'HIGH', 'Easy'),
  ch('INTER_2', 'Chemistry', 'Surface Chemistry', 'MEDIUM', 'Easy'),
  ch('INTER_2', 'Chemistry', 'The p-Block Elements', 'VERY_HIGH', 'Hard', [], { rankBooster: true }),
  ch('INTER_2', 'Chemistry', 'The d & f Block Elements', 'HIGH', 'Easy'),
  ch('INTER_2', 'Chemistry', 'Coordination Compounds', 'VERY_HIGH', 'Hard', [], { mostDifficult: true, rankBooster: true }),
  ch('INTER_2', 'Chemistry', 'Haloalkanes & Haloarenes', 'MEDIUM', 'Medium'),
  ch('INTER_2', 'Chemistry', 'Alcohols, Phenols & Ethers', 'HIGH', 'Medium'),
  ch('INTER_2', 'Chemistry', 'Aldehydes, Ketones & Carboxylic Acids', 'HIGH', 'Medium', [], { rankBooster: true }),
  ch('INTER_2', 'Chemistry', 'Amines', 'HIGH', 'Medium'),
  ch('INTER_2', 'Chemistry', 'Biomolecules', 'MEDIUM', 'Easy', [], { rankBooster: true }),
  ch('INTER_2', 'Chemistry', 'Polymers', 'MEDIUM', 'Easy'),
];

const ALL_CHAPTERS = [...INTER_1, ...INTER_2].map((c, i) => ({ ...c, orderIndex: i + 1 }));

const STUDY_ORDER = {
  biology: [
    'Cell: Structure & Function', 'Principles of Inheritance & Variation',
    'Molecular Basis of Inheritance', 'Body Fluids & Circulation',
    'Human Reproduction', 'Biotechnology: Principles & Processes', 'Ecosystem',
  ],
  chemistry: [
    'Chemical Bonding & Molecular Structure', 'Some Basic Concepts of Chemistry (Mole Concept)',
    'Organic Chemistry: Basic Principles (GOC)', 'Equilibrium', 'Solutions',
    'Coordination Compounds', 'The p-Block Elements',
  ],
  physics: [
    'Units & Measurements', 'Laws of Motion', 'Work, Power & Energy',
    'Thermodynamics', 'Electric Charges & Fields (Electrostatics)',
    'Current Electricity', 'Semiconductor Electronics',
  ],
};

module.exports = { INTER_1, INTER_2, ALL_CHAPTERS, WEIGHTAGE_SCORE, STUDY_ORDER };
