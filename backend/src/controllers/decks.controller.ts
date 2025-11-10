import { Request, Response } from "express";
import { DecksService } from "../services/decks.service";

// Instantiate the service (can be done with dependency injection in larger apps)
const decksService = new DecksService();

export class DecksController {
  /**
   * Handles an HTTP GET request to get all decks
   */
  public async getAllDecks(req: Request, res: Response) {
    const decks = await decksService.listDecks();
    res.json(decks);
  }

  /**
   *  TODO: CREATE DECK IN LIST OF DECKS
   * Handles an HTTP POST request to create a new room
   */
  /* public async createDeck(
    req: Request,
    res: Response<CreateDeckResponse>,
    next: NextFunction
  ) {
    // req.user is guaranteed to exist here because the 'authenticate' middleware ran before this.
    if (!req.user) {
      // This case should theoretically not be hit if 'authenticate' middleware is used correctly
      return next(new Error("User not found on request after authentication."));
    }

    const user = req.user;

    const deck = await decksService.createDeck(user.userId, user.username);

    res.status(201).json(deck);
  }*/
}
