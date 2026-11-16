CREATE TABLE drive_sync_accounts (account text PRIMARY KEY NOT NULL, revision integer NOT NULL DEFAULT 0, manifest text, scanned_at integer NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE drive_sync_leases (account text PRIMARY KEY NOT NULL, token text NOT NULL, until_at integer NOT NULL);
--> statement-breakpoint
CREATE TABLE drive_sync_batches (account text NOT NULL, device text NOT NULL, batch text NOT NULL, seq integer NOT NULL, hash text NOT NULL, file_id text, status text NOT NULL, PRIMARY KEY(account, device, batch));
--> statement-breakpoint
CREATE TABLE drive_sync_stats (account text NOT NULL, day text NOT NULL, kind text NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY(account, day, kind));
