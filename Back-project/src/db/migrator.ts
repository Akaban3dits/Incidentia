import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "../config/sequelize";

const isTsRuntime =
  process.argv.some(a => /ts-node|tsx/.test(a)) ||
  __filename.endsWith(".ts");

const pattern = isTsRuntime ? "src/migrations/*.ts" : "dist/migrations/*.js";

export const migrator = new Umzug({
  migrations: { glob: [pattern, { cwd: process.cwd() }] },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: "SequelizeMeta" }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;

export async function runMigrations() {
  await migrator.up();
}
