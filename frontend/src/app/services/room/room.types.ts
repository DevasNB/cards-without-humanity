import {
  CreateRoomResponse as CRR,
  SimplifiedUser as SU,
  ListedRoom as LR,
  StartingGamePayload as SGP,
  MiddleGamePayload as MGP,
  PromptCard as PC,
  SocketError as SE,
  RoomResponse as RR,
  GameResponse as GR,
  RoomUserResponse as RUR,
  PlayerResponse as PR,
  AnswerCard as AC,
  RoundResponse as RoR,
} from 'cah-shared';

export interface CreateRoomResponse extends CRR {}

export interface SimplifiedUser extends SU {}

export interface ListedRoom extends LR {}

export interface RoomResponse extends RR {}

export interface GameResponse extends GR {}

export interface StartingGamePayload extends SGP {}

export interface MiddleGamePayload extends MGP {}

export interface PromptCard extends PC {}

export interface AnswerCard extends AC {}

export interface PlayerResponse extends PR {}

export interface RoundResponse extends RoR {}

export interface RoomUser extends RUR {}

export interface SocketError extends SE {}
