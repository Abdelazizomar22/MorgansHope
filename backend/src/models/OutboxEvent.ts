import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OutboxAttributes {
  id: string;
  topic: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  publishedAt: Date | null;
  attempts: number;
  lastError: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type OutboxCreation = Optional<OutboxAttributes, 'publishedAt' | 'attempts' | 'lastError'>;

class OutboxEvent extends Model<OutboxAttributes, OutboxCreation> implements OutboxAttributes {
  public id!: string;
  public topic!: string;
  public aggregateType!: string;
  public aggregateId!: string;
  public payload!: Record<string, unknown>;
  public publishedAt!: Date | null;
  public attempts!: number;
  public lastError!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OutboxEvent.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  topic: { type: DataTypes.STRING(100), allowNull: false },
  aggregateType: { type: DataTypes.STRING(100), allowNull: false, field: 'aggregate_type' },
  aggregateId: { type: DataTypes.STRING(100), allowNull: false, field: 'aggregate_id' },
  payload: { type: DataTypes.JSON, allowNull: false },
  publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  lastError: { type: DataTypes.TEXT, allowNull: true, field: 'last_error' },
}, {
  sequelize,
  tableName: 'outbox_events',
  underscored: true,
  indexes: [{ fields: ['published_at', 'created_at'] }],
});

export default OutboxEvent;
