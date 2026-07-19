-- CreateTable
CREATE TABLE "ContactCard" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'mail',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "links" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactCard_pkey" PRIMARY KEY ("id")
);
