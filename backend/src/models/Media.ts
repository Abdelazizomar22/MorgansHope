import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface MediaAttributes {
  id: number;
  userId: number;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  fileSize: number;
  mimeType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MediaCreationAttributes extends Optional<MediaAttributes, 'id'> {}

class Media extends Model<MediaAttributes, MediaCreationAttributes> implements MediaAttributes {
  public id!: number;
  public userId!: number;
  public publicId!: string;
  public secureUrl!: string;
  public resourceType!: string;
  public fileSize!: number;
  public mimeType!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Media.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    publicId: { type: DataTypes.STRING(500), allowNull: false },
    secureUrl: { type: DataTypes.STRING(1000), allowNull: false },
    resourceType: { type: DataTypes.STRING(50), allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: false },
    mimeType: { type: DataTypes.STRING(50), allowNull: false },
  },
  {
    sequelize,
    tableName: 'media',
    underscored: true,
  },
);

Media.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Media, { foreignKey: 'userId', as: 'media' });

export default Media;
