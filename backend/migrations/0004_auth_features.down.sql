-- +goose Down
DROP TABLE IF EXISTS password_reset_tokens;

-- +goose Up
-- Intentionally empty — the up migration handles table creation.
