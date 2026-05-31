const fs = require('fs');
const path = require('path');

const PAPERS_SOURCE = process.env.EAPCET_PAPERS_PATH
  || path.resolve(__dirname, '../../../../eapcet papers');
const PAPERS_DEST = path.resolve(__dirname, '../../../frontend/public/papers');

function parsePaperMeta(relativePath, fileName) {
  const parts = relativePath.split(path.sep).filter(Boolean);
  const state = parts[0]?.toUpperCase() === 'TS' ? 'TS' : 'AP';
  const year = parseInt(parts[1], 10) || 2020;
  const base = fileName.replace(/\.pdf$/i, '');

  let title = base.replace(/_/g, ' ');
  let shift = null;

  if (base.startsWith('QP_')) {
    const match = base.match(/QP_(\d+Sep)_(\d+)_Shift_(\d)/i);
    if (match) {
      title = `EAPCET BiPC ${match[1]} ${match[2]} — Shift ${match[3]}`;
      shift = `Shift ${match[3]}`;
    }
  } else if (base.startsWith('QPK_S')) {
    const s = base.replace('QPK_S', '');
    title = `EAPCET BiPC Key Paper — Shift ${s}`;
    shift = `Shift ${s}`;
  } else if (base.includes('Agriculture and Medical')) {
    const match = base.match(/(\d+(?:st|nd|rd|th)? \w+ \d+)/i);
    title = `TS EAPCET Agriculture & Medical ${match?.[1] || ''}`.trim();
    const shiftMatch = base.match(/Shift (\d)/i);
    if (shiftMatch) shift = `Shift ${shiftMatch[1]}`;
  } else if (base.includes('July')) {
    title = `TS EAPCET ${base.replace(/([A-Z]+)/g, ' $1').trim()}`;
  } else if (base === 'MED_COVID_Q') {
    title = 'AP EAPCET Medical COVID Special Question Paper';
  }

  return {
    state,
    year,
    title,
    shift,
    subject: 'BiPC',
    examType: 'EAPCET',
    fileUrl: `/papers/${relativePath.replace(/\\/g, '/')}`,
    sortOrder: year * 10 + (shift ? parseInt(shift.replace(/\D/g, ''), 10) || 0 : 0),
  };
}

function copyPapersAndBuildSeed() {
  if (!fs.existsSync(PAPERS_SOURCE)) {
    console.warn('EAPCET papers source folder not found:', PAPERS_SOURCE);
    return [];
  }

  const papers = [];

  function walk(dir, rel = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), relPath);
      } else if (entry.name.toLowerCase().endsWith('.pdf')) {
        const destPath = path.join(PAPERS_DEST, relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(path.join(dir, entry.name), destPath);
        papers.push(parsePaperMeta(relPath, entry.name));
      }
    }
  }

  fs.mkdirSync(PAPERS_DEST, { recursive: true });
  walk(PAPERS_SOURCE);
  console.log(`Copied ${papers.length} EAPCET papers to public/papers`);
  return papers;
}

module.exports = { copyPapersAndBuildSeed };
