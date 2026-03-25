import '../config/database';
import sequelize from '../config/database';
import { DataTypes } from 'sequelize';
import '../models/User';
import '../models/City';
import '../models/Hospital';
import '../models/AnalysisResult';
import '../models/ChatMessage';

async function migrate() {
  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: false });

    // Ensure avatar URLs/data-URIs fit in production databases.
    if (sequelize.getDialect() === 'postgres') {
      try {
        await sequelize.getQueryInterface().changeColumn('users', 'profile_picture', {
          type: DataTypes.TEXT,
          allowNull: true,
        });
      } catch (err) {
        console.warn('⚠️ Could not alter users.profile_picture to TEXT:', err);
      }
    }

    console.log('✅ All tables created/verified.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
