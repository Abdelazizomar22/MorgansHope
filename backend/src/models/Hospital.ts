import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import City from './City';

interface HospitalAttributes {
  id: number;
  cityId: number;
  hospitalName: string;
  hospitalNameAr?: string;
  specialization: string;
  specializationAr?: string;
  address: string;
  addressAr?: string;
  phone: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  establishedYear?: number;
  beds?: string;
  expertise?: string[];
  services?: string[];
  type?: 'Gov' | 'Private';
  bookingUrl?: string;
  about?: string;
  aboutAr?: string;
  googleMaps?: string;
  badge?: string;
  badgeColor?: string;
  cityName?: string;
  cityNameAr?: string;
  isActive: boolean;
}

interface HospitalCreationAttributes extends Optional<HospitalAttributes, 'id' | 'website' | 'rating' | 'totalReviews' | 'imageUrl' | 'latitude' | 'longitude' | 'establishedYear' | 'beds' | 'expertise' | 'services' | 'type' | 'bookingUrl' | 'about' | 'aboutAr' | 'googleMaps' | 'badge' | 'badgeColor' | 'cityName' | 'cityNameAr' | 'isActive'> {}

class Hospital extends Model<HospitalAttributes, HospitalCreationAttributes> implements HospitalAttributes {
  public id!: number;
  public cityId!: number;
  public hospitalName!: string;
  public hospitalNameAr?: string;
  public specialization!: string;
  public specializationAr?: string;
  public address!: string;
  public addressAr?: string;
  public phone!: string;
  public website?: string;
  public rating?: number;
  public totalReviews?: number;
  public imageUrl?: string;
  public latitude?: number;
  public longitude?: number;
  public establishedYear?: number;
  public beds?: string;
  public expertise?: string[];
  public services?: string[];
  public type?: 'Gov' | 'Private';
  public bookingUrl?: string;
  public about?: string;
  public aboutAr?: string;
  public googleMaps?: string;
  public badge?: string;
  public badgeColor?: string;
  public cityName?: string;
  public cityNameAr?: string;
  public isActive!: boolean;
}

Hospital.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cityId: { type: DataTypes.INTEGER, allowNull: false },
    hospitalName: { type: DataTypes.STRING(255), allowNull: false },
    hospitalNameAr: { type: DataTypes.STRING(255), allowNull: true },
    specialization: { type: DataTypes.STRING(255), allowNull: false },
    specializationAr: { type: DataTypes.STRING(255), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: false },
    addressAr: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    website: { type: DataTypes.STRING(255), allowNull: true },
    rating: { type: DataTypes.DECIMAL(2, 1), allowNull: true },
    totalReviews: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING(500), allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
    establishedYear: { type: DataTypes.INTEGER, allowNull: true },
    beds: { type: DataTypes.STRING(20), allowNull: true },
    expertise: { type: DataTypes.JSON, allowNull: true },
    services: { type: DataTypes.JSON, allowNull: true },
    type: { type: DataTypes.ENUM('Gov', 'Private'), allowNull: true },
    bookingUrl: { type: DataTypes.STRING(500), allowNull: true },
    about: { type: DataTypes.TEXT, allowNull: true },
    aboutAr: { type: DataTypes.TEXT, allowNull: true },
    googleMaps: { type: DataTypes.STRING(500), allowNull: true },
    badge: { type: DataTypes.STRING(100), allowNull: true },
    badgeColor: { type: DataTypes.STRING(20), allowNull: true },
    cityName: { type: DataTypes.STRING(100), allowNull: true },
    cityNameAr: { type: DataTypes.STRING(100), allowNull: true },
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
