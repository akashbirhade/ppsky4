"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUserId2 = exports.mockUserId = exports.mockAuthToken = exports.validUser2 = exports.validUser = void 0;
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("@routes/auth.routes"));
const profile_routes_1 = __importDefault(require("@routes/profile.routes"));
const match_routes_1 = __importDefault(require("@routes/match.routes"));
const chat_routes_1 = __importDefault(require("@routes/chat.routes"));
const call_routes_1 = __importDefault(require("@routes/call.routes"));
const admin_routes_1 = __importDefault(require("@routes/admin.routes"));
const host_routes_1 = __importDefault(require("@routes/host.routes"));
const error_middleware_1 = require("@middleware/error.middleware");
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use('/api/v1/auth', auth_routes_1.default);
    app.use('/api/v1/profiles', profile_routes_1.default);
    app.use('/api/v1/matches', match_routes_1.default);
    app.use('/api/v1/chats', chat_routes_1.default);
    app.use('/api/v1/calls', call_routes_1.default);
    app.use('/api/v1/admin', admin_routes_1.default);
    app.use('/api/v1/hosts', host_routes_1.default);
    app.use(error_middleware_1.notFound);
    app.use(error_middleware_1.errorHandler);
    return app;
}
// Valid test user data
exports.validUser = {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@test.com',
    password: 'Test@1234',
    mobileNumber: '9876543210',
    gender: 'MALE',
    dateOfBirth: '1995-06-15',
};
exports.validUser2 = {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@test.com',
    password: 'Test@5678',
    mobileNumber: '8765432109',
    gender: 'FEMALE',
    dateOfBirth: '1997-03-22',
};
// Mock auth token for protected routes
exports.mockAuthToken = 'Bearer mock-jwt-access-token';
// Mock user ID (CUID format)
exports.mockUserId = 'clr1234567890abcdef';
exports.mockUserId2 = 'clr0987654321fedcba';
//# sourceMappingURL=test-setup.js.map