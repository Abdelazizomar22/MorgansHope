import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuditAttributes {
  id: string;
  userId: number | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown>;
  createdAt?: Date;
}

type AuditCreation = Optional<AuditAttributes, 'userId' | 'resourceId' | 'requestId' | 'metadata'>;

class AuditLog extends Model<AuditAttributes, AuditCreation> implements AuditAttributes {
  public id!: string;
  public userId!: number | null;
  public action!: string;
  public resourceType!: string;
  public resourceId!: string | null;
  public requestId!: string | null;
  public metadata!: Record<string, unknown>;
  public readonly createdAt!: Date;
}

AuditLog.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING(100), allowNull: false },
  resourceType: { type: DataTypes.STRING(100), allowNull: false, field: 'resource_type' },
  resourceId: { type: DataTypes.STRING(100), allowNull: true, field: 'resource_id' },
  requestId: { type: DataTypes.STRING(100), allowNull: true, field: 'request_id' },
  metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
}, {
  sequelize,
  tableName: 'audit_logs',
  underscored: true,
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'created_at'] },
    { fields: ['action', 'created_at'] },
  ],
});

export default AuditLog;
