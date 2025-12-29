--
-- PostgreSQL database dump
--

\restrict KeWIGlrdpvjXyrBaIEAeN7CdZa8DPbsvgYCAg2wPrH6rabaJH3QJwW8Xeh8fZPf

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.news_sources DROP CONSTRAINT IF EXISTS news_sources_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_source_id_fkey;
DROP INDEX IF EXISTS public.users_tenant_id_idx;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.tenants_slug_key;
DROP INDEX IF EXISTS public.news_sources_tenant_id_name_key;
DROP INDEX IF EXISTS public.audit_logs_timestamp_idx;
DROP INDEX IF EXISTS public.audit_logs_resource_type_resource_id_idx;
DROP INDEX IF EXISTS public.audit_logs_actor_id_idx;
DROP INDEX IF EXISTS public.articles_tenant_id_published_at_idx;
DROP INDEX IF EXISTS public.articles_tenant_id_link_key;
DROP INDEX IF EXISTS public.articles_source_id_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.news_sources DROP CONSTRAINT IF EXISTS news_sources_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.news_sources;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.articles;
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."UpdateFrequency";
DROP TYPE IF EXISTS public."SourceType";
--
-- Name: SourceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SourceType" AS ENUM (
    'NEWS',
    'BLOG',
    'SOCIAL'
);


--
-- Name: UpdateFrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UpdateFrequency" AS ENUM (
    'HOURLY',
    'DAILY',
    'WEEKLY'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'EDITOR',
    'VIEWER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id text NOT NULL,
    tenant_id text NOT NULL,
    source_id text NOT NULL,
    title text NOT NULL,
    link text NOT NULL,
    guid text,
    description text,
    content text,
    image_url text,
    published_at timestamp(3) without time zone,
    fetched_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actor_id text NOT NULL,
    actor_role text NOT NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text NOT NULL,
    ip_address text,
    user_agent text,
    old_value jsonb,
    new_value jsonb,
    metadata jsonb
);


