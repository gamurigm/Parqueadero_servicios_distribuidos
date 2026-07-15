"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = exports.RESOURCE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.RESOURCE_KEY = 'opa_resource';
const Resource = (resource) => (0, common_1.SetMetadata)(exports.RESOURCE_KEY, resource);
exports.Resource = Resource;
//# sourceMappingURL=resource.decorator.js.map