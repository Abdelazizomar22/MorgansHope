import Hospital from '../models/Hospital';
import City from '../models/City';
import { cacheGet, cacheSet } from './cache';

const CACHE_KEY = 'hospitals:top_active';
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getTopActiveHospitals(limit = 3): Promise<Hospital[]> {
  const cached = cacheGet<Hospital[]>(CACHE_KEY);
  if (cached) return cached;

  const hospitals = await Hospital.findAll({
    where: { isActive: true },
    include: [{ model: City, as: 'city' }],
    limit,
    order: [['rating', 'DESC']],
  });

  cacheSet(CACHE_KEY, hospitals, CACHE_TTL_MS);
  return hospitals;
}
