# Project Oath schema reference

This is the table schema supplied by the user on October 30, 2026. It is
reference material for agents working on Project Oath, not an executable
migration: table order and constraints may not be valid for execution.
The RLS snapshot below was supplied separately. Grants, triggers, functions,
indexes, scheduled jobs, and application behavior are not included. Obtain and
inspect those before designing or applying changes.

The current workspace is a personal portfolio, not the Project Oath application.
Do not assume this snapshot matches a live database or that changes here deploy
to Project Oath.

An October 30 functions, triggers, and grants export was also supplied. A
security-conscious summary is in [v2.md](./v2.md); the raw export is not copied
here because trigger definitions can contain authorization material.

## Supplied table definitions

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  email text,
  dob date,
  guardian_email text,
  student_type text CHECK (student_type = ANY (ARRAY['high_school'::text, 'college'::text, 'grad_medical'::text])),
  grade text,
  state_country text,
  intended_majors ARRAY DEFAULT '{}'::text[],
  college_types ARRAY DEFAULT '{}'::text[],
  help_areas ARRAY DEFAULT '{}'::text[],
  available_days ARRAY DEFAULT '{}'::text[],
  timezone text,
  about_self text,
  background_info text,
  referral text,
  profile_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  credits integer NOT NULL DEFAULT 0 CHECK (credits >= 0),
  mentor_id uuid,
  rating numeric CHECK (rating IS NULL OR rating >= 0::numeric AND rating <= 5::numeric),
  rating_count integer NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  race_identity ARRAY DEFAULT '{}'::text[],
  race_self_describe text,
  ethnicity text CHECK (ethnicity IS NULL OR (ethnicity = ANY (ARRAY['hispanic_or_latino'::text, 'not_hispanic_or_latino'::text, 'prefer_not_to_answer'::text]))),
  low_income_background text CHECK (low_income_background IS NULL OR (low_income_background = ANY (ARRAY['yes'::text, 'no'::text, 'prefer_not_to_answer'::text]))),
  current_school text,
  school_location text,
  graduation_year text,
  gpa text,
  sat_score text,
  act_score text,
  applying_early text CHECK (applying_early IS NULL OR (applying_early = ANY (ARRAY['yes'::text, 'no'::text, 'unsure'::text]))),
  mcat_score text,
  major_other text,
  specialty_interests ARRAY DEFAULT '{}'::text[],
  specialty_other text,
  service_areas ARRAY DEFAULT '{}'::text[],
  available_time_ranges jsonb DEFAULT '{}'::jsonb,
  community_agreement_accepted boolean DEFAULT false,
  community_agreement_accepted_at timestamp with time zone,
  booking_cost integer NOT NULL DEFAULT 0 CHECK (booking_cost >= 0),
  locked_credits integer NOT NULL DEFAULT 0 CHECK (locked_credits >= 0),
  gender text,
  pronouns text,
  survey_completed boolean DEFAULT false,
  weekly_session_limit integer,
  recommended_mentor_id uuid,
  mentor_change_req_no integer NOT NULL DEFAULT 0,
  cancellation_count integer NOT NULL DEFAULT 0,
  phone text,
  sms_opt_in boolean DEFAULT false,
  sms_opt_in_at timestamp with time zone,
  is_deleted boolean NOT NULL DEFAULT false,
  no_show_count integer NOT NULL DEFAULT 0 CHECK (no_show_count >= 0),
  no_show_booking_blocked boolean NOT NULL DEFAULT false,
  parent_perm boolean,
  avatar_config jsonb NOT NULL DEFAULT '{"style": "dylan", "options": {}}'::jsonb CHECK (jsonb_typeof(avatar_config) = 'object'::text),
  end_survey_completed boolean NOT NULL DEFAULT false,
  medical_mentor_survey_completed boolean NOT NULL DEFAULT false,
  continuing_next_cohort boolean NOT NULL DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id),
  CONSTRAINT profiles_recommended_mentor_id_fkey FOREIGN KEY (recommended_mentor_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.admins (
  id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  title text,
  poc_high_school boolean NOT NULL DEFAULT false,
  poc_college boolean NOT NULL DEFAULT false,
  poc_grad_medical boolean NOT NULL DEFAULT false,
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])),
  credits_delta integer,
  mentee_rating numeric CHECK (mentee_rating IS NULL OR mentee_rating >= 0::numeric AND mentee_rating <= 5::numeric),
  rating_notes text,
  session_notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  meeting_url text,
  meeting_provider text,
  cancellation_reason text,
  time_suggestion text,
  locked_credits integer NOT NULL DEFAULT 0 CHECK (locked_credits >= 0),
  no_show_party text CHECK (no_show_party = ANY (ARRAY['mentor'::text, 'mentee'::text])),
  gcal_event_id text,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id),
  CONSTRAINT sessions_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.profiles(id),
  CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  student_type text NOT NULL CHECK (student_type = ANY (ARRAY['high_school'::text, 'college'::text, 'grad_medical'::text])),
  grad_year text,
  CONSTRAINT waitlist_pkey PRIMARY KEY (id)
);

