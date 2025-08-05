const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const documentController = require('../../controllers/document.controller');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas PDFs, DOC e DOCX
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, DOC e DOCX são aceitos.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter
});

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas para currículo
router.post('/resume', documentController.saveResume);
router.get('/resume', documentController.getResume);
router.put('/resume/:id', documentController.updateResume);
router.delete('/resume/:id', documentController.deleteResume);

// Upload de currículo em PDF
router.post('/resume/upload', upload.single('resume'), documentController.uploadResumePDF);

// Melhoria de currículo com IA
router.post('/resume/improve', documentController.improveResumeWithAI);

// Geração de PDF do currículo
router.get('/resume/pdf', documentController.generateResumePDF);
router.get('/resume/:id/pdf', documentController.generateResumePDFById);

// Conversão de markdown para PDF
router.post('/convert/markdown-to-pdf', documentController.convertMarkdownToPDF);

// Extração de texto de PDF
router.post('/extract-text', upload.single('pdf'), documentController.extractTextFromPDF);

// Histórico de versões
router.get('/resume/history', documentController.getResumeHistory);

// Análise para ATS
router.post('/resume/analyze-ats', documentController.analyzeForATS);

// Rotas para outros documentos
router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/list', documentController.listDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);

// Download de documentos
router.get('/:id/download', documentController.downloadDocument);

module.exports = router;
