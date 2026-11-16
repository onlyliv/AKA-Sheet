CREATE TABLE drive_credentials (
 id text PRIMARY KEY NOT NULL,
 owner text NOT NULL,
 subject text NOT NULL,
 payload text NOT NULL,
 expires_at integer NOT NULL
);
