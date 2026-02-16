-- Add origin_country column to watched_items
-- Stores comma-separated country codes, e.g. "KR" for Korean content
alter table watched_items add column if not exists origin_country text;
