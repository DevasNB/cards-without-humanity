// src/controllers/auth.controller.ts
import { NextFunction, Request, Response } from "express";
import { RoomService } from "../services/room.service";
import { CreateRoomResponse } from "../types/rooms";

// Instantiate the service (can be done with dependency injection in larger apps)
const roomService = new RoomService();

export class RoomsController {
  /**
   * Handles an HTTP GET request to get all rooms
   */
  public async getAllRooms(req: Request, res: Response) {
    const rooms = await roomService.listRooms();
    res.json(rooms);
  }

  /**
   * Handles an HTTP POST request to create a new room
   */
  public async createRoom(
    req: Request,
    res: Response<CreateRoomResponse>,
    next: NextFunction
  ) {
    // req.user is guaranteed to exist here because the 'authenticate' middleware ran before this.
    if (!req.user) {
      // This case should theoretically not be hit if 'authenticate' middleware is used correctly
      return next(new Error("User not found on request after authentication."));
    }

    const user = req.user;

    const room = await roomService.createRoom(user.userId, user.username);

    res.status(201).json(room);
  }
}
