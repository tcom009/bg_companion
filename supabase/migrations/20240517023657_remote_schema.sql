
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "vecs";

ALTER SCHEMA "vecs" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."create_profile"("profile_id" "uuid", "first_name" "text", "last_name" "text", "country" "text", "phone" "text", "city" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$ 
BEGIN 
INSERT INTO profiles (profile_id, first_name, last_name, country, phone, city) VALUES (profile_id, first_name, last_name, country, phone, city); 
INSERT INTO catalog ("user") VALUES (profile_id); 
END; 
$$;

ALTER FUNCTION "public"."create_profile"("profile_id" "uuid", "first_name" "text", "last_name" "text", "country" "text", "phone" "text", "city" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."match_boardgames"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) RETURNS TABLE("id" character varying, "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "sql" STABLE
    AS $$
  select
    boardgames.id,
    boardgames.metadata,
    1 - (boardgames.vec <=> query_embedding) as similarity
  from boardgames
  where (boardgames.metadata->>'year_published')::int > 2009
  and 1 - (boardgames.vec <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

ALTER FUNCTION "public"."match_boardgames"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."match_boardgames"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer, "year" integer) RETURNS TABLE("id" character varying, "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "sql" STABLE
    AS $$
  select
    boardgames.id,
    boardgames.metadata,
    1 - (boardgames.vec <=> query_embedding) as similarity
  from boardgames
  where (boardgames.metadata->>'year_published')::int >= year
  and 1 - (boardgames.vec <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

ALTER FUNCTION "public"."match_boardgames"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer, "year" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."boardgames" (
    "id" character varying NOT NULL,
    "vec" "extensions"."vector"(1536) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);

ALTER TABLE "public"."boardgames" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."catalog" (
    "user" "uuid",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "id" bigint NOT NULL
);

ALTER TABLE "public"."catalog" OWNER TO "postgres";

COMMENT ON TABLE "public"."catalog" IS 'user''s catalog transactional table';

ALTER TABLE "public"."catalog" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."catalog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "profile_id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "city" "text",
    "country" "text"
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_games" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bgg_id" bigint,
    "condition" character varying,
    "is_sold" boolean,
    "observations" character varying,
    "price" real,
    "language_dependency" character varying,
    "language" character varying,
    "game_name" character varying,
    "image" character varying,
    "catalog_id" bigint NOT NULL
);

ALTER TABLE "public"."user_games" OWNER TO "postgres";

COMMENT ON TABLE "public"."user_games" IS 'all user games goes here';

ALTER TABLE "public"."user_games" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_games_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."boardgames"
    ADD CONSTRAINT "_boardgames_pkey1" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."catalog"
    ADD CONSTRAINT "catalog_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("profile_id");

ALTER TABLE ONLY "public"."user_games"
    ADD CONSTRAINT "user_games_pkey" PRIMARY KEY ("id");

CREATE INDEX "ix_meta_f613b4b" ON "public"."boardgames" USING "gin" ("metadata" "jsonb_path_ops");

CREATE INDEX "ix_vector_cosine_ops_30_f613b4b" ON "public"."boardgames" USING "ivfflat" ("vec" "extensions"."vector_cosine_ops") WITH ("lists"='30');

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."catalog"
    ADD CONSTRAINT "public_catalog_user_fkey" FOREIGN KEY ("user") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_games"
    ADD CONSTRAINT "public_user_games_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."user_games"
    ADD CONSTRAINT "user_games_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalog"("id");

CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "profile_id"));

ALTER TABLE "public"."catalog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delete_confidential_data" ON "public"."user_games" FOR DELETE USING (("auth"."uid"() = "owner_id"));

CREATE POLICY "insert_catalog" ON "public"."catalog" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (NOT (EXISTS ( SELECT 1
   FROM "public"."catalog" "catalog_1"
  WHERE ("catalog_1"."user" = "auth"."uid"()))))));

CREATE POLICY "insert_profile" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (NOT (EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."profile_id" = "auth"."uid"()))))));

CREATE POLICY "insert_user_games" ON "public"."user_games" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_catalog" ON "public"."catalog" FOR SELECT USING (true);

CREATE POLICY "select_user_games_policy" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "select_user_games_policy" ON "public"."user_games" FOR SELECT USING (true);

CREATE POLICY "update_confidential_data" ON "public"."user_games" FOR UPDATE USING (("auth"."uid"() = "owner_id"));

ALTER TABLE "public"."user_games" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_profile"("profile_id" "uuid", "first_name" "text", "last_name" "text", "country" "text", "phone" "text", "city" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile"("profile_id" "uuid", "first_name" "text", "last_name" "text", "country" "text", "phone" "text", "city" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile"("profile_id" "uuid", "first_name" "text", "last_name" "text", "country" "text", "phone" "text", "city" "text") TO "service_role";

GRANT ALL ON TABLE "public"."boardgames" TO "anon";
GRANT ALL ON TABLE "public"."boardgames" TO "authenticated";
GRANT ALL ON TABLE "public"."boardgames" TO "service_role";

GRANT ALL ON TABLE "public"."catalog" TO "anon";
GRANT ALL ON TABLE "public"."catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog" TO "service_role";

GRANT ALL ON SEQUENCE "public"."catalog_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."catalog_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."catalog_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_games" TO "anon";
GRANT ALL ON TABLE "public"."user_games" TO "authenticated";
GRANT ALL ON TABLE "public"."user_games" TO "service_role";

GRANT ALL ON SEQUENCE "public"."user_games_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_games_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_games_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
