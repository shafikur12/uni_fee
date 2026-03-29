# Admin Account Setup Guide

## Default Admin Credentials (For Initial Setup)

After running the SQL migration, use these credentials to log in as admin:

**Email:** `admin@unifee.com`
**Password:** `Admin@123456`

**IMPORTANT:** Change these credentials immediately after your first login for security purposes.

---

## How to Create an Admin Account

### Method 1: Using SQL Script (Recommended for First Admin)

1. **Navigate to your Supabase Dashboard**
   - Go to https://supabase.com and log in to your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Admin Creation Script**
   - Copy and paste the SQL from `scripts/CREATE_FIRST_ADMIN.sql`
   - Or manually execute this SQL:

```sql
-- Insert admin user into Supabase Auth and staff_profiles
-- Note: You'll need to use Supabase's Auth API or admin panel to create the auth user first

INSERT INTO public.staff_profiles (user_id, full_name, email, role)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with the Supabase user ID
  'Admin User',
  'admin@unifee.com',
  'Admin'
);
```

4. **Run the query** and note the `user_id` generated

### Method 2: Using the Web Interface (For Additional Admin/Staff)

1. **Log in to the system** as an existing admin user

2. **Navigate to Admin Panel**
   - Go to `http://localhost:3000/admin/create-staff` (or your deployment URL)
   - Or use the link in the admin sidebar: "Create Staff Account"

3. **Fill in the form**
   - Full Name: Enter the staff member's name
   - Email: Enter their email address
   - Role: Select from:
     - **Admin**: Full system access, can manage batches, staff, settings
     - **Accountant**: Can review and approve fee submissions
     - **Registrar**: Can view student records and generate reports

4. **Generate temporary password** (system will provide one)

5. **Share credentials** with the staff member securely

---

## First-Time Setup Checklist

After logging in with admin credentials:

- [ ] Change your admin password
- [ ] Create student batches (e.g., Batch 2024-25 Sem 1, Batch 2024-25 Sem 2)
- [ ] Set batch codes (e.g., BATCH-2024-01)
- [ ] Set fee amounts and deadlines for each batch
- [ ] Create staff accounts for accountants and registrars
- [ ] Customize permission slip templates (optional)
- [ ] Update system branding and settings

---

## Admin Dashboard Features

Once logged in as admin, you have access to:

### Batch Management (`/admin/batches`)
- Create new batches
- Set fee amounts and deadlines
- Assign students to batches (manually or via CSV)
- Archive completed batches

### Verification Queue (`/admin/verification-queue`)
- Review pending fee submissions
- Approve or reject receipts
- Add comments for rejections

### Student Tracking (`/admin/student-tracking`)
- Track student payment status
- View submission history
- Export reports to CSV

### Batch Reporting (`/admin/batch-reporting`)
- Compare metrics across batches
- View year-over-year analysis
- Track approval trends

### Audit Logs (`/admin/audit-logs`)
- View all system actions
- Track staff activity
- Export logs for compliance

### Settings (`/admin/settings`)
- Manage staff accounts
- Configure system settings
- Update branding information

---

## Troubleshooting

### Can't Log In with Admin Credentials?

1. Verify the email and password are correct
2. Check that email verification is disabled in Supabase:
   - Go to Supabase Project Settings
   - Navigate to Authentication > Providers
   - Disable email verification
3. Try logging in from an incognito/private browser window

### Need to Reset Admin Password?

1. Go to Supabase Auth Users management
2. Find the admin user email
3. Click the user and select "Reset password"
4. Supabase will send a password reset link
5. Follow the link to set a new password

### Can't See Admin Panel After Login?

1. Ensure your account has the "Admin" role in `staff_profiles` table
2. Check Supabase RLS policies allow access
3. Clear browser cache and try again

---

## Security Best Practices

1. **Change default credentials immediately** after first login
2. **Use strong passwords** (minimum 12 characters recommended)
3. **Enable 2FA** if your Supabase plan supports it
4. **Restrict admin accounts** to trusted staff only
5. **Audit logs regularly** for suspicious activity
6. **Back up settings** periodically
7. **Update staff passwords** regularly

---

## Support

For technical issues or questions:
- Email: support@unifee.com
- Phone: +1 (234) 567-890
- Documentation: Check LATEST_UPDATES.md and SETUP_GUIDE.md
