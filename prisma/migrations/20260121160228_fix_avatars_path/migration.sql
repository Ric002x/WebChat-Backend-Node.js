-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '/static/images/avatars/default.png',
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "birthday" DATETIME,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "passwordUpdatedAt" DATETIME,
    "lastAccess" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("avatar", "birthday", "createdAt", "email", "id", "lastAccess", "name", "password", "passwordUpdatedAt", "role", "updatedAt", "username") SELECT "avatar", "birthday", "createdAt", "email", "id", "lastAccess", "name", "password", "passwordUpdatedAt", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