CREATE TABLE public.profile_mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_mentors_pkey PRIMARY KEY (id),
  CONSTRAINT profile_mentors_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.profiles(id),
  CONSTRAINT profile_mentors_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  submitter_id uuid NOT NULL,
  submission_type text NOT NULL CHECK (submission_type = ANY (ARRAY['college_essay'::text, 'activity_description'::text, 'personal_statement'::text])),
  requested_reviewer_id uuid,
  assigned_reviewer_id uuid,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'assigned'::text, 'reviewed'::text])),
  credit_cost integer NOT NULL DEFAULT 1 CHECK (credit_cost >= 0),
  notes text,
  file_url text,
  review_text text,
  reviewed_at timestamp with time zone,
  locked_credits integer NOT NULL DEFAULT 0 CHECK (locked_credits >= 0),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_submitter_id_fkey FOREIGN KEY (submitter_id) REFERENCES public.profiles(id),
  CONSTRAINT submissions_requested_reviewer_id_fkey FOREIGN KEY (requested_reviewer_id) REFERENCES public.profiles(id),
  CONSTRAINT submissions_assigned_reviewer_id_fkey FOREIGN KEY (assigned_reviewer_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.session_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  session_id uuid NOT NULL,
  rater_id uuid NOT NULL,
  ratee_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  want_to_work_again boolean,
  worth_credits text,
  addressed_needs text,
  areas_covered ARRAY DEFAULT '{}'::text[],
  confidence_level integer,
  flag_issues text,
  CONSTRAINT session_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT session_ratings_rater_id_fkey FOREIGN KEY (rater_id) REFERENCES public.profiles(id),
  CONSTRAINT session_ratings_ratee_id_fkey FOREIGN KEY (ratee_id) REFERENCES public.profiles(id),
  CONSTRAINT session_ratings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

CREATE TABLE public.signup_allowed (
  student_type text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  CONSTRAINT signup_allowed_pkey PRIMARY KEY (student_type)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  target_user_id uuid,
  target_student_type text,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT notifications_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.notification_reads (
  notification_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_reads_pkey PRIMARY KEY (notification_id, user_id),
  CONSTRAINT notification_reads_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id),
  CONSTRAINT notification_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'reviewed'::text, 'resolved'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.session_email_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['booking_created'::text, 'booking_cancelled'::text, 'booking_sms_reminder_mentor'::text, 'booking_sms_reminder_mentee'::text])),
  resend_email_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  twilio_sid text,
  CONSTRAINT session_email_events_pkey PRIMARY KEY (id),
  CONSTRAINT session_email_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT session_email_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.mentor_change_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'resolved'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_change_requests_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_change_requests_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.booking_allowed (
  student_type text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  CONSTRAINT booking_allowed_pkey PRIMARY KEY (student_type)
);

