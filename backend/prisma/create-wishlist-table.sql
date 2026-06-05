CREATE SEQUENCE IF NOT EXISTS "WishlistItem_publicId_seq";

CREATE TABLE IF NOT EXISTS "WishlistItem" (
  "id" TEXT PRIMARY KEY,
  "publicId" INTEGER NOT NULL DEFAULT nextval('"WishlistItem_publicId_seq"'),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WishlistItem_userId_productId_key'
  ) THEN
    ALTER TABLE "WishlistItem"
    ADD CONSTRAINT "WishlistItem_userId_productId_key" UNIQUE ("userId", "productId");
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WishlistItem_publicId_key'
  ) THEN
    ALTER TABLE "WishlistItem"
    ADD CONSTRAINT "WishlistItem_publicId_key" UNIQUE ("publicId");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "WishlistItem_userId_idx" ON "WishlistItem"("userId");
CREATE INDEX IF NOT EXISTS "WishlistItem_productId_idx" ON "WishlistItem"("productId");

SELECT setval(
  '"WishlistItem_publicId_seq"',
  COALESCE((SELECT MAX("publicId") FROM "WishlistItem"), 0) + 1,
  false
);

ALTER SEQUENCE "WishlistItem_publicId_seq" OWNED BY "WishlistItem"."publicId";
