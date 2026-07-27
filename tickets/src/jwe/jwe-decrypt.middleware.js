"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JweDecryptMiddleware = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const jose = require("jose");
let JweDecryptMiddleware = class JweDecryptMiddleware {
    constructor() {
        try {
            const hex = fs.readFileSync('/keys/jwe-secret.key', 'utf8').trim();
            this.secret = Uint8Array.from(Buffer.from(hex, 'hex'));
        }
        catch {
            console.warn('[JWE] Could not load /keys/jwe-secret.key — JWE decryption will not work. Using zero key as fallback.');
            this.secret = new Uint8Array(32);
        }
    }
    async use(req, _res, next) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 80) {
            try {
                const jwe = authHeader.substring(7);
                const { plaintext } = await jose.compactDecrypt(jwe, this.secret);
                const jwtString = new TextDecoder().decode(plaintext);
                req.headers.authorization = `Bearer ${jwtString}`;
            }
            catch {
            }
        }
        next();
    }
};
exports.JweDecryptMiddleware = JweDecryptMiddleware;
exports.JweDecryptMiddleware = JweDecryptMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JweDecryptMiddleware);
//# sourceMappingURL=jwe-decrypt.middleware.js.map