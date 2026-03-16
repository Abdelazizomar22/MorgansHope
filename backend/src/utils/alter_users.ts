import sequelize from '../config/database';

async function alterUsersTable() {
    try {
        console.log('🔄 Altering users table to add patient details...');

        // Using raw queries to safely add columns if they don't exist
        // Age
        try {
            await sequelize.query(`ALTER TABLE users ADD COLUMN age INT NULL;`);
            console.log('✅ Added age column');
        } catch (e: any) {
            if (e.message.includes('Duplicate column name')) console.log('⚠️ age column already exists');
            else throw e;
        }

        // Gender
        try {
            await sequelize.query(`ALTER TABLE users ADD COLUMN gender ENUM('male', 'female', 'other') NULL;`);
            console.log('✅ Added gender column');
        } catch (e: any) {
            if (e.message.includes('Duplicate column name')) console.log('⚠️ gender column already exists');
            else throw e;
        }

        // Smoking History
        try {
            await sequelize.query(`ALTER TABLE users ADD COLUMN smoking_history ENUM('never', 'former', 'current') NULL;`);
            console.log('✅ Added smoking_history column');
        } catch (e: any) {
            if (e.message.includes('Duplicate column name')) console.log('⚠️ smoking_history column already exists');
            else throw e;
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

alterUsersTable();
