import { Migration } from "../db/migrator";

export const up: Migration = async ({ context: qi }) => {

  await qi.sequelize.query(`
    ALTER TABLE "tickets"
    ADD COLUMN IF NOT EXISTS "created_by_id" UUID,
    ADD COLUMN IF NOT EXISTS "created_by_name" VARCHAR(150);
  `);

  await qi.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'tickets_created_by_id_fkey'
      ) THEN
        ALTER TABLE "tickets"
        ADD CONSTRAINT "tickets_created_by_id_fkey"
        FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id")
        ON UPDATE CASCADE ON DELETE SET NULL;
      END IF;
    EXCEPTION WHEN duplicate_object THEN
      -- no-op si otro nombre/estado similar ya existe
      NULL;
    END$$;
  `);

  await qi.sequelize.query(`
    UPDATE "tickets"
    SET "created_by_name" = 'Desconocido'
    WHERE "created_by_name" IS NULL;
  `);
  await qi.sequelize.query(`
    ALTER TABLE "tickets"
    ALTER COLUMN "created_by_name" SET DEFAULT 'Desconocido';
  `);
 
  await qi.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM "tickets" WHERE "created_by_name" IS NULL LIMIT 1
      ) THEN
        ALTER TABLE "tickets" ALTER COLUMN "created_by_name" SET NOT NULL;
      END IF;
    END$$;
  `);

 
  await qi.sequelize.query(`
    CREATE INDEX IF NOT EXISTS "idx_tickets_created_by_id"
    ON "tickets" ("created_by_id");
  `);
  await qi.sequelize.query(`
    CREATE INDEX IF NOT EXISTS "idx_tickets_created_by_name"
    ON "tickets" ("created_by_name");
  `);
};

export const down: Migration = async ({ context: qi }) => {
  await qi.sequelize.query(`DROP INDEX IF EXISTS "idx_tickets_created_by_name";`);
  await qi.sequelize.query(`DROP INDEX IF EXISTS "idx_tickets_created_by_id";`);
  await qi.sequelize.query(`
    ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS "tickets_created_by_id_fkey";
  `);
  await qi.sequelize.query(`
    ALTER TABLE "tickets"
    DROP COLUMN IF EXISTS "created_by_name",
    DROP COLUMN IF EXISTS "created_by_id";
  `);
};
