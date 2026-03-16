import '../config/database';
import sequelize from '../config/database';
import '../models/User';
import '../models/City';
import '../models/Hospital';
import '../models/AnalysisResult';

async function migrate() {
  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: false });
    console.log('✅ All tables created/verified.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
