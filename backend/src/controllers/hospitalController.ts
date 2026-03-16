import { Response } from 'express';
import { Op } from 'sequelize';
import Hospital from '../models/Hospital';
import City from '../models/City';
import { AuthRequest } from '../middleware/auth';

// ── Get all hospitals ────────────────────────────────────────────────────────
export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.max(1, parseInt(req.query.limit as string) || 10);
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  const cityWhere: Record<string, unknown> = {};

  if (req.query.city) {
    cityWhere.cityName = { [Op.like]: `%${req.query.city}%` };
  }
  if (req.query.specialization) {
    where.specialization = { [Op.like]: `%${req.query.specialization}%` };
  }
  if (req.query.search) {
    where.hospitalName = { [Op.like]: `%${req.query.search}%` };
  }

  const { count, rows } = await Hospital.findAndCountAll({
    where,
    include: [{ model: City, as: 'city', where: Object.keys(cityWhere).length ? cityWhere : undefined }],
    order: [['rating', 'DESC']],
    limit,
    offset,
  });

  res.json({
    success: true,
    message: 'Hospitals retrieved',
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

// ── Get all cities ────────────────────────────────────────────────────────────
export async function getCities(_req: AuthRequest, res: Response): Promise<void> {
  const cities = await City.findAll({ order: [['cityName', 'ASC']] });
  res.json({ success: true, message: 'Cities retrieved', data: cities });
}

// ── Get single hospital ───────────────────────────────────────────────────────
export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const hospital = await Hospital.findOne({
    where: { id: req.params.id, isActive: true },
    include: [{ model: City, as: 'city' }],
  });

  if (!hospital) {
    res.status(404).json({ success: false, message: 'Hospital not found' });
    return;
  }

  res.json({ success: true, message: 'Hospital retrieved', data: hospital });
}
