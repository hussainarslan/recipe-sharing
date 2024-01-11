import { Request } from "express";

export interface IRecipeRequest extends Request {
  user: any;
  id: number;
}
