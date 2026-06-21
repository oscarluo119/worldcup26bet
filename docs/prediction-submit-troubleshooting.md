# Prediction Submit Troubleshooting

## When users report "submission failed but nothing was saved"

Check whether the affected account exists in `auth.users` but is missing from `public.profiles`:

```sql
select
  au.id,
  au.email,
  au.created_at,
  p.id as profile_id
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
order by au.created_at desc;
```

## What to look for

- Failures concentrated on first prediction attempts right after registration
- `prediction_save` errors with code `23503` or user-facing code `profile_not_ready`
- Login succeeded, but `ensureProfile` failed before the `predictions` upsert ran
