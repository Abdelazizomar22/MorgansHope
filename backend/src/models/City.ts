import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CityAttributes {
  id: number;
  cityName: string;
  state?: string;
  country: string;
}

interface CityCreationAttributes extends Optional<CityAttributes, 'id' | 'state'> {}

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  public id!: number;
  public cityName!: string;
  public state?: string;
  public country!: string;
}

City.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cityName: { type: DataTypes.STRING(100), allowNull: false },
    state: { type: DataTypes.STRING(100), allowNull: true },
    country: { type: DataTypes.STRING(100), defaultValue: 'Egypt' },
  },
  {
    sequelize,
    tableName: 'cities',
    underscored: true,
    timestamps: false,
  }
);

export default City;
