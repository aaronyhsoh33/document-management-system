-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('folder', 'document');

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "ItemType" NOT NULL,
    "parent_id" INTEGER,
    "mime_type" VARCHAR(100),
    "size" INTEGER,
    "created_by" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enforce uniqueness: no two items of the same type can share a name (case-insensitive)
-- within the same parent folder (including root, where parent_id IS NULL).
-- COALESCE(parent_id, -1) groups root items together since -1 is never a real id.
CREATE UNIQUE INDEX "items_name_type_parent_unique"
  ON "items" (LOWER("name"), "type", COALESCE("parent_id", -1));
