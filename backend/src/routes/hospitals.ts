import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { getAll, getCities, getById } from '../controllers/hospitalController';

const router = Router();

/**
 * @openapi
 * /api/hospitals:
 *   get:
 *     tags: [Hospitals]
 *     summary: Get paginated list of oncology hospitals
 *     description: Filter by city, type, specialization, or free-text search. Returns hospitals sorted by rating.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Filter by city name
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [Gov, Private, Government] }
 *         description: Filter by hospital type
 *       - in: query
 *         name: specialization
 *         schema: { type: string }
 *         description: Filter by specialization keyword
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Free-text search across name, specialty, city, address, expertise
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Hospitals retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Hospital' }
 *                     pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/',        authenticate, getAll);

/**
 * @openapi
 * /api/hospitals/cities:
 *   get:
 *     tags: [Hospitals]
 *     summary: Get list of cities with hospitals
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cities retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/City' }
 */
router.get('/cities',  authenticate, getCities);

/**
 * @openapi
 * /api/hospitals/{id}:
 *   get:
 *     tags: [Hospitals]
 *     summary: Get a single hospital by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Hospital' }
 *       404:
 *         description: Hospital not found
 */
router.get('/:id', authenticate, param('id').isInt().toInt(), getById);

export default router;
