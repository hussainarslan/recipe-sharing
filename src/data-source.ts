import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Recipe } from "./entity/Recipe";
require("dotenv").config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: PGHOST,
  port: 5432,
  username: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  synchronize: true,
  ssl: true,
  logging: false,
  entities: [User, Recipe],
  migrations: [],
  subscribers: [],
});
