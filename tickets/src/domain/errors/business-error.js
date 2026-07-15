"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessError = void 0;
const common_1 = require("@nestjs/common");
class BusinessError extends common_1.BadRequestException {
    constructor(message) {
        super(message);
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
//# sourceMappingURL=business-error.js.map