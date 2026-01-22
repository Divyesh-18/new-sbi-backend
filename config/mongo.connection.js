require('dotenv').config();
var mongoose = require("mongoose");

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Connection pool settings
            maxPoolSize: 50, // Maximum number of connections in the pool
            minPoolSize: 10, // Minimum number of connections
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
            // Retry settings
            retryWrites: true,
            retryReads: true,
        });

        const db = mongoose.connection;
        
        db.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        db.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...");
        });

        db.on("reconnected", () => {
            console.log("MongoDB reconnected successfully");
        });

        db.once("open", function () {
            console.log(`Connected to ${process.env.DATABASE_URL}`);
            console.log(`Connection pool size: 50`);
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        process.on('SIGTERM', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        // Retry connection after 5 seconds
        setTimeout(() => {
            console.log("Retrying MongoDB connection...");
            module.exports();
        }, 5000);
    }
}
