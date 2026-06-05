CREATE OR REPLACE PROCEDURE add_public_id(table_name text, constraint_name text)
LANGUAGE plpgsql
AS $$
DECLARE
  sequence_name text := table_name || '_publicId_seq';
BEGIN
  IF to_regclass('"' || table_name || '"') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "publicId" INTEGER', table_name);
  EXECUTE format('UPDATE %I SET "publicId" = nextval(%L) WHERE "publicId" IS NULL', table_name, '"' || sequence_name || '"');
  EXECUTE format(
    'SELECT setval(%L, COALESCE((SELECT MAX("publicId") FROM %I), 0) + 1, false)',
    '"' || sequence_name || '"',
    table_name
  );
  EXECUTE format('ALTER TABLE %I ALTER COLUMN "publicId" SET DEFAULT nextval(%L)', table_name, '"' || sequence_name || '"');
  EXECUTE format('ALTER TABLE %I ALTER COLUMN "publicId" SET NOT NULL', table_name);

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = constraint_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I UNIQUE ("publicId")', table_name, constraint_name);
  END IF;

  EXECUTE format('ALTER SEQUENCE %I OWNED BY %I."publicId"', sequence_name, table_name);
END $$;

CALL add_public_id('User', 'User_publicId_key');
CALL add_public_id('Address', 'Address_publicId_key');
CALL add_public_id('Product', 'Product_publicId_key');
CALL add_public_id('Cart', 'Cart_publicId_key');
CALL add_public_id('CartItem', 'CartItem_publicId_key');
CALL add_public_id('Order', 'Order_publicId_key');
CALL add_public_id('OrderItem', 'OrderItem_publicId_key');
CALL add_public_id('WishlistItem', 'WishlistItem_publicId_key');

DROP PROCEDURE add_public_id(text, text);
