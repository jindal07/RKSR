/*
  Warnings:

  - You are about to drop the column `body` on the `ContactCard` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `ContactCard` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `ContactCard` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ContactCard` table. All the data in the column will be lost.
  - Added the required column `name` to the `ContactCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactCard" DROP COLUMN "body",
DROP COLUMN "icon",
DROP COLUMN "subtitle",
DROP COLUMN "title",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT '';
