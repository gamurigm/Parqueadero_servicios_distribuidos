"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.ACTION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ACTION_KEY = 'action';
const Action = (action) => (0, common_1.SetMetadata)(exports.ACTION_KEY, action);
exports.Action = Action;
//# sourceMappingURL=action.decorator.js.map