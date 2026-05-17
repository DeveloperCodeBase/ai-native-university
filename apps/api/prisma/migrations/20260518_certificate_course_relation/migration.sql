-- Add FK from certificates.courseId → courses.id (column already exists)
DO $$ BEGIN
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
