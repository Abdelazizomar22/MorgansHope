import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuthSessionAttributes {
  id: string;
  userId: number;
  familyId: string;
  tokenHash: string;
  userAgent: string | null;
  ipHash: string | null;
  rememberMe: boolean;
  expiresAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  replacedById: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AuthSessionCreation = Optional<
  AuthSessionAttributes,
  'userAgent' | 'ipHash' | 'rememberMe' | 'lastUsedAt' | 'revokedAt' | 'replacedById'
>;

class AuthSession extends Model<AuthSessionAttributes, AuthSessionCreation> implements AuthSessionAttributes {
  public id!: string;
  public userId!: number;
  public familyId!: string;
  public tokenHash!: string;
  public userAgent!: string | null;
  public ipHash!: string | null;
  public rememberMe!: boolean;
  public expiresAt!: Date;
  public lastUsedAt!: Date | null;
  public revokedAt!: Date | null;
  public replacedById!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuthSession.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  familyId: { type: DataTypes.UUID, allowNull: false, field: 'family_id' },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  userAgent: { type: DataTypes.STRING(500), allowNull: true, field: 'user_agent' },
  ipHash: { type: DataTypes.STRING(64), allowNull: true, field: 'ip_hash' },
  rememberMe: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'remember_me' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  lastUsedAt: { type: DataTypes.DATE, allowNull: true, field: 'last_used_at' },
  revokedAt: { type: DataTypes.DATE, allowNull: true, field: 'revoked_at' },
  replacedById: { type: DataTypes.UUID, allowNull: true, field: 'replaced_by_id' },
}, {
  sequelize,
  tableName: 'auth_sessions',
  underscored: true,
  indexes: [
    { fields: ['user_id', 'revoked_at'] },
    { fields: ['family_id'] },
    { fields: ['expires_at'] },
  ],
});

export default AuthSession;