CREATE TABLE public.beginning_surveys (
  id uuid NOT NULL,
  application_cycle text,
  confidence_level integer,
  support_level integer,
  current_mentor text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT beginning_surveys_pkey PRIMARY KEY (id),
  CONSTRAINT beginning_surveys_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.login_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_in_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  email text,
  CONSTRAINT login_events_pkey PRIMARY KEY (id),
  CONSTRAINT login_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.deleted_sessions_analytics (
  id uuid NOT NULL,
  total_sessions integer NOT NULL DEFAULT 0,
  mentor_sessions integer NOT NULL DEFAULT 0,
  mentee_sessions integer NOT NULL DEFAULT 0,
  completed_sessions integer NOT NULL DEFAULT 0,
  scheduled_sessions integer NOT NULL DEFAULT 0,
  cancelled_sessions integer NOT NULL DEFAULT 0,
  no_show_sessions integer NOT NULL DEFAULT 0,
  no_show_as_mentor integer NOT NULL DEFAULT 0,
  no_show_as_mentee integer NOT NULL DEFAULT 0,
  credits_delta_sum integer NOT NULL DEFAULT 0,
  weekly_no_show jsonb NOT NULL DEFAULT '{}'::jsonb,
  weekly_completed jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT deleted_sessions_analytics_pkey PRIMARY KEY (id)
);

CREATE TABLE public.medical_mentor_surveys (
  id uuid NOT NULL,
  motivations ARRAY NOT NULL DEFAULT '{}'::text[],
  motivation_other text,
  challenge text,
  training text,
  match_quality integer CHECK (match_quality >= 1 AND match_quality <= 5),
  platform_ease integer CHECK (platform_ease >= 1 AND platform_ease <= 5),
  technical_issues text,
  technical_details text,
  least_helpful text,
  recommendation integer CHECK (recommendation >= 0 AND recommendation <= 10),
  anything_else text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medical_mentor_surveys_pkey PRIMARY KEY (id),
  CONSTRAINT medical_mentor_surveys_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.end_surveys (
  id uuid NOT NULL,
  motivations ARRAY NOT NULL DEFAULT '{}'::text[],
  motivation_other text,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
  support_level integer CHECK (support_level >= 1 AND support_level <= 5),
  current_mentor text,
  confidence_change text,
  helpful_parts ARRAY NOT NULL DEFAULT '{}'::text[],
  helpful_other text,
  least_helpful text,
  support_need text,
  application_stage text,
  technical_issues text,
  technical_details text,
  platform_ease integer CHECK (platform_ease >= 1 AND platform_ease <= 5),
  rules_clarity integer CHECK (rules_clarity >= 1 AND rules_clarity <= 5),
  mentoring_challenge text,
  training text,
  high_school_match_quality integer CHECK (high_school_match_quality >= 1 AND high_school_match_quality <= 5),
  recommendation integer CHECK (recommendation >= 0 AND recommendation <= 10),
  anything_else text,
  targeted_reason text,
  targeted_scheduling text,
  targeted_suggestion text,
  targeted_setup text,
  targeted_difficulty text,
  targeted_would_redeem text,
  consistent_follow_through text,
  consistent_routine text,
  consistent_motivation text,
  consistent_advice text,
  consistent_ease text,
  testimonial text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT end_surveys_pkey PRIMARY KEY (id),
  CONSTRAINT end_surveys_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.cohort_details (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cohort_title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT false,
  CONSTRAINT cohort_details_pkey PRIMARY KEY (id)
);

CREATE TABLE public.priority_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  student_type text NOT NULL CHECK (student_type = ANY (ARRAY['high_school'::text, 'college'::text, 'grad_medical'::text])),
  grad_year text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT priority_access_pkey PRIMARY KEY (id)
);

CREATE TABLE public.waitlist_settings (
  id smallint NOT NULL CHECK (id = 1),
  priority_access_enabled boolean NOT NULL DEFAULT false,
  CONSTRAINT waitlist_settings_pkey PRIMARY KEY (id)
);
```

## Row-level security snapshot

Export supplied by the user on October 30, 2026. Each table's policies are
shown as returned by `pg_policies`; this is not executable SQL and does not
include grants or function definitions. PostgreSQL combines permissive
policies with OR, so one permissive policy can allow access independently of
other policies.
### `public.admins`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can delete admins",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "DELETE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can insert admins",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Admins can update admins",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Admins can view admins",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can view admins table",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.beginning_surveys`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can view all beginning surveys",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Users can insert own survey",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = id)"
  },
  {
    "name": "Users can view own survey",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.booking_allowed`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "admins manage booking_allowed",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "ALL",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "public read booking_allowed",
    "roles": [
      "public"
    ],
    "using": "true",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.cohort_details`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can delete cohort details",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "DELETE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can insert cohort details",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))"
  },
  {
    "name": "Admins can update cohort details",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))"
  },
  {
    "name": "Admins can view cohort details",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Authenticated users can view current and upcoming cohorts",
    "roles": [
      "authenticated"
    ],
    "using": "((is_current = true) OR (start_date >= CURRENT_DATE))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.deleted_sessions_analytics`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can read deleted sessions analytics",
    "roles": [
      "authenticated"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Service role full access deleted sessions analytics",
    "roles": [
      "service_role"
    ],
    "using": "true",
    "command": "ALL",
    "permissive": "PERMISSIVE",
    "with_check": "true"
  }
]
```

### `public.end_surveys`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can view end surveys",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Members can view their own end survey",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.feedback`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can delete feedback",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "DELETE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can update feedback",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Admins can view all feedback",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Users can insert own feedback",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "name": "Users can view own feedback",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = user_id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.login_events`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can read login events",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Users can insert own login events",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = user_id)"
  }
]
```

### `public.medical_mentor_surveys`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can view medical mentor surveys",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Members can view their own medical mentor survey",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.mentor_change_requests`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "admin_delete",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "DELETE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "admin_select_all",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "admin_update",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "mentee_insert_own",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = mentee_id)"
  },
  {
    "name": "mentee_select_own",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = mentee_id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.notification_reads`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Users can mark notifications read",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "name": "Users can read own read receipts",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = user_id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.notifications`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can delete notifications",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "DELETE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can insert notifications",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))"
  },
  {
    "name": "Authenticated users can read notifications",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() IS NOT NULL)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.priority_access`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can read priority access",
    "roles": [
      "authenticated"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Public can submit priority access",
    "roles": [
      "anon",
      "authenticated"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "true"
  }
]
```