--
-- Name: news_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_sources (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    base_url text NOT NULL,
    description text,
    type public."SourceType" NOT NULL,
    category text NOT NULL,
    update_frequency public."UpdateFrequency" DEFAULT 'HOURLY'::public."UpdateFrequency" NOT NULL,
    last_fetched_at timestamp(3) without time zone,
    credentials text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    branding_config jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    tenant_id text NOT NULL,
    role public."UserRole" DEFAULT 'VIEWER'::public."UserRole" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.articles (id, tenant_id, source_id, title, link, guid, description, content, image_url, published_at, fetched_at, created_at) FROM stdin;
a5feb23c-bc1a-4387-baed-b586e3cba896	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Trump says progress made in Ukraine talks but 'thorny issues' remain	https://www.bbc.com/news/articles/c36z615y443o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c36z615y443o#0	Both the US president and Zelensky described the talks as "great" and "terrific" but the issue of territory remains "unresolved".	Both the US president and Zelensky described the talks as "great" and "terrific" but the issue of territory remains "unresolved".	\N	2025-12-29 02:06:51	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
ea6ec6a0-6eeb-460e-8e90-39c3ddce973a	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Trump and Zelensky appear more upbeat - but show little evidence that peace is near	https://www.bbc.com/news/articles/c17x7lnd1r7o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c17x7lnd1r7o#0	Although both leaders express optimism in Florida there is no indication of progress, writes the BBC's Vitaliy Shevchenko.	Although both leaders express optimism in Florida there is no indication of progress, writes the BBC's Vitaliy Shevchenko.	\N	2025-12-29 01:05:38	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
3191c76d-eb1b-44a9-8864-30a1289ed15e	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	French cinema actress Brigitte Bardot dies aged 91	https://www.bbc.com/news/articles/cly92pr8qryo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cly92pr8qryo#0	The actress was a symbol of sexual liberation in the 1950s but became increasingly controversial after making homophobic and racist slurs.	The actress was a symbol of sexual liberation in the 1950s but became increasingly controversial after making homophobic and racist slurs.	\N	2025-12-28 13:34:26	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
d67f2d25-2ac9-426e-a816-afce7414688d	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Egyptian dissident should be deported from UK, Tories say	https://www.bbc.com/news/articles/cg5mr0gdnmeo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cg5mr0gdnmeo#0	Alaa Abdel Fattah flew to the UK on Friday after a travel ban imposed by Cairo was lifted.	Alaa Abdel Fattah flew to the UK on Friday after a travel ban imposed by Cairo was lifted.	\N	2025-12-28 19:27:54	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
8d63e32e-635e-428a-89e2-6e04901fe986	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Cold weather to ring in New Year as amber health alerts issued	https://www.bbc.com/news/articles/cx25e9yr28go?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cx25e9yr28go#0	Temperatures will fall to lows of -4C in the North West of England, with snow expected in some areas.	Temperatures will fall to lows of -4C in the North West of England, with snow expected in some areas.	\N	2025-12-28 18:06:48	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
ec79d628-9c1d-4b0f-9e0a-c7efc93ca557	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Living in fear of Lakurawa - the militant group Trump targeted in Nigeria strikes	https://www.bbc.com/news/articles/cy7vr76l521o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cy7vr76l521o#0	"We cannot live freely. You cannot even play music" - residents tell the BBC of militants' rule.	"We cannot live freely. You cannot even play music" - residents tell the BBC of militants' rule.	\N	2025-12-29 01:30:56	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
d70311c3-aadb-4f0e-8e97-24295f3f8538	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Why 2026 looks bright for Northern Light sightings	https://www.bbc.com/weather/articles/ce8nz3m3k10o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/weather/articles/ce8nz3m3k10o#0	With the Sun still in an active phase there could be more spectacular Northern light displays in the year ahead.	With the Sun still in an active phase there could be more spectacular Northern light displays in the year ahead.	\N	2025-12-29 00:58:10	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
23518c22-cca5-4f7b-b72d-87e6138d5a5d	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Mexico train crash kills 13 and injures almost 100	https://www.bbc.com/news/articles/cx2328e70y7o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cx2328e70y7o#0	An investigation is under way after the train derailed as it rounded a bend near the town of Nizanda.	An investigation is under way after the train derailed as it rounded a bend near the town of Nizanda.	\N	2025-12-29 02:15:36	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
9ef83221-a46b-48cf-9d79-90f2650285cd	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	The words from my dad that saved me as a new parent	https://www.bbc.com/news/articles/crmd80gkwkdo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/crmd80gkwkdo#0	Professor Green and Ryan Libbey open up about how fatherhood affected them and how you can protect your mental health.	Professor Green and Ryan Libbey open up about how fatherhood affected them and how you can protect your mental health.	\N	2025-12-29 00:03:04	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
70a2ebc3-0029-4a92-904c-d429f4a71654	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Brazil's Bolsonaro undergoes medical treatment for hiccups	https://www.bbc.com/news/articles/c3r7ge7937qo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c3r7ge7937qo#0	The 70-year-old had suffered with the spasms for nine months, his wife says, and was already in hospital for hernia surgery.	The 70-year-old had suffered with the spasms for nine months, his wife says, and was already in hospital for hernia surgery.	\N	2025-12-28 16:41:45	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
cbb031bd-2bc6-4577-9568-771fd5c25bb7	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Kyrgios defeats Sabalenka - but what did 'Battle of the Sexes' achieve?	https://www.bbc.com/sport/tennis/articles/cqlkqxnvdweo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/sport/tennis/articles/cqlkqxnvdweo#0	Aryna Sabalenka loses to Nick Kyrgios in a Battle of the Sexes-style match that lacked the intensity and entertainment promised in the build-up.	Aryna Sabalenka loses to Nick Kyrgios in a Battle of the Sexes-style match that lacked the intensity and entertainment promised in the build-up.	\N	2025-12-28 20:34:20	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
2cc1bf49-22ed-4f33-bd41-6acb3320e766	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	More than 300 earthquakes recorded in UK in 2025	https://www.bbc.com/news/articles/cjdr7454z9ko?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cjdr7454z9ko#0	Areas of Perthshire and the western Highlands, southern parts of Wales, and Yorkshire and Lancashire saw the most seismic activity, British Geological Survey data shows.	Areas of Perthshire and the western Highlands, southern parts of Wales, and Yorkshire and Lancashire saw the most seismic activity, British Geological Survey data shows.	\N	2025-12-29 00:02:08	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
3b6911e8-a0c3-4025-bfb8-c78e0e75ffe0	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Why are young people leaving to work abroad?	https://www.bbc.com/news/articles/c1kpv1z372lo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c1kpv1z372lo#1	Three young Britons explain why they are building their futures overseas.	Three young Britons explain why they are building their futures overseas.	\N	2025-12-29 00:02:52	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
ad6bbb14-18be-4f80-ab48-a8db8b0c3308	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	The Papers: 'Push to strip Egyptian's UK citizenship' and 'God created Bardot'	https://www.bbc.com/news/articles/cde6ey56gz3o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cde6ey56gz3o#1	Pressure mounts for Egyptian dissident to be deported from the UK, and French actress Brigitte Bardot dies aged 91	Pressure mounts for Egyptian dissident to be deported from the UK, and French actress Brigitte Bardot dies aged 91	\N	2025-12-29 01:50:41	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
441689be-8961-4e89-95df-e3474adac086	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Brigitte Bardot: The blonde bombshell who revolutionised French cinema	https://www.bbc.com/news/articles/c888rzkd0dzo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c888rzkd0dzo#1	The cocktail of kittenish charm and continental sensuality who swept away the cinematic cobwebs of the 1950s.	The cocktail of kittenish charm and continental sensuality who swept away the cinematic cobwebs of the 1950s.	\N	2025-12-28 10:18:57	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
7de7d788-089c-436a-9724-a932c9cc1fd3	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	On the trail of poachers trapping China's rare songbirds	https://www.bbc.com/news/articles/cdxw7593x9zo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cdxw7593x9zo#1	The BBC catches a man trapping songbirds - selling them is a profitable business because many keep them as pets.	The BBC catches a man trapping songbirds - selling them is a profitable business because many keep them as pets.	\N	2025-12-28 23:00:27	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
9a755258-79d8-4d2a-94d1-12007ec6dcb6	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Mum's 27-year wait for global explorer to come home	https://www.bbc.com/news/articles/cx23mwry74ko?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cx23mwry74ko#1	Angela Bushby says her first words to son Karl will be, "what time do you call this?"	Angela Bushby says her first words to son Karl will be, "what time do you call this?"	\N	2025-12-29 00:02:40	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
1a8e8ee6-8a9d-4196-a078-28e334446318	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Toxic air, broken roads and unpicked rubbish - why India's big cities are becoming unliveable 	https://www.bbc.com/news/articles/cp9kp2kx329o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cp9kp2kx329o#1	Many Indian cities rank at the bottom of liveability indexes despite big government spending on infrastructure.	Many Indian cities rank at the bottom of liveability indexes despite big government spending on infrastructure.	\N	2025-12-29 00:02:29	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
4ff27eb7-5b95-4851-8440-dc5dc7d02157	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Fireworks and first-footing: Your guide to Hogmanay in Edinburgh	https://www.bbc.com/news/articles/c3e0vj1z4evo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c3e0vj1z4evo#1	Thousands of people are expected to travel to the city for three days of celebrations.	Thousands of people are expected to travel to the city for three days of celebrations.	\N	2025-12-28 09:20:10	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
d19d9203-5548-4feb-8de2-e383670e8634	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Kosovo's ruling party wins election after months of political deadlock	https://www.bbc.com/news/articles/ce3z3w4wy0go?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/ce3z3w4wy0go#3	The decisive victory for the Albanian nationalist Vetevendosje party means a third term for leader Albin Kurti.	The decisive victory for the Albanian nationalist Vetevendosje party means a third term for leader Albin Kurti.	\N	2025-12-29 00:27:02	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
786476d4-58de-4008-945f-580ecc6721b6	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Late shopper rush drives Boxing Day sales traffic	https://www.bbc.com/news/articles/c997e2vrzz7o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c997e2vrzz7o#3	Figures suggest the surge in post-Christmas shoppers was the strongest in a decade.	Figures suggest the surge in post-Christmas shoppers was the strongest in a decade.	\N	2025-12-28 12:37:26	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
0692b5cf-8b54-4776-b02f-b580ce2356fb	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Sophie Kinsella urged me to finish my bestseller, says Jojo Moyes	https://www.bbc.com/news/articles/cvg12mje7ymo?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cvg12mje7ymo#3	Moyes has credited Kinsella with inspiring her when she nearly gave up after writing 20,000 words.	Moyes has credited Kinsella with inspiring her when she nearly gave up after writing 20,000 words.	\N	2025-12-28 13:01:40	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
dae2a24e-c40b-4e01-be56-859c3174f275	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	'Devoted' dad dies after assault outside pub	https://www.bbc.com/news/articles/cm2vjm07v17o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cm2vjm07v17o#3	Police launched a murder inquiry after David Darke, 66, died in hospital days after an assault.	Police launched a murder inquiry after David Darke, 66, died in hospital days after an assault.	\N	2025-12-28 14:45:50	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
e3717fe9-b84d-45a0-b242-873fa8ca4c69	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Child dies and two people in hospital after fire	https://www.bbc.com/news/articles/c9w7947gw72o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c9w7947gw72o#3	One child has died at the scene of the "intense" house fire in Hamstreet, Kent Fire & Rescue says.	One child has died at the scene of the "intense" house fire in Hamstreet, Kent Fire & Rescue says.	\N	2025-12-28 21:59:00	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
75e1b1e1-4191-4cef-b4da-cfda935855ae	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	New archbishop urged to scrap £100m fund over slavery links	https://www.bbc.com/news/articles/cx2e7w03067o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/cx2e7w03067o#3	A group of MPs and peers claims the funds can only legally be spent on churches and payment of clergy wages.	A group of MPs and peers claims the funds can only legally be spent on churches and payment of clergy wages.	\N	2025-12-28 10:00:30	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
48b7d2a4-9e59-48e5-b453-a0dc5d9a0f7e	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	'Remarkable' WW2 veteran dies aged 100	https://www.bbc.com/news/articles/c4g5n1n4q60o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/news/articles/c4g5n1n4q60o#3	Tributes are paid to Douglas Baldwin, who fought in Normandy when he was 18 and mined coal as a PoW.	Tributes are paid to Douglas Baldwin, who fought in Normandy when he was 18 and mined coal as a PoW.	\N	2025-12-28 18:58:28	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
494ec192-6671-4cbb-bb90-423d4b6074d7	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	BBC News app	https://www.bbc.co.uk/news/10628994?at_medium=RSS&at_campaign=rss	https://www.bbc.co.uk/news/10628994#4	Top stories, breaking news, live reporting, and follow news topics that match your interests	Top stories, breaking news, live reporting, and follow news topics that match your interests	\N	2025-04-30 14:04:28	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
9c864423-cdcc-4e19-84bd-22b83473e558	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	The Newscast Review of the Year 2025	https://www.bbc.co.uk/sounds/play/p0mqch0p?at_medium=RSS&at_campaign=rss	https://www.bbc.co.uk/sounds/play/p0mqch0p#5	The biggest events of the year and what it was like on the inside as they happened.	The biggest events of the year and what it was like on the inside as they happened.	\N	2025-12-24 12:00:00	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
fe4a9000-a3d9-4bd1-a482-67badac633ca	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Were our 2025 predictions right?	https://www.bbc.co.uk/sounds/play/p0mpqcjw?at_medium=RSS&at_campaign=rss	https://www.bbc.co.uk/sounds/play/p0mpqcjw#5	The Americast team open the annual end-of-year time capsule.	The Americast team open the annual end-of-year time capsule.	\N	2025-12-24 07:00:00	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
5f525693-85e6-4970-adf6-7c70ae29bf87	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	The magic behind your favourite Christmas music videos	https://www.bbc.co.uk/iplayer/episode/m002nnqt?at_mid=XXidf9X1FT&at_campaign=Christmas_Hits_The_Videos_That_Sleighed&at_medium=display_ad&at_campaign_type=owned&at_nation=NET&at_audience_id=SS&at_product=iplayer&at_brand=m002nnqt&at_ptr_name=bbc&at_ptr_type=media&at_format=image&at_objective=consumption&at_link_title=Christmas_Hits_The_Videos_That_Sleighed&at_bbc_team=BBC	https://www.bbc.co.uk/iplayer/episode/m002nnqt?at_mid=XXidf9X1FT&at_campaign=Christmas_Hits_The_Videos_That_Sleighed&at_medium=display_ad&at_campaign_type=owned&at_nation=NET&at_audience_id=SS&at_product=iplayer&at_brand=m002nnqt&at_ptr_name=bbc&at_ptr_type=media&at_format=image&at_objective=consumption&at_link_title=Christmas_Hits_The_Videos_That_Sleighed&at_bbc_team=BBC#6	Revealing the magic behind the making of the nation’s favourite Christmas music videos.	Revealing the magic behind the making of the nation’s favourite Christmas music videos.	\N	2025-12-13 20:04:39	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
5b2ec54b-1037-4121-a5a1-9ff131bf5ba3	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Classic World War Two film based on a true story	https://www.bbc.co.uk/iplayer/episode/b0078nd6?at_mid=aJGvLsF0PX&at_campaign=The_Great_Escape&at_medium=display_ad&at_campaign_type=owned&at_nation=NET&at_audience_id=SS&at_product=iplayer&at_brand=b0078nd6&at_ptr_name=bbc&at_ptr_type=media&at_format=image&at_objective=consumption&at_link_title=The_Great_Escape&at_bbc_team=BBC&at_creation=Film	https://www.bbc.co.uk/iplayer/episode/b0078nd6?at_mid=aJGvLsF0PX&at_campaign=The_Great_Escape&at_medium=display_ad&at_campaign_type=owned&at_nation=NET&at_audience_id=SS&at_product=iplayer&at_brand=b0078nd6&at_ptr_name=bbc&at_ptr_type=media&at_format=image&at_objective=consumption&at_link_title=The_Great_Escape&at_bbc_team=BBC&at_creation=Film#6	A group of Allied POWs mount a daring breakout from a supposedly inescapable Nazi camp.	A group of Allied POWs mount a daring breakout from a supposedly inescapable Nazi camp.	\N	2025-12-26 19:31:33	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
c089e444-527d-40e3-9d84-58d041fe0f52	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	'Watkins has the edge - but Calvert-Lewin could yet make World Cup'	https://www.bbc.com/sport/football/articles/cj69lj0w858o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/sport/football/articles/cj69lj0w858o#7	Dominic Calvert-Lewin is the top English scorer in the Premier League this season - can he force his way back into the national squad five years after his last cap?	Dominic Calvert-Lewin is the top English scorer in the Premier League this season - can he force his way back into the national squad five years after his last cap?	\N	2025-12-28 19:47:44	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
43027744-ac3a-402c-b600-5e54c2cefd8f	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Humphries survives scare to progress with Van Gerwen	https://www.bbc.com/sport/darts/articles/c4g9njnddl9o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/sport/darts/articles/c4g9njnddl9o#7	World number two Luke Humphries sees off a spirited comeback from Germany's Gabriel Clemens to progress at the PDC World Championship, while Michael van Gerwen sets up a blockbuster clash with Gary Anderson.	World number two Luke Humphries sees off a spirited comeback from Germany's Gabriel Clemens to progress at the PDC World Championship, while Michael van Gerwen sets up a blockbuster clash with Gary Anderson.	\N	2025-12-28 22:49:26	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
d3ba1438-bbdd-4152-a3a1-7c8607b1cd48	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Uncertainty and lack of form - Palace's 'flat' end to historic year	https://www.bbc.com/sport/football/articles/c62lp2jpn73o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/sport/football/articles/c62lp2jpn73o#7	After arguably the greatest year in the club's history, Crystal Palace will begin 2026 out of form and surrounded by an air of uncertainty.	After arguably the greatest year in the club's history, Crystal Palace will begin 2026 out of form and surrounded by an air of uncertainty.	\N	2025-12-28 21:51:54	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
50a6b198-aa33-4d1a-812d-0a80db7c0ec6	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	Who has made Troy's Premier League team of the week?	https://www.bbc.com/sport/football/articles/c4g4nn0j2v4o?at_medium=RSS&at_campaign=rss	https://www.bbc.com/sport/football/articles/c4g4nn0j2v4o#7	After every round of Premier League matches this season, Troy Deeney gives us his team of the week. Do you agree with his choices?	After every round of Premier League matches this season, Troy Deeney gives us his team of the week. Do you agree with his choices?	\N	2025-12-28 20:47:48	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
7dd41cdb-a9f5-4a01-a12d-9592365c2567	ddd6cce4-1bb0-470c-9139-14ea8121d66d	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	How Raya was able to execute 'absolutely brilliant' save against Brighton	https://www.bbc.com/sport/football/videos/c8xd050zzxno?at_medium=RSS&at_campaign=rss	https://www.bbc.com/sport/football/videos/c8xd050zzxno#7	Match of the day Pundit Joe Hart breaks down how David Raya was able to execute an 'absolutely brilliant' save for Arsenal in their 2-1 victory over Brighton.	Match of the day Pundit Joe Hart breaks down how David Raya was able to execute an 'absolutely brilliant' save for Arsenal in their 2-1 victory over Brighton.	\N	2025-12-29 00:00:49	2025-12-29 03:11:46.45	2025-12-29 03:11:46.45
b93c568d-9c61-4cd6-ae7b-c3e7072c8833	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Sauron, the high-end home security startup for “super premium” customers, plucks a new CEO out of Sonos	https://techcrunch.com/2025/12/28/from-sonos-to-sauron-new-ceo-takes-on-high-end-home-security-startup-still-in-development/	https://techcrunch.com/?p=3079132	Sauron is appearing on the scene as concerns rise about crime among the most wealthy.	Sauron is appearing on the scene as concerns rise about crime among the most wealthy.	\N	2025-12-29 02:20:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
4a7491da-6070-42f2-90d3-82297fb1ef23	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Police charge driver who allegedly killed a pedestrian while livestreaming on TikTok	https://techcrunch.com/2025/12/28/police-charge-driver-who-allegedly-killed-a-pedestrian-while-livestreaming-on-tiktok/	https://techcrunch.com/?p=3079136	Local police said they have charged an Illinois driver who struck and killed a pedestrian while she was livestreaming on TikTok.	Local police said they have charged an Illinois driver who struck and killed a pedestrian while she was livestreaming on TikTok.	\N	2025-12-28 21:52:52	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
f4742a7b-524c-4c94-ad76-129c6c115d53	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	You may soon be able to change your Gmail address	https://techcrunch.com/2025/12/28/you-may-soon-be-able-to-change-your-gmail-address/	https://techcrunch.com/?p=3079133	Good news for anyone tired of or embarrassed by their current Gmail address.	Good news for anyone tired of or embarrassed by their current Gmail address.	\N	2025-12-28 21:29:59	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
c8eab8f9-3c09-433a-bfa2-4e1fff66e653	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	A guide to choosing the right Apple Watch	https://techcrunch.com/2025/12/28/is-the-apple-watch-se-3-a-good-deal/	https://techcrunch.com/?p=3047850	The gap between Apple's standard and budget smart watches has never felt smaller.	The gap between Apple's standard and budget smart watches has never felt smaller.	\N	2025-12-28 20:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
1ae28932-bba2-4beb-9a60-71b2801f1c59	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Why WeTransfer’s co-founder is building another file transfer service	https://techcrunch.com/2025/12/28/why-wetransfer-co-founder-is-building-another-file-transfer-service/	https://techcrunch.com/?p=3078471	WeTransfer co-founder Nalden has a new file transfer service that users can use without logging in.	WeTransfer co-founder Nalden has a new file transfer service that users can use without logging in.	\N	2025-12-28 18:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
bc6c9f4c-e0b1-4fce-b81b-c74766a432b1	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	MayimFlow wants to stop data center leaks before they happen	https://techcrunch.com/2025/12/28/mayimflow-wants-to-stop-data-center-leaks-before-they-happen/	https://techcrunch.com/?p=3078627	Leaks cause damage, down time, and cost money. MayimFlow's founder John Khazraee wants to change that.	Leaks cause damage, down time, and cost money. MayimFlow's founder John Khazraee wants to change that.	\N	2025-12-28 16:30:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
fa5784d8-76e1-49f6-a057-5ccf92878c2c	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	The 33 top health and wellness startups from Disrupt Startup Battlefield	https://techcrunch.com/2025/12/28/the-33-top-health-and-wellness-startups-from-disrupt-startup-battlefield/	https://techcrunch.com/?p=3076759	Here is the full list of the health and wellness Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	Here is the full list of the health and wellness Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	\N	2025-12-28 16:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
fa8c8c2f-35cb-4f3e-ab20-1b1ea2e3f28f	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	The Google Pixel Watch 4 made me like smartwatches again	https://techcrunch.com/2025/12/28/the-google-pixel-watch-4-made-me-like-smartwatches-again/	https://techcrunch.com/?p=3078477	Google's Pixel Watch 4 is an excellent smartwatch with fast charging and great design.	Google's Pixel Watch 4 is an excellent smartwatch with fast charging and great design.	\N	2025-12-28 16:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
9c33f4f0-4524-43e0-993f-02be3936ba8c	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	OpenAI is looking for a new Head of Preparedness	https://techcrunch.com/2025/12/28/openai-is-looking-for-a-new-head-of-preparedness/	https://techcrunch.com/?p=3079125	OpenAI is looking to hire a new executive responsible for studying emerging AI-related risks in areas ranging from computer security to mental health.	OpenAI is looking to hire a new executive responsible for studying emerging AI-related risks in areas ranging from computer security to mental health.	\N	2025-12-28 15:08:19	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
874e564a-495c-481b-88e3-0da2532f2559	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	The 14 fintech, real estate, proptech startups from Disrupt Startup Battlefield 	https://techcrunch.com/2025/12/28/the-14-fintech-real-estate-proptech-startups-from-disrupt-startup-battlefield/	https://techcrunch.com/?p=3077494	Here is the full list of the fintech, real estate, and proptech Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	Here is the full list of the fintech, real estate, and proptech Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	\N	2025-12-28 15:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
ba2bc8a7-10fe-4418-9d38-dacf49403d7b	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Best Apple Watch apps for boosting your productivity	https://techcrunch.com/2025/12/27/best-apple-watch-apps-for-boosting-your-productivity/	https://techcrunch.com/?p=2921769	Although the Apple Watch comes with simple built-in productivity apps like Reminders and Calendar, it’s worth exploring some third-party apps that are designed to boost productivity by offering additional functionality.	Although the Apple Watch comes with simple built-in productivity apps like Reminders and Calendar, it’s worth exploring some third-party apps that are designed to boost productivity by offering additional functionality.	\N	2025-12-28 02:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
2cb7332b-2bca-48ba-b621-786767c2df4d	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	India startup funding hits $11B in 2025 as investors grow more selective	https://techcrunch.com/2025/12/27/india-startup-funding-hits-11b-in-2025-as-investors-grow-more-selective/	https://techcrunch.com/?p=3079055	Startup funding rounds in India fell sharply in 2025 as investors concentrated capital into fewer companies.	Startup funding rounds in India fell sharply in 2025 as investors concentrated capital into fewer companies.	\N	2025-12-28 01:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
98dbd22a-8284-4800-8975-83001476a5f3	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	FaZe Clan’s future is uncertain after influencers depart	https://techcrunch.com/2025/12/27/faze-clans-future-is-uncertain-after-influencers-depart/	https://techcrunch.com/?p=3079121	Six influencers recently announced that they are leaving esports group FaZe Clan following unsuccessful contract negotiations with new management.	Six influencers recently announced that they are leaving esports group FaZe Clan following unsuccessful contract negotiations with new management.	\N	2025-12-27 20:39:07	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
bebc8b3d-fee7-4921-9e5c-f118c7c11225	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Trump administration seeks to deport hate speech researcher previously sued by X	https://techcrunch.com/2025/12/27/trump-administration-seeks-to-deport-hate-speech-researcher-previously-sued-by-x/	https://techcrunch.com/?p=3079117	A federal judge has temporarily blocked the U.S. Department of State from arresting or deporting Imran Ahmed, CEO of the Center for Countering Digital Hate.	A federal judge has temporarily blocked the U.S. Department of State from arresting or deporting Imran Ahmed, CEO of the Center for Countering Digital Hate.	\N	2025-12-27 20:13:32	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
f2a3c9f9-ebca-4a37-abd3-da01e04dd6ac	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Investors share what to remember while raising a Series A	https://techcrunch.com/2025/12/27/investors-share-what-to-remember-while-raising-a-series-a/	https://techcrunch.com/?p=3078443	Investors share what founders should remember if looking to raise a Series A.	Investors share what founders should remember if looking to raise a Series A.	\N	2025-12-27 19:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
6471aaeb-8688-4386-8e35-c9103482a015	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	Meet the team that investigates when journalists and activists get hacked with government spyware	https://techcrunch.com/2025/12/27/meet-the-team-that-investigates-when-journalists-and-activists-get-hacked-with-government-spyware/	https://techcrunch.com/?p=3076051	For years, Access Now’s Digital Security Helpline has been aiding journalists and dissidents who have been targeted with government spyware. This is how they operate.	For years, Access Now’s Digital Security Helpline has been aiding journalists and dissidents who have been targeted with government spyware. This is how they operate.	\N	2025-12-27 18:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
aa103aa2-def3-42cb-b981-fc85a294ea01	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	The 22 top clean tech and energy startups from Disrupt Startup Battlefield	https://techcrunch.com/2025/12/27/the-22-top-clean-tech-and-energy-startups-from-disrupt-startup-battlefield/	https://techcrunch.com/?p=3076685	Here is the full list of the clean tech and energy Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	Here is the full list of the clean tech and energy Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	\N	2025-12-27 16:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
ffb9e286-a3c0-48cc-9337-aab4173ec234	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	NY Governor Hochul signs bill requiring warning labels on ‘addictive’ social media	https://techcrunch.com/2025/12/27/ny-governor-hochul-signs-bill-requiring-warning-labels-on-addictive-social-media/	https://techcrunch.com/?p=3079108	New York Governor Kathy Hochul signed a bill requiring social media platforms to show warning labels to younger users before they’re exposed to features such as autoplay and infinite scrolling.	New York Governor Kathy Hochul signed a bill requiring social media platforms to show warning labels to younger users before they’re exposed to features such as autoplay and infinite scrolling.	\N	2025-12-27 15:51:08	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
6f829d6a-90e2-47b9-ae28-9c0f5de46594	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	The 7 top space and defense tech startups from Disrupt Startup Battlefield 	https://techcrunch.com/2025/12/27/the-7-top-space-and-defense-tech-startups-from-disrupt-startup-battlefield/	https://techcrunch.com/?p=3077205	Here is the full list of the space and defense tech Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	Here is the full list of the space and defense tech Startup Battlefield 200 selectees, along with a note on what made us select them for the competition.	\N	2025-12-27 15:00:00	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
a7513b9c-6e98-47d2-8176-07424135e5ec	ddd6cce4-1bb0-470c-9139-14ea8121d66d	df448ebf-b4a5-4ecf-a82d-a5df16351555	How reality crushed Ÿnsect, the French startup that had raised over $600M for insect farming	https://techcrunch.com/2025/12/26/how-reality-crushed-ynsect-the-french-startup-that-had-raised-over-600m-for-insect-farming/	https://techcrunch.com/?p=3078827	French insect farming company Ÿnsect was recently placed into judicial liquidation for insolvency, despite raising over $600 million.	French insect farming company Ÿnsect was recently placed into judicial liquidation for insolvency, despite raising over $600 million.	\N	2025-12-26 22:52:08	2025-12-29 03:14:55.492	2025-12-29 03:14:55.492
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "timestamp", actor_id, actor_role, action, resource_type, resource_id, ip_address, user_agent, old_value, new_value, metadata) FROM stdin;
3fd5fc26-c36a-4cc5-ae8c-e185dc6a550d	2025-12-29 02:24:47.413	SEED_SCRIPT	SYSTEM	TENANT_CREATE	Tenant	ddd6cce4-1bb0-470c-9139-14ea8121d66d	\N	\N	\N	{"name": "Demo Organization"}	\N
31c6d9ba-8468-4c53-9ce0-e18342e03329	2025-12-29 02:33:39.679	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	USER_LOGIN	User	fe065cd6-45dd-45ec-ad63-98123e2f6b63	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"lastLogin": "2025-12-29T02:33:39.669Z"}	\N
afa5e665-a603-4b3e-9680-bcb570a6253e	2025-12-29 02:34:46.102	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	SOURCE_CREATE	NewsSource	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"name": "BBCI", "type": "NEWS", "baseUrl": "http://feeds.bbci.co.uk/news/rss.xml", "category": "News", "description": "BBCI New", "updateFrequency": "DAILY"}	\N
be1721ce-44cd-4b58-b5bc-3e5c7e774527	2025-12-29 02:34:51.181	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	SOURCE_SYNC	NewsSource	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"itemsCount": 37}	\N
d6238f98-49b3-4709-85c9-d2129dd926cd	2025-12-29 02:49:02.468	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	USER_LOGIN	User	fe065cd6-45dd-45ec-ad63-98123e2f6b63	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.104.3 Chrome/138.0.7204.251 Electron/37.6.1 Safari/537.36	\N	{"lastLogin": "2025-12-29T02:49:02.466Z"}	\N
8c263cf0-5445-407d-a9a9-f14baa603c9f	2025-12-29 03:11:46.52	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	SOURCE_SYNC	NewsSource	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"itemsFetched": 37, "itemsInserted": 36}	\N
db319780-0ec4-4447-a2f6-84914f4287ab	2025-12-29 03:12:02.951	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	SOURCE_SYNC	NewsSource	3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"itemsFetched": 37, "itemsInserted": 0}	\N
0089e2c6-7a40-4254-87a5-bebfd6f9ba16	2025-12-29 03:14:52.904	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	SOURCE_CREATE	NewsSource	df448ebf-b4a5-4ecf-a82d-a5df16351555	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"name": "TechCrunch", "type": "NEWS", "baseUrl": "https://techcrunch.com/feed/", "category": "Technology", "description": "Tech Crunch News", "updateFrequency": "DAILY"}	\N
4b5982aa-bad8-493e-a04b-da622f81bb11	2025-12-29 03:14:55.53	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	SOURCE_SYNC	NewsSource	df448ebf-b4a5-4ecf-a82d-a5df16351555	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	{"itemsFetched": 20, "itemsInserted": 20}	\N
a819172f-8bab-4e28-abc4-e0202a25e235	2025-12-29 03:20:21.976	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	USER_LOGIN	User	fe065cd6-45dd-45ec-ad63-98123e2f6b63	::1	node	\N	{"lastLogin": "2025-12-29T03:20:21.973Z"}	\N
2770590d-ccd0-403c-9092-9620c4cb4c90	2025-12-29 03:20:44.936	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	USER_LOGIN	User	fe065cd6-45dd-45ec-ad63-98123e2f6b63	::1	node	\N	{"lastLogin": "2025-12-29T03:20:44.934Z"}	\N
cdbcb7cd-585b-4a66-b864-db1aa0c65531	2025-12-29 03:22:16.41	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	USER_LOGIN	User	fe065cd6-45dd-45ec-ad63-98123e2f6b63	::1	node	\N	{"lastLogin": "2025-12-29T03:22:16.409Z"}	\N
768aab5c-19c8-4721-af82-7ba284e5083f	2025-12-29 03:22:26.564	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	USER_LOGIN	User	fe065cd6-45dd-45ec-ad63-98123e2f6b63	::1	node	\N	{"lastLogin": "2025-12-29T03:22:26.562Z"}	\N
8b8573e6-c129-42bd-8ff8-f52f15fff658	2025-12-29 04:18:34.996	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	AI_SEO_GENERATE	AI	seo-gen	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	{"titleLength": 103, "contentLength": 85}
c6796810-f166-419e-9d14-598562b96066	2025-12-29 04:20:11.672	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	AI_GRAMMAR_CHECK	AI	grammar-check	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	{"contentLength": 123}
cd610c09-b8a0-45dd-89f5-0d76a112fb9f	2025-12-29 04:21:00.449	fe065cd6-45dd-45ec-ad63-98123e2f6b63	ADMIN	AI_SEO_GENERATE	AI	seo-gen	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	{"titleLength": 6, "contentLength": 123}
\.


