# University Fee System - Quick Start Guide

## System Overview

The University Fee Management System is a complete solution for managing student fees and exam permission slips. It includes three main portals:

- **Public Homepage** - Information and authentication
- **Student Portal** - Submit fees, track status, download permission slips
- **Admin Portal** - Manage batches, verify payments, create staff accounts

---

## Default Admin Credentials

**Email:** `admin@unifee.com`  
**Password:** `Admin@123456`

⚠️ **CHANGE THESE IMMEDIATELY** after your first login for security

---

## Initial Setup (5 Minutes)

### Step 1: Log In to Admin Panel
1. Navigate to your site root URL (/)
2. Click "Sign In" button
3. Use admin credentials above
4. You'll be directed to the admin dashboard

### Step 2: Create Your First Batch
1. Go to **Admin > Batches**
2. Click "Create New Batch"
3. Fill in:
   - Batch Name: "Batch 2024-25 Semester 1"
   - Batch Code: "BATCH-2024-01"
   - Academic Year: "2024-2025"
   - Semester: "1"
   - Status: "Active"
   - Fee Amount: (e.g., 5000)
   - Fee Deadline: (select date)
4. Save

### Step 3: Add Students to Batch
1. In **Batches**, click "Assign Students"
2. Choose option:
   - **Single Entry**: Search and add one student
   - **Bulk Upload**: Upload CSV file
3. Submit

### Step 4: Create Staff Accounts
1. Go to **Admin > Create Staff Account**
2. Fill in form:
   - Full Name, Email, Role (Admin/Accountant/Registrar)
3. Click "Create Account"
4. Share credentials with staff member

---

## User Workflows

### For Students

1. **Sign Up**
   - Navigate to home page
   - Click "Sign Up"
   - Fill in: Name, Student ID, Email, Batch Code
   - Create account

2. **Submit Fee Receipt**
   - Log in to student portal
   - Navigate to "Upload Receipt"
   - Upload payment proof (JPG, PNG, PDF)
   - Submit

3. **Check Status**
   - View submission history
   - Wait for accountant to verify
   - Once approved, permission slip auto-generates

4. **Download Permission Slip**
   - Go to "Permission Slips"
   - Download PDF to use for exams

### For Accountants

1. **Review Submissions**
   - Go to "Verification Queue"
   - Click submission to view receipt
   - Verify payment details match amount
   - Click "Approve" or "Reject"

2. **Provide Feedback**
   - If rejected, add comment explaining reason
   - Student receives notification and can resubmit

### For Registrars

1. **Track Student Progress**
   - Go to "Student Tracking"
   - Search for specific student
   - View full payment history
   - Export reports to CSV

2. **Generate Reports**
   - Go to "Batch Reporting"
   - Compare metrics across batches
   - View approval trends

---

## Key Features

### Batch Management
- Create multiple student batches
- Set different fees and deadlines per batch
- Assign students manually or via CSV bulk import
- Archive completed batches

### Payment Verification
- Students upload payment receipts
- Accountants review and approve/reject
- Automatic permission slip generation on approval
- Email notifications for students

### Exam Permission Slips
- Auto-generated PDF with verification code
- Customizable per batch
- Downloadable by students
- Trackable in audit logs

### Reporting & Analytics
- Real-time submission status
- Batch performance comparison
- Year-over-year analysis
- Exportable reports

### Security
- Secure user authentication
- Row-level security (RLS) on all data
- Encrypted password storage
- Complete audit trail of all actions

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't log in | Clear browser cache, try incognito mode, verify email/password |
| Students can't register | Ensure batch is created and status is "Active" |
| Batch code not working | Check batch code is correct (case-sensitive), verify batch is Active |
| Permission slips not generating | Verify student_profiles table has correct batch_id |
| Can't create staff accounts | Ensure you're logged in as Admin |

---

## File Structure

```
project/
├── app/
│   ├── page.tsx                    # Homepage (root /)
│   ├── student/                    # Student portal pages
│   │   ├── dashboard/
│   │   ├── upload/
│   │   ├── history/
│   │   ├── slips/
│   │   └── profile/
│   ├── admin/                      # Admin portal pages
│   │   ├── dashboard/
│   │   ├── batches/
│   │   ├── verification-queue/
│   │   ├── student-tracking/
│   │   ├── batch-reporting/
│   │   ├── create-staff/
│   │   ├── audit-logs/
│   │   └── settings/
│   └── auth/                       # Authentication pages
├── components/
│   ├── navbar.tsx                  # Navigation bar
│   ├── auth-modals.tsx             # Login/signup modals
│   ├── student/                    # Student components
│   └── admin/                      # Admin components
├── lib/
│   ├── supabase/                   # Supabase setup
│   └── db-helpers.ts               # Database utilities
└── scripts/
    ├── 001_create_schema.sql       # Initial schema
    ├── 002_add_student_profiles.sql
    ├── CREATE_FIRST_ADMIN.sql      # First admin creation
    └── ADMIN_SETUP_INSTRUCTIONS.sql
```

---

## Environment Variables

The system uses these environment variables (auto-configured by Supabase integration):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous client key
- `NEXT_PUBLIC_SITE_URL` - Your site URL (for auth callbacks)

---

## Need Help?

- **Documentation**: See ADMIN_SETUP_GUIDE.md, SETUP_GUIDE.md, and LATEST_UPDATES.md
- **Support Email**: support@unifee.com
- **Phone**: +1 (234) 567-890

---

**System Status:** Production Ready  
**Last Updated:** March 2024
