"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableRoomSchema = void 0;
const zod_1 = require("zod");
// zod schema for validating room updates
exports.EditableRoomSchema = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional(),
    //winningRounds: z.number().optional(),
    //maxPlayers: z.number().optional(),
})
    .strip();
//# sourceMappingURL=Room.js.map