-- SET check_function_bodies = false;
-- CREATE SCHEMA hdb_catalog;
-- CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
-- COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
-- CREATE FUNCTION hdb_catalog.gen_hasura_uuid() RETURNS uuid
--     LANGUAGE sql
--     AS $$select gen_random_uuid()$$;
-- CREATE TABLE hdb_catalog.hdb_action_log (
--     id uuid DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
--     action_name text,
--     input_payload jsonb NOT NULL,
--     request_headers jsonb NOT NULL,
--     session_variables jsonb NOT NULL,
--     response_payload jsonb,
--     errors jsonb,
--     created_at timestamp with time zone DEFAULT now() NOT NULL,
--     response_received_at timestamp with time zone,
--     status text NOT NULL,
--     CONSTRAINT hdb_action_log_status_check CHECK ((status = ANY (ARRAY['created'::text, 'processing'::text, 'completed'::text, 'error'::text])))
-- );
-- CREATE TABLE hdb_catalog.hdb_cron_event_invocation_logs (
--     id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
--     event_id text,
--     status integer,
--     request json,
--     response json,
--     created_at timestamp with time zone DEFAULT now()
-- );
-- CREATE TABLE hdb_catalog.hdb_cron_events (
--     id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
--     trigger_name text NOT NULL,
--     scheduled_time timestamp with time zone NOT NULL,
--     status text DEFAULT 'scheduled'::text NOT NULL,
--     tries integer DEFAULT 0 NOT NULL,
--     created_at timestamp with time zone DEFAULT now(),
--     next_retry_at timestamp with time zone,
--     CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
-- );
-- CREATE TABLE hdb_catalog.hdb_metadata (
--     id integer NOT NULL,
--     metadata json NOT NULL,
--     resource_version integer DEFAULT 1 NOT NULL
-- );
-- CREATE TABLE hdb_catalog.hdb_scheduled_event_invocation_logs (
--     id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
--     event_id text,
--     status integer,
--     request json,
--     response json,
--     created_at timestamp with time zone DEFAULT now()
-- );
-- CREATE TABLE hdb_catalog.hdb_scheduled_events (
--     id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
--     webhook_conf json NOT NULL,
--     scheduled_time timestamp with time zone NOT NULL,
--     retry_conf json,
--     payload json,
--     header_conf json,
--     status text DEFAULT 'scheduled'::text NOT NULL,
--     tries integer DEFAULT 0 NOT NULL,
--     created_at timestamp with time zone DEFAULT now(),
--     next_retry_at timestamp with time zone,
--     comment text,
--     CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
-- );
-- CREATE TABLE hdb_catalog.hdb_schema_notifications (
--     id integer NOT NULL,
--     notification json NOT NULL,
--     resource_version integer DEFAULT 1 NOT NULL,
--     instance_id uuid NOT NULL,
--     updated_at timestamp with time zone DEFAULT now(),
--     CONSTRAINT hdb_schema_notifications_id_check CHECK ((id = 1))
-- );
-- CREATE TABLE hdb_catalog.hdb_version (
--     hasura_uuid uuid DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
--     version text NOT NULL,
--     upgraded_on timestamp with time zone NOT NULL,
--     cli_state jsonb DEFAULT '{}'::jsonb NOT NULL,
--     console_state jsonb DEFAULT '{}'::jsonb NOT NULL
-- );
CREATE TABLE public.cities (
    id integer NOT NULL,
    name text NOT NULL,
    name_ascii text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    population bigint NOT NULL,
    density integer NOT NULL,
    source text NOT NULL,
    military boolean NOT NULL,
    incorporated boolean NOT NULL,
    timezone text NOT NULL,
    ranking smallint NOT NULL,
    zips text NOT NULL,
    state_id character varying(2) NOT NULL,
    county_fips character varying(5) NOT NULL
);
CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;
CREATE TABLE public.counties (
    fips character varying(5) NOT NULL,
    name text NOT NULL,
    state_id character varying(2)
);
CREATE TABLE public.states (
    id character varying(2) NOT NULL,
    name text NOT NULL
);
ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);
-- ALTER TABLE ONLY hdb_catalog.hdb_action_log
--     ADD CONSTRAINT hdb_action_log_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_cron_event_invocation_logs
--     ADD CONSTRAINT hdb_cron_event_invocation_logs_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_cron_events
--     ADD CONSTRAINT hdb_cron_events_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_metadata
--     ADD CONSTRAINT hdb_metadata_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_metadata
--     ADD CONSTRAINT hdb_metadata_resource_version_key UNIQUE (resource_version);
-- ALTER TABLE ONLY hdb_catalog.hdb_scheduled_event_invocation_logs
--     ADD CONSTRAINT hdb_scheduled_event_invocation_logs_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_scheduled_events
--     ADD CONSTRAINT hdb_scheduled_events_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_schema_notifications
--     ADD CONSTRAINT hdb_schema_notifications_pkey PRIMARY KEY (id);
-- ALTER TABLE ONLY hdb_catalog.hdb_version
--     ADD CONSTRAINT hdb_version_pkey PRIMARY KEY (hasura_uuid);
ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.counties
    ADD CONSTRAINT counties_pkey PRIMARY KEY (fips);
ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_name_key UNIQUE (name);
ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_pkey PRIMARY KEY (id);
-- CREATE INDEX hdb_cron_event_invocation_event_id ON hdb_catalog.hdb_cron_event_invocation_logs USING btree (event_id);
-- CREATE INDEX hdb_cron_event_status ON hdb_catalog.hdb_cron_events USING btree (status);
-- CREATE UNIQUE INDEX hdb_cron_events_unique_scheduled ON hdb_catalog.hdb_cron_events USING btree (trigger_name, scheduled_time) WHERE (status = 'scheduled'::text);
-- CREATE INDEX hdb_scheduled_event_status ON hdb_catalog.hdb_scheduled_events USING btree (status);
-- CREATE UNIQUE INDEX hdb_version_one_row ON hdb_catalog.hdb_version USING btree (((version IS NOT NULL)));
-- ALTER TABLE ONLY hdb_catalog.hdb_cron_event_invocation_logs
--     ADD CONSTRAINT hdb_cron_event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.hdb_cron_events(id) ON UPDATE CASCADE ON DELETE CASCADE;
-- ALTER TABLE ONLY hdb_catalog.hdb_scheduled_event_invocation_logs
--     ADD CONSTRAINT hdb_scheduled_event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.hdb_scheduled_events(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_county_fips_fkey FOREIGN KEY (county_fips) REFERENCES public.counties(fips) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.states(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.counties
    ADD CONSTRAINT counties_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.states(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
