-- Add course versioning columns that were added to schema after initial migration

ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "parentCourseId" TEXT;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "isLatestVersion" BOOLEAN NOT NULL DEFAULT true;

-- Add foreign key for self-referencing parent course (optional, for version chains)
-- Using IF NOT EXISTS via DO block to be idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_parentCourseId_fkey'
  ) THEN
    ALTER TABLE "courses"
      ADD CONSTRAINT "courses_parentCourseId_fkey"
      FOREIGN KEY ("parentCourseId") REFERENCES "courses"("id")
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;
