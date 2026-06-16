import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';
import {
  upload as uploadAnalysis,
  getHistory,
  getById,
  deleteAnalysis,
} from '../controllers/analysisController';

const router = Router();

/**
 * @openapi
 * /api/analysis/upload:
 *   post:
 *     tags: [Analysis]
 *     summary: Upload a scan image for AI analysis
 *     description: Accepts CT or X-ray images. Sends the image to the appropriate AI service and returns the analysis result with urgency level and hospital recommendations if malignant.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image, imageType]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 'Scan image file (JPG, PNG, WebP). Max 10MB.'
 *               imageType:
 *                 type: string
 *                 enum: [xray, ct]
 *                 description: 'Type of scan — xray or ct'
 *               sessionId:
 *                 type: string
 *                 description: 'Optional session identifier for grouping multiple scans'
 *     responses:
 *       201:
 *         description: Analysis complete
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/UploadResponse' }
 *       400:
 *         description: No image file or invalid image type
 *       503:
 *         description: AI service unavailable
 */
router.post('/upload', authenticate, upload.single('image'), [
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
  body('sessionId').optional().isString().trim(),
], uploadAnalysis);

/**
 * @openapi
 * /api/analysis/history:
 *   get:
 *     tags: [Analysis]
 *     summary: Get paginated analysis history
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page
 *     responses:
 *       200:
 *         description: History retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/AnalysisResult' }
 *                     pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/history',  authenticate, getHistory);

/**
 * @openapi
 * /api/analysis/{id}:
 *   get:
 *     tags: [Analysis]
 *     summary: Get a single analysis result by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Analysis result ID
 *     responses:
 *       200:
 *         description: Analysis retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/AnalysisResult' }
 *       404:
 *         description: Analysis not found
 *   delete:
 *     tags: [Analysis]
 *     summary: Delete an analysis result
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Analysis result ID
 *     responses:
 *       200:
 *         description: Analysis deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Analysis not found
 */
router.get('/:id', authenticate, param('id').isInt().toInt(), getById);
router.delete('/:id', authenticate, param('id').isInt().toInt(), deleteAnalysis);

export default router;
