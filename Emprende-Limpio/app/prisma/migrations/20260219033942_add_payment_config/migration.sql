-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "phone" TEXT,
    "allowedMachineIds" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mpAccessToken" TEXT,
    "mpPublicKey" TEXT,
    "useSumUp" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("allowedMachineIds", "createdAt", "email", "emailVerified", "id", "image", "name", "phone", "updatedAt") SELECT "allowedMachineIds", "createdAt", "email", "emailVerified", "id", "image", "name", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
