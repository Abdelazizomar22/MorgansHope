import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AnalysisJobAttributes {
  id: string;
  analysisId: number;
  userId: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  lockedAt: Date | null;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AnalysisJobCreation = Optional<
  AnalysisJobAttributes,
  'status' | 'attempts' | 'maxAttempts' | 'lastError' | 'lockedAt' | 'completedAt'
>;

class AnalysisJob extends Model<AnalysisJobAttributes, AnalysisJobCreation> implements AnalysisJobAttributes {
  public id!: string;
  public analysisId!: number;
  public userId!: number;
  public status!: AnalysisJobAttributes['status'];
  public attempts!: number;
  public maxAttempts!: number;
  public lastError!: string | null;
  public lockedAt!: Date | null;
  public completedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnalysisJob.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  analysisId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'analysis_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'queued' },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  maxAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5, field: 'max_attempts' },
  lastError: { type: DataTypes.TEXT, allowNull: true, field: 'last_error' },
  lockedAt: { type: DataTypes.DATE, allowNull: true, field: 'locked_at' },
  completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
}, {
  sequelize,
  tableName: 'analysis_jobs',
  underscored: true,
  indexes: [
    { fields: ['status', 'created_at'] },
    { fields: ['user_id', 'created_at'] },
  ],
});

export default AnalysisJob;
