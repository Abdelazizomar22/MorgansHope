import '../config/database';
import sequelize from '../config/database';
import { DataTypes } from 'sequelize';
import '../models/User';
import '../models/City';
import '../models/Hospital';
import '../models/AnalysisResult';
import '../models/ChatMessage';

async function ensureUserAuthColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('users');
  const addIfMissing = async (name: string, definition: any) => {
    if (!table[name]) {
      await queryInterface.addColumn('users', name, definition);
      console.log(`[DB] Added users.${name}`);
    }
  };

  await addIfMissing('email_verified', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('phone_verified', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('accepted_disclaimer', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('onboarding_completed', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('auth_provider', { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'local' });
  await addIfMissing('verification_code', { type: DataTypes.STRING(12), allowNull: true });
  await addIfMissing('verification_channel', { type: DataTypes.STRING(20), allowNull: true });
  await addIfMissing('verification_expires_at', { type: DataTypes.DATE, allowNull: true });
  await addIfMissing('phone_otp_hash', { type: DataTypes.STRING(255), allowNull: true });
  await addIfMissing('phone_otp_expiry', { type: DataTypes.DATE, allowNull: true });
}

async function migrate() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: false });
    await ensureUserAuthColumns();

    if (sequelize.getDialect() === 'postgres') {
      try {
        await sequelize.getQueryInterface().changeColumn('users', 'profile_picture', {
          type: DataTypes.TEXT,
          allowNull: true,
        });
      } catch (err) {
        console.warn('Could not alter users.profile_picture to TEXT:', err);
      }
    }

    console.log('All tables created and verified.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
