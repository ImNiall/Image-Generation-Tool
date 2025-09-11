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

**Project Structure:**
```
Image-Generation-Tool/
├── App.tsx                    # Main app with auth state management
├── Dashboard.tsx              # Authenticated user dashboard
├── LandingPage.tsx           # Public landing page
├── components/
│   ├── Header.tsx            # Navigation with auth modals
│   ├── LoginModal.tsx        # Login form modal
│   ├── SignupModal.tsx       # Registration form modal
│   ├── ForgotPasswordModal.tsx # Password reset modal
│   ├── PasswordResetPage.tsx # Password update page
│   ├── Generator.tsx         # Image generation component
│   └── [other UI components]
├── services/
│   ├── authService.ts        # Authentication service (DEPRECATED - use direct calls)
│   └── geminiService.ts      # Gemini API integration
└── lib/
    └── supabase.ts          # Supabase client configuration
```

**Authentication Flow:**
1. App.tsx manages auth state via `supabase.auth.onAuthStateChange()`
2. Direct Supabase calls (no wrapper service) for login/signup/logout
3. Password reset uses `PASSWORD_RECOVERY` event detection
4. Session persistence across browser refreshes

**Routing Logic (App.tsx):**
```typescript
// Current implementation uses conditional rendering:
{isLoggedIn ? (
  showPasswordReset ? (
    <PasswordResetPage onPasswordUpdated={handlePasswordUpdated} />
  ) : (
    <Dashboard user={user} onLogout={handleLogout} />
  )
) : (
  <LandingPage 
    onLogin={handleLogin}
    onSignup={handleSignup}
    onResetPassword={handleResetPassword}
  />
)}
```

**Component Props Flow:**
- `LandingPage` receives auth handlers as props
- `Header` manages modal visibility states
- `Dashboard` receives user object and logout handler
- All auth actions bubble up to App.tsx

**Environment Variables (Vite):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_KEY` - Gemini API key

**Key Implementation Details:**
- Use `import.meta.env.VITE_*` for environment variables (NOT `process.env`)
- Authentication state managed in App.tsx with `useState` and `useEffect`
- Password reset detection via Supabase auth events, not URL parsing
- All auth actions flow through single `onAuthStateChange` listener
- No React Router - uses conditional rendering based on auth state

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

### 🔄 AI STUDIO WORKFLOW:
Since AI Studio builds components and you commit the builds (no direct git access):

**Before Building New Features:**
1. Reference this context document for current architecture
2. Understand the existing routing structure (conditional rendering, not React Router)
3. Know that authentication state flows from App.tsx down via props
4. Preserve the existing component structure and prop interfaces

**When Building Components:**
- Match existing prop interfaces (check LandingPage, Dashboard, Header props)
- Use the established authentication pattern (direct Supabase calls in App.tsx)
- Follow the conditional rendering pattern instead of adding routing libraries
- Maintain the existing file structure and naming conventions

**Integration Points:**
- New features should integrate with existing `Dashboard.tsx`
- UI components should follow the existing modal pattern (see LoginModal, SignupModal)
- Image generation features should use the existing `Generator.tsx` component
- API calls should follow the pattern in `geminiService.ts`

### 📞 COMMUNICATION:
When making significant changes, inform the deployment team by saying:
**"New commits pushed - [brief description of changes]"**

This allows coordination between AI Studio development and production deployment.

### 🚨 COMMON PITFALLS TO AVOID:
- Don't replace conditional rendering with React Router
- Don't change `import.meta.env` to `process.env`
- Don't remove or rename authentication components
- Don't change the App.tsx authentication state management pattern
- Don't add new routing libraries without coordination
