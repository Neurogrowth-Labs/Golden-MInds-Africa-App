# Supabase migrations

Apply migrations in filename order with the Supabase CLI (`supabase db push`) or the
Supabase SQL editor while connected as the database owner. Do **not** execute the
legacy `supabase_schema.sql` against an existing production project: it is an
initial schema reference, whereas files in `migrations/` are safe, incremental
production migrations.

Before applying `20260902_production_hardening.sql`, verify that there are no
multiple attendance records for the same `(session_id, user_id)`, because the
migration adds a unique index for that invariant. Configure administrator users
through Supabase Auth `app_metadata.role = "admin"`; changing `profiles.role`
alone is intentionally insufficient for privileged database access.
