# AI Studio Development Context

## CRITICAL: DO NOT REMOVE AUTHENTICATION SYSTEM

This project has a **production-ready authentication system** that is currently live on `theinstructorshub.co.uk`. 

### ⚠️ PROTECTED FILES - DO NOT DELETE:
- `services/authService.ts` - Authentication service
- `lib/supabase.ts` - Supabase configuration
- `components/LoginModal.tsx` - Login functionality
- `components/SignupModal.tsx` - Registration functionality  
- `components/ForgotPasswordModal.tsx` - Password reset modal
- `components/PasswordResetPage.tsx` - Password update page
- `App.tsx` - Contains Supabase auth state management

### 🔧 PROTECTED DEPENDENCIES:
- `@supabase/supabase-js` - Required for authentication
- `@google/genai` - Required for Gemini API

### 📋 CURRENT ARCHITECTURE:

**Authentication Flow:**
1. App.tsx manages auth state via `supabase.auth.onAuthStateChange()`
2. Direct Supabase calls (no wrapper service) for login/signup/logout
3. Password reset uses `PASSWORD_RECOVERY` event detection
4. Session persistence across browser refreshes

**Environment Variables (Vite):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_KEY` - Gemini API key

**Key Implementation Details:**
- Use `import.meta.env.VITE_*` for environment variables (NOT `process.env`)
- Authentication state managed in App.tsx with `useState` and `useEffect`
- Password reset detection via Supabase auth events, not URL parsing
- All auth actions flow through single `onAuthStateChange` listener

### 🚀 DEPLOYMENT STATUS:
- Live site: `theinstructorshub.co.uk`
- Continuous deployment via Netlify from GitHub
- Environment variables configured in Netlify dashboard
- Authentication system is fully functional in production

### 💡 DEVELOPMENT GUIDELINES:

**When Adding Features:**
1. Preserve existing authentication architecture
2. Add new components without removing auth components
3. Use existing auth state from App.tsx props
4. Test that login/signup/password reset still work

**When Modifying UI:**
1. Keep authentication modals and flows intact
2. Enhance existing components rather than replacing them
3. Maintain Supabase integration for user management

**When Refactoring:**
1. DO NOT remove authentication files
2. DO NOT change environment variable usage
3. DO NOT replace Supabase with mock authentication
4. Preserve the working auth state management in App.tsx

### 🔍 CURRENT WORKING STATE:
- Users can register, login, logout successfully
- Password reset via email works end-to-end
- Session persistence across page refreshes
- Real user data stored in Supabase database
- Gemini API integration for image transformation

### 📞 COMMUNICATION:
When making significant changes, inform the deployment team by saying:
**"New commits pushed - [brief description of changes]"**

This allows coordination between AI Studio development and production deployment.