### `public.profile_mentors`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can manage mentor assignments",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "ALL",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Linked users can view their mentor links",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = mentee_id) OR (auth.uid() = mentor_id) OR is_admin())",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Mentees can view their assigned mentors",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = mentee_id) OR is_admin())",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.profiles`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can update profiles",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Linked users can view counterpart profiles",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM profile_mentors pm\n  WHERE (((pm.mentee_id = auth.uid()) AND (pm.mentor_id = profiles.id)) OR ((pm.mentor_id = auth.uid()) AND (pm.mentee_id = profiles.id)))))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Session counterparts can view profiles",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM sessions s\n  WHERE (((s.mentee_id = auth.uid()) AND (s.mentor_id = profiles.id)) OR ((s.mentor_id = auth.uid()) AND (s.mentee_id = profiles.id)))))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Submission counterparts can view profiles",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM submissions sub\n  WHERE (((sub.assigned_reviewer_id = auth.uid()) AND (sub.submitter_id = profiles.id)) OR ((sub.submitter_id = auth.uid()) AND (sub.assigned_reviewer_id = profiles.id)))))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Users can insert own profile",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = id)"
  },
  {
    "name": "Users can update own profile",
    "roles": [
      "public"
    ],
    "using": "(auth.uid() = id)",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = id)"
  },
  {
    "name": "Users can view own profile",
    "roles": [
      "public"
    ],
    "using": "can_view_profile(id, mentor_id)",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.session_email_events`

RLS enabled: `true`; forced: `false`.

```json
[]
```

### `public.session_ratings`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Users can submit their own ratings",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = rater_id)"
  },
  {
    "name": "Users can view ratings involving them",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = rater_id) OR (auth.uid() = ratee_id) OR is_admin())",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.sessions`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can delete sessions",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "DELETE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can insert sessions",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Admins can update sessions",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Admins can view sessions",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Members can view own sessions",
    "roles": [
      "public"
    ],
    "using": "(is_admin() OR (auth.uid() = mentor_id) OR (auth.uid() = mentee_id))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Mentees can book their assigned mentors",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin() OR ((auth.uid() = mentee_id) AND (EXISTS ( SELECT 1\n   FROM profile_mentors pm\n  WHERE ((pm.mentee_id = auth.uid()) AND (pm.mentor_id = sessions.mentor_id))))))"
  },
  {
    "name": "Mentees can insert sessions",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = mentee_id)"
  },
  {
    "name": "Mentees can view mentor sessions for availability",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = mentor_id) OR (auth.uid() = mentee_id) OR (status = 'scheduled'::text))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Participants can update own sessions",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = mentor_id) OR (auth.uid() = mentee_id) OR is_admin())",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Participants can update their sessions",
    "roles": [
      "public"
    ],
    "using": "(is_admin() OR (auth.uid() = mentor_id) OR (auth.uid() = mentee_id))",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin() OR (auth.uid() = mentor_id) OR (auth.uid() = mentee_id))"
  },
  {
    "name": "Participants can view own sessions",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = mentor_id) OR (auth.uid() = mentee_id) OR is_admin())",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Participants can view their sessions",
    "roles": [
      "public"
    ],
    "using": "(is_admin() OR (auth.uid() = mentor_id) OR (auth.uid() = mentee_id))",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.signup_allowed`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can update signup_allowed",
    "roles": [
      "public"
    ],
    "using": "(EXISTS ( SELECT 1\n   FROM admins\n  WHERE (admins.id = auth.uid())))",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Public can read signup availability",
    "roles": [
      "public"
    ],
    "using": "true",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Public can read signup_allowed",
    "roles": [
      "public"
    ],
    "using": "true",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.submissions`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can manage submissions",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "ALL",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Admins can update submissions",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Reviewers can update assigned submissions",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = assigned_reviewer_id) OR is_admin())",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "((auth.uid() = assigned_reviewer_id) OR is_admin())"
  },
  {
    "name": "Submitters can insert own submissions",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = submitter_id)"
  },
  {
    "name": "Submitters can view own submissions",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = submitter_id) OR (auth.uid() = assigned_reviewer_id) OR is_admin())",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Users can create submissions",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "(auth.uid() = submitter_id)"
  },
  {
    "name": "Users can view their own submissions",
    "roles": [
      "public"
    ],
    "using": "((auth.uid() = submitter_id) OR (auth.uid() = assigned_reviewer_id) OR is_admin())",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```

### `public.waitlist`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can read waitlist",
    "roles": [
      "public"
    ],
    "using": "is_admin()",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  },
  {
    "name": "Anyone can join waitlist",
    "roles": [
      "public"
    ],
    "using": null,
    "command": "INSERT",
    "permissive": "PERMISSIVE",
    "with_check": "true"
  }
]
```

### `public.waitlist_settings`

RLS enabled: `true`; forced: `false`.

```json
[
  {
    "name": "Admins can update waitlist settings",
    "roles": [
      "authenticated"
    ],
    "using": "is_admin()",
    "command": "UPDATE",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin()"
  },
  {
    "name": "Public can read waitlist settings",
    "roles": [
      "public"
    ],
    "using": "true",
    "command": "SELECT",
    "permissive": "PERMISSIVE",
    "with_check": null
  }
]
```
