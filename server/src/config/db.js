const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const primaryUri = process.env.MONGODB_ATLAS_URL;
        const fallbackUri = process.env.MONGO_URI;

        if (primaryUri) {
            try {
                const conn = await mongoose.connect(primaryUri);
                console.log(`MongoDB 연결 성공 (Atlas): ${conn.connection.host}`);
                return;
            } catch (atlasError) {
                console.error(`Atlas 연결 실패 (${atlasError.message}). 로컬 DB로 전환을 시도합니다...`);
            }
        }

        const conn = await mongoose.connect(fallbackUri);
        console.log(`MongoDB 연결 성공 (Local): ${conn.connection.host}`);
    } catch (error) {
        console.error(`모든 MongoDB 연결 실패: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
