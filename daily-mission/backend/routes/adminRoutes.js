const express = require('express');
const {
  getDashboardStats,
  getAdminStats,
  getUsers,
  createAdminNote,
  createAdminPaper,
  createMcq,
  createAnnouncement,
  getAnnouncements,
  deleteUser,
  deleteNote,
  deletePaper,
  createMockTest,
  createFormula,
  createDiagram,
  createHandbook,
  purgeData,
  deleteMockTest,
  deleteFormula,
  deleteDiagram,
  deleteHandbook,
} = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/announcements', getAnnouncements);

router.use(authMiddleware, isAdmin);

router.delete('/purge', purgeData);

router.get('/dashboard-stats', getDashboardStats);
router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.post('/notes', createAdminNote);
router.post('/papers', createAdminPaper);
router.post('/mcqs', createMcq);
router.post('/announcements', createAnnouncement);
router.post('/mock-tests', createMockTest);
router.post('/formulas', createFormula);
router.post('/diagrams', createDiagram);
router.post('/handbooks', createHandbook);

router.delete('/users/:id', deleteUser);
router.delete('/notes/:id', deleteNote);
router.delete('/papers/:id', deletePaper);
router.delete('/mocktests/:id', deleteMockTest);
router.delete('/formulas/:id', deleteFormula);
router.delete('/diagrams/:id', deleteDiagram);
router.delete('/handbooks/:id', deleteHandbook);

module.exports = router;
