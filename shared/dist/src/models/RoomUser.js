"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableRoomUserSchema = void 0;
const RoomUserStatus_1 = require("../enums/RoomUserStatus");
const zod_1 = require("zod");
// zod schema for validating roomUser updates
exports.EditableRoomUserSchema = zod_1.z
    .object({
    status: zod_1.z
        .enum([RoomUserStatus_1.UserStatus.DISCONNECTED, RoomUserStatus_1.UserStatus.WAITING, RoomUserStatus_1.UserStatus.READY, RoomUserStatus_1.UserStatus.IN_GAME])
        .optional(),
})
    .strip();
//# sourceMappingURL=RoomUser.js.map