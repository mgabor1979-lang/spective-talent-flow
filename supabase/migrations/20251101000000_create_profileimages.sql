-- Create profileimages table
create table if not exists public.profileimages (
  uid uuid not null,
  src text not null,
  cloudinary_public_id text null,
  created timestamp with time zone null default now(),
  updated timestamp with time zone null default now(),
  constraint profileimages_pkey primary key (uid),
  constraint profileimages_uid_fkey foreign key (uid) references profiles (user_id) on update cascade on delete cascade
) tablespace pg_default;

-- Enable RLS
alter table public.profileimages enable row level security;

-- Create policies
-- Allow everyone (including anonymous users) to view profile images
create policy "Anyone can view profile images"
  on public.profileimages
  for select
  using (true);

-- Allow users to view their own profile images (redundant but kept for clarity)
create policy "Users can view their own profile images"
  on public.profileimages
  for select
  using (auth.uid() = uid);

-- Allow users to insert their own profile images
create policy "Users can insert their own profile images"
  on public.profileimages
  for insert
  with check (auth.uid() = uid);

-- Allow users to update their own profile images
create policy "Users can update their own profile images"
  on public.profileimages
  for update
  using (auth.uid() = uid);

-- Allow users to delete their own profile images
create policy "Users can delete their own profile images"
  on public.profileimages
  for delete
  using (auth.uid() = uid);

-- Allow admins to view all profile images
create policy "Admins can view all profile images"
  on public.profileimages
  for select
  using (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert profile images for any user
create policy "Admins can insert any profile images"
  on public.profileimages
  for insert
  with check (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any profile images
create policy "Admins can update any profile images"
  on public.profileimages
  for update
  using (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any profile images
create policy "Admins can delete any profile images"
  on public.profileimages
  for delete
  using (has_role(auth.uid(), 'admin'::app_role));

-- Allow company users to view professional profile images
create policy "Company users can view professional profile images"
  on public.profileimages
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'company'
    )
    and
    exists (
      select 1 from public.profiles
      where user_id = profileimages.uid and role = 'professional'
    )
  );

-- Create index for faster lookups
create index if not exists profileimages_uid_idx on public.profileimages (uid);

-- Add trigger to update 'updated' timestamp
create or replace function public.update_profileimages_updated()
returns trigger as $$
begin
  new.updated = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profileimages_updated_trigger
  before update on public.profileimages
  for each row
  execute function public.update_profileimages_updated();
