import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as hospitalService from '../services/hospitalService';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

  const result = await hospitalService.getAllHospitals({
    city: req.query.city as string,
    type: req.query.type as string,
    specialization: req.query.specialization as string,
    search: req.query.search as string,
    page,
    limit,
  });

  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Hospitals retrieved',
    data: result.data.data,
    pagination: result.data.pagination,
  });
});

export const getCities = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const result = await hospitalService.getHospitalCities();

  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Cities retrieved',
    data: result.data,
  });
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Invalid hospital ID',
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const result = await hospitalService.getHospitalById(req.params.id as unknown as number);

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Hospital retrieved', data: result.data });
});
