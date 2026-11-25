create table users (
    id uuid primary key,
    email varchar(255) not null,
    password_hash varchar(100) not null,
    display_name varchar(80) not null,
    plan varchar(16) not null default 'FREE',
    created_at timestamp with time zone not null
);

create unique index ux_users_email on users (email);

create table refresh_tokens (
    id uuid primary key,
    user_id uuid not null references users (id) on delete cascade,
    token_hash varchar(64) not null,
    expires_at timestamp with time zone not null,
    revoked boolean not null default false,
    created_at timestamp with time zone not null
);

create unique index ux_refresh_tokens_hash on refresh_tokens (token_hash);
create index ix_refresh_tokens_user on refresh_tokens (user_id);

create table projects (
    id uuid primary key,
    owner_id uuid not null references users (id) on delete cascade,
    name varchar(120) not null,
    slug varchar(120) not null,
    status varchar(20) not null default 'DRAFT',
    version bigint not null default 0,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    last_saved_at timestamp with time zone
);

create unique index ux_projects_owner_slug on projects (owner_id, slug);
create index ix_projects_owner_updated on projects (owner_id, updated_at desc);

create table project_pages (
    id uuid primary key,
    project_id uuid not null references projects (id) on delete cascade,
    page_key varchar(80) not null,
    title varchar(160) not null,
    path varchar(200) not null,
    position integer not null,
    version bigint not null default 0,
    document_json text not null,
    updated_at timestamp with time zone not null
);

create unique index ux_project_pages_key on project_pages (project_id, page_key);
create unique index ux_project_pages_path on project_pages (project_id, path);
create index ix_project_pages_project on project_pages (project_id, position);

create table export_artifacts (
    id uuid primary key,
    project_id uuid not null references projects (id) on delete cascade,
    owner_id uuid not null references users (id) on delete cascade,
    format varchar(20) not null,
    file_name varchar(200) not null,
    content_type varchar(100) not null,
    content_text text not null,
    size_bytes bigint not null,
    created_at timestamp with time zone not null
);

create index ix_export_artifacts_owner on export_artifacts (owner_id, created_at desc);
