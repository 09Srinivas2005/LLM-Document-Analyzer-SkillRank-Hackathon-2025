import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadHandler, classifyHandler, analyzeHandler, getDocHandler, getResultsHandler } from '../controllers/documentsController';


const router = Router();


const storage = multer.diskStorage({
destination: (_req, _file, cb) => cb(null, 'uploads/'),
filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });


router.post('/upload', upload.single('file'), uploadHandler);
router.post('/:id/classify', classifyHandler);
router.post('/:id/analyze', analyzeHandler);
router.get('/:id', getDocHandler);
router.get('/:id/results', getResultsHandler);


export default router;