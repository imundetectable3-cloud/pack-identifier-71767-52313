-- Create a private storage bucket for analysis images
insert into storage.buckets (id, name, public)
values ('analyses', 'analyses', false)
on conflict (id) do nothing;

-- Policies for the analyses bucket
-- Allow users to view their own files
create policy "Users can view own analysis files" on storage.objects
for select to authenticated
using (
  bucket_id = 'analyses'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload their own files
create policy "Users can upload own analysis files" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'analyses'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
create policy "Users can delete own analysis files" on storage.objects
for delete to authenticated
using (
  bucket_id = 'analyses'
  and auth.uid()::text = (storage.foldername(name))[1]
);