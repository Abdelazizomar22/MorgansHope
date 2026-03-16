import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import City from './City';

interface HospitalAttributes {
  id: number;
  cityId: number;
  hospitalName: string;
  specialization: string;
  address: string;
  phone: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  imageUrl?: string;
  isActive: boolean;
}

interface HospitalCreationAttributes extends Optional<HospitalAttributes, 'id' | 'website' | 'rating' | 'totalReviews' | 'imageUrl' | 'isActive'> {}

class Hospital extends Model<HospitalAttributes, HospitalCreationAttributes> implements HospitalAttributes {
  public id!: number;
  public cityId!: number;
  public hospitalName!: string;
  public specialization!: string;
  public address!: string;
  public phone!: string;
  public website?: string;
  public rating?: number;
  public totalReviews?: number;
  public imageUrl?: string;
  public isActive!: boolean;
}

Hospital.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cityId: { type: DataTypes.INTEGER, allowNull: false },
    hospitalName: { type: DataTypes.STRING(255), allowNull: false },
    specialization: { type: DataTypes.STRING(255), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    website: { type: DataTypes.STRING(255), allowNull: true },
    rating: { type: DataTypes.DECIMAL(2, 1), allowNull: true },
    totalReviews: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING(500), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'hospitals',
    underscored: true,
    timestamps: false,
  }
);

Hospital.belongsTo(City, { foreignKey: 'cityId', as: 'city' });
City.hasMany(Hospital, { foreignKey: 'cityId', as: 'hospitals' });

export default Hospital;
