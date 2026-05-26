CREATE OR REPLACE FUNCTION upsert_kakao_user(
  p_kakao_id TEXT,
  p_nickname TEXT,
  p_profile_image_url TEXT,
  p_site_nickname TEXT,
  p_site_animal TEXT
)
RETURNS SETOF users
LANGUAGE sql
AS $$
  INSERT INTO users (kakao_id, nickname, profile_image_url, site_nickname, site_animal)
  VALUES (p_kakao_id, p_nickname, p_profile_image_url, p_site_nickname, p_site_animal)
  ON CONFLICT (kakao_id) DO UPDATE SET
    nickname = EXCLUDED.nickname,
    profile_image_url = EXCLUDED.profile_image_url
  RETURNING *;
$$;