--
-- Data for Name: news_sources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news_sources (id, tenant_id, name, base_url, description, type, category, update_frequency, last_fetched_at, credentials, is_active, created_at, updated_at) FROM stdin;
3dbe3fda-8f13-4991-a3b4-4467fcaa0d5e	ddd6cce4-1bb0-470c-9139-14ea8121d66d	BBCI	http://feeds.bbci.co.uk/news/rss.xml	BBCI New	NEWS	News	DAILY	2025-12-29 03:12:02.936	\N	t	2025-12-29 02:34:46.095	2025-12-29 03:12:02.938
df448ebf-b4a5-4ecf-a82d-a5df16351555	ddd6cce4-1bb0-470c-9139-14ea8121d66d	TechCrunch	https://techcrunch.com/feed/	Tech Crunch News	NEWS	Technology	DAILY	2025-12-29 03:14:55.522	\N	t	2025-12-29 03:14:52.895	2025-12-29 03:14:55.524
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, name, slug, branding_config, created_at, updated_at) FROM stdin;
ddd6cce4-1bb0-470c-9139-14ea8121d66d	Demo Organization	demo-tenant	{"color": "blue"}	2025-12-29 02:24:47.321	2025-12-29 02:24:47.321
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, tenant_id, role, created_at, updated_at) FROM stdin;
fe065cd6-45dd-45ec-ad63-98123e2f6b63	admin@demo.com	$2b$10$ePSxdUgoAGLvR2BWq/MMluKLZoFP/yRwQR/0BxI.yDlLzgXU9Oq2W	ddd6cce4-1bb0-470c-9139-14ea8121d66d	ADMIN	2025-12-29 02:24:47.399	2025-12-29 02:24:47.399
\.


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: news_sources news_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_sources
    ADD CONSTRAINT news_sources_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: articles_source_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_source_id_idx ON public.articles USING btree (source_id);


--
-- Name: articles_tenant_id_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX articles_tenant_id_link_key ON public.articles USING btree (tenant_id, link);


--
-- Name: articles_tenant_id_published_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_tenant_id_published_at_idx ON public.articles USING btree (tenant_id, published_at);


--
-- Name: audit_logs_actor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_actor_id_idx ON public.audit_logs USING btree (actor_id);


--
-- Name: audit_logs_resource_type_resource_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_resource_type_resource_id_idx ON public.audit_logs USING btree (resource_type, resource_id);


--
-- Name: audit_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_timestamp_idx ON public.audit_logs USING btree ("timestamp");


--
-- Name: news_sources_tenant_id_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_sources_tenant_id_name_key ON public.news_sources USING btree (tenant_id, name);


--
-- Name: tenants_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_tenant_id_idx ON public.users USING btree (tenant_id);


--
-- Name: articles articles_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.news_sources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles articles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: news_sources news_sources_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_sources
    ADD CONSTRAINT news_sources_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KeWIGlrdpvjXyrBaIEAeN7CdZa8DPbsvgYCAg2wPrH6rabaJH3QJwW8Xeh8fZPf

