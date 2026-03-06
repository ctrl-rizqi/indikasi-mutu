CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "roles" ("name") VALUES ('admin') ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
INSERT INTO "roles" ("name") VALUES ('teknisi') ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "users"
SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'teknisi')
WHERE "role_id" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "users" ("name", "username", "password", "role_id")
SELECT 'Administrator', 'admin', '$2b$10$Gz0sNmTx4N1nO.psGzxAGuvBL6r2kW9ycVqNPpoNyVdnR3vhpsdW.', "id"
FROM "roles"
WHERE "name" = 'admin'
ON CONFLICT ("username") DO NOTHING;--> statement-breakpoint
INSERT INTO "users" ("name", "username", "password", "role_id")
SELECT 'Teknisi', 'teknisi', '$2b$10$ddCLBNO9LpXAWZNiKmVyT.DakFB/7RS2CNvciuAEeGpl38qA.jo4i', "id"
FROM "roles"
WHERE "name" = 'teknisi'
ON CONFLICT ("username") DO NOTHING;
