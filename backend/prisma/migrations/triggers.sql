CREATE OR REPLACE FUNCTION enforce_folder_parent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF (SELECT type FROM items WHERE id = NEW.parent_id) != 'folder' THEN
      RAISE EXCEPTION 'Parent must be a folder';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_folder_parent_insert ON items;
CREATE TRIGGER enforce_folder_parent_insert
  BEFORE INSERT ON items
  FOR EACH ROW EXECUTE FUNCTION enforce_folder_parent();

DROP TRIGGER IF EXISTS enforce_folder_parent_update ON items;
CREATE TRIGGER enforce_folder_parent_update
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION enforce_folder_parent();
