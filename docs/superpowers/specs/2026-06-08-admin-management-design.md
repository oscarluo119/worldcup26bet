# Admin Management Design

## Goal

Allow existing administrators to add or remove other administrators from the app's admin UI, without hardcoding email addresses in SQL or frontend code.

## Current State

- Admin capability is derived from `profiles.is_admin`.
- Frontend access control already uses `row.is_admin` mapped into `currentPlayer.isAdmin`.
- Database functions call `public.is_admin()` to gate admin-only operations.
- Initial admin bootstrap is currently a one-off SQL update by email.

## Proposed Design

Keep `profiles.is_admin` as the single source of truth.

Add a new admin-only management area in the existing admin tab:

- Show the current administrator list.
- Show a searchable user list filtered by email or display name.
- Allow promoting a non-admin user to admin.
- Allow revoking admin from an existing admin.

All mutations must go through a new database RPC instead of direct table updates from the client.

## Database Changes

Add a new RPC:

- `public.admin_set_user_admin(target_user_id uuid, make_admin boolean)`

Behavior:

- Reject when caller is not an admin.
- Update `profiles.is_admin` for the target user.
- Reject when target profile does not exist.
- Reject when revoking admin would leave the system with zero admins.

The function becomes the only supported path for admin-role changes from the application.

## UI Changes

Inside the existing admin area, add an "Admin Accounts" section with two blocks:

- "Current Admins"
  - List current admins with email and display name.
  - Provide a revoke action.
- "Add Admin"
  - Search users by email or display name.
  - Exclude users who are already admins.
  - Provide a promote action.

Interaction rules:

- Revoke requires confirmation.
- Mutation success refreshes both lists.
- Mutation errors surface a clear message to the user.

## Data Flow

On admin view load:

- Read all profiles needed for the admin list.
- Read all non-admin profiles for search results, then filter client-side by the search keyword.

On promote or revoke:

- Call `admin_set_user_admin`.
- Refresh profile data after success.

## Error Handling

The UI should handle these cases explicitly:

- Current user is no longer an admin.
- Target user does not exist.
- Attempt to revoke the last remaining admin.
- Supabase request failure or timeout.

## Testing

Verify:

- Existing admin can grant admin rights to another user.
- Existing admin can revoke another admin.
- Last admin cannot revoke themselves if that would leave zero admins.
- Admin tab visibility still depends on `profiles.is_admin`.
- `npm test` and `npm run build` pass.
