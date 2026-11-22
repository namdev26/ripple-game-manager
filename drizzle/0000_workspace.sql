CREATE TABLE workspace (
  owner_id TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  projects TEXT NOT NULL
);
