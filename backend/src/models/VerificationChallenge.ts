import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ChallengeAttributes {
  id: string;
  userId: number;
  purpose: 'email_verification' | 'phone_verification';
  destinationHash: string;
  codeHash: string;
  expiresAt: Date;
  resendAvailableAt: Date;
  attempts: number;
  maxAttempts: number;
  consumedAt: Date | null;
  lockedUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ChallengeCreation = Optional<ChallengeAttributes, 'attempts' | 'maxAttempts' | 'consumedAt' | 'lockedUntil'>;

class VerificationChallenge extends Model<ChallengeAttributes, ChallengeCreation> implements ChallengeAttributes {
  public id!: string;
  public userId!: number;
  public purpose!: 'email_verification' | 'phone_verification';
  public destinationHash!: string;
  public codeHash!: string;
  public expiresAt!: Date;
  public resendAvailableAt!: Date;
  public attempts!: number;
  public maxAttempts!: number;
  public consumedAt!: Date | null;
  public lockedUntil!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VerificationChallenge.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  purpose: { type: DataTypes.STRING(40), allowNull: false },
  destinationHash: { type: DataTypes.STRING(64), allowNull: false, field: 'destination_hash' },
  codeHash: { type: DataTypes.STRING(64), allowNull: false, field: 'code_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  resendAvailableAt: { type: DataTypes.DATE, allowNull: false, field: 'resend_available_at' },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  maxAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5, field: 'max_attempts' },
  consumedAt: { type: DataTypes.DATE, allowNull: true, field: 'consumed_at' },
  lockedUntil: { type: DataTypes.DATE, allowNull: true, field: 'locked_until' },
}, {
  sequelize,
  tableName: 'verification_challenges',
  underscored: true,
  indexes: [
    { fields: ['user_id', 'purpose', 'consumed_at'] },
    { fields: ['expires_at'] },
  ],
});

export default VerificationChallenge;
