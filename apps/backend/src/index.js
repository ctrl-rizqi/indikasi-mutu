"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
// Keep master only for auth users or legacy demo if needed
const laporan_1 = __importDefault(require("./routes/laporan"));
const health_1 = __importDefault(require("./routes/health"));
const auth_1 = __importDefault(require("./routes/auth"));
const items_1 = __importDefault(require("./routes/items"));
const categories_1 = __importDefault(require("./routes/categories"));
const activities_1 = __importDefault(require("./routes/activities"));
const cors_1 = require("hono/cors");
const authMiddleware_1 = require("./middleware/authMiddleware");
// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
const app = new hono_1.Hono();
app.use('/api/*', (0, cors_1.cors)());
// Apply authentication middleware to all protected route routers
items_1.default.use(authMiddleware_1.authMiddleware);
categories_1.default.use(authMiddleware_1.authMiddleware);
activities_1.default.use(authMiddleware_1.authMiddleware);
laporan_1.default.use(authMiddleware_1.authMiddleware);
app.route('/api/health', health_1.default);
app.route('/api/auth', auth_1.default);
app.route('/api/items', items_1.default);
app.route('/api/categories', categories_1.default);
app.route('/api/activities', activities_1.default);
app.route('/api/laporan', laporan_1.default);
const port = 5000;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port
});
