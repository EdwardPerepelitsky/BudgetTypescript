"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const db = __importStar(require("./queries"));
const cors_1 = __importDefault(require("cors"));
const users_routes_1 = __importDefault(require("./users_routes"));
const https_1 = __importDefault(require("https"));
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = __importDefault(require("crypto"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const pgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "../..", "build")));
app.use(express_1.default.static("public"));
app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST');
    next();
});
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
let secret = crypto_1.default.randomBytes(128).toString('hex');
let name = crypto_1.default.randomBytes(128).toString('hex');
app.use((0, express_session_1.default)({
    secret: secret,
    name: name,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 600000
    },
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new pgSession({
        pool: db.pool,
        tableName: 'session'
    })
}));
app.use('/users', users_routes_1.default);
app.use('/checkLogin', (req, res, _next) => {
    if (req.session.userName) {
        res.status(200).json({ message: 'Logged in' });
    }
    else {
        res.status(200).json({ message: 'Logged out' });
    }
});
app.use((_req, res, _next) => {
    res.sendFile(path_1.default.join(__dirname, "../..", "build", "index.html"));
});
const options = {
    key: fs_1.default.readFileSync(path_1.default.join(__dirname, "../src/certs", "localhost-key.pem")),
    cert: fs_1.default.readFileSync(path_1.default.join(__dirname, "../src/certs", "localhost.pem"))
};
const server = https_1.default.createServer(options, app);
const PORT = 4324;
server.listen(PORT, () => { console.log('Server is listening on port ' + PORT); });
//app.listen(PORT, () => {console.log('Server is listening on port ' + PORT)})
//# sourceMappingURL=routes.js.map