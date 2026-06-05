import { Op } from 'sequelize';
import Hospital from '../models/Hospital';
import City from '../models/City';
import type { Result } from '../types/result';
import { Ok, Err } from '../types/result';

const normalize = (value: unknown) => String(value || '').trim().toLowerCase();

export interface HospitalFilter {
  city?: string;
  type?: string;
  specialization?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function getAllHospitals(filter: HospitalFilter): Promise<Result<{
  data: Hospital[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>> {
  const where: Record<string, unknown> = {};

  if (filter.city) {
    const cities = await City.findAll({
      where: { cityName: { [Op.iLike]: filter.city } },
    });
    if (cities.length > 0) {
      where.cityId = { [Op.in]: cities.map(c => c.id) };
    } else {
      return Ok({ data: [], pagination: { page: filter.page, limit: filter.limit, total: 0, totalPages: 0 } });
    }
  }

  if (filter.type) {
    const typeValue = normalize(filter.type).replace('.', '');
    if (typeValue === 'government') {
      where.type = 'Gov';
    } else if (typeValue === 'private') {
      where.type = 'Private';
    } else {
      where.type = typeValue.charAt(0).toUpperCase() + typeValue.slice(1);
    }
  }

  if (filter.specialization) {
    const spec = normalize(filter.specialization);
    where.specialization = { [Op.iLike]: `%${spec}%` };
  }

  if (filter.search) {
    const search = normalize(filter.search);
    where[Op.or as any] = [
      { hospitalName: { [Op.iLike]: `%${search}%` } },
      { specialization: { [Op.iLike]: `%${search}%` } },
      { address: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (filter.page - 1) * filter.limit;

  const { count, rows } = await Hospital.findAndCountAll({
    where,
    include: [{ model: City, as: 'city' }],
    order: [['rating', 'DESC']],
    limit: filter.limit,
    offset,
  });

  return Ok({
    data: rows,
    pagination: {
      page: filter.page,
      limit: filter.limit,
      total: count,
      totalPages: Math.ceil(count / filter.limit),
    },
  });
}

export async function getHospitalCities(): Promise<Result<Array<{ id: number; cityName: string; country: string }>>> {
  const cities = await City.findAll({
    include: [{ model: Hospital, as: 'hospitals', attributes: [] }],
    where: { '$hospitals.id$': { [Op.ne]: null } },
    order: [['cityName', 'ASC']],
  });

  return Ok(
    cities.map(c => ({ id: c.id, cityName: c.cityName, country: c.country })),
  );
}

export async function getHospitalById(id: number): Promise<Result<Hospital>> {
  const hospital = await Hospital.findByPk(id, {
    include: [{ model: City, as: 'city' }],
  });

  if (!hospital) {
    return Err('Hospital not found');
  }

  return Ok(hospital);
}
