import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  password: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  acceptedDisclaimer?: boolean;
  onboardingCompleted?: boolean;
  authProvider?: 'local' | 'google';
  verificationCode?: string | null;
  verificationChannel?: 'email' | 'phone' | null;
  verificationExpiresAt?: Date | null;
  phoneOtpHash?: string | null;
  phoneOtpExpiry?: Date | null;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  smokingHistory?: 'never' | 'former' | 'current';
  medicalHistory?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'email' | 'phone' | 'emailVerified' | 'phoneVerified' | 'acceptedDisclaimer' | 'onboardingCompleted' | 'authProvider' | 'verificationCode' | 'verificationChannel' | 'verificationExpiresAt' | 'phoneOtpHash' | 'phoneOtpExpiry' | 'age' | 'gender' | 'smokingHistory' | 'medicalHistory' | 'profilePicture' | 'role' | 'isActive'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email?: string | null;
  public password!: string;
  public phone?: string;
  public emailVerified?: boolean;
  public phoneVerified?: boolean;
  public acceptedDisclaimer?: boolean;
  public onboardingCompleted?: boolean;
  public authProvider?: 'local' | 'google';
  public verificationCode?: string | null;
  public verificationChannel?: 'email' | 'phone' | null;
  public verificationExpiresAt?: Date | null;
  public phoneOtpHash?: string | null;
  public phoneOtpExpiry?: Date | null;
  public age?: number;
  public gender?: 'male' | 'female' | 'other';
  public smokingHistory?: 'never' | 'former' | 'current';
  public medicalHistory?: string;
  public profilePicture?: string;
  public role!: 'user' | 'admin';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  toSafeJSON() {
    const { password, verificationCode, verificationExpiresAt, phoneOtpHash, phoneOtpExpiry, ...safe } = this.toJSON() as any;
    if (typeof safe.email === 'string' && safe.email.endsWith('@phone.morganshope.local')) {
      safe.email = null;
    }
    return safe;
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'email_verified' },
    phoneVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'phone_verified' },
    acceptedDisclaimer: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'accepted_disclaimer' },
    onboardingCompleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'onboarding_completed' },
    authProvider: { type: DataTypes.ENUM('local', 'google'), defaultValue: 'local', field: 'auth_provider' },
    verificationCode: { type: DataTypes.STRING(12), allowNull: true, field: 'verification_code' },
    verificationChannel: { type: DataTypes.ENUM('email', 'phone'), allowNull: true, field: 'verification_channel' },
    verificationExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'verification_expires_at' },
    phoneOtpHash: { type: DataTypes.STRING(255), allowNull: true, field: 'phone_otp_hash' },
    phoneOtpExpiry: { type: DataTypes.DATE, allowNull: true, field: 'phone_otp_expiry' },
    age: { type: DataTypes.INTEGER, allowNull: true },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
    smokingHistory: { type: DataTypes.ENUM('never', 'former', 'current'), allowNull: true },
    medicalHistory: { type: DataTypes.TEXT, allowNull: true },
    profilePicture: { type: DataTypes.TEXT, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
  }
);

export default User;
