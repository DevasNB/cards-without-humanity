"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
// Define the Zod schema for creating a user
exports.createUserSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, { message: 'Username must be at least 3 characters long.' })
        .max(30, { message: 'Username must be at most 30 characters long.' })
        .regex(/^\w+$/, {
        message: 'Username must be alphanumeric and can include underscores.',
    }),
});
exports.loginUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, { message: 'Username is required.' }),
});
//# sourceMappingURL=User.js.map