# Insurance Portal - Frontend Setup Guide

## Project Overview

This is a modern, production-ready insurance client servicing portal frontend built with React, Vite, and Tailwind CSS. It's designed to work seamlessly with an ASP.NET Core Web API backend.

## File Structure

```
src/
├── config/
│   └── api.js                 # Axios instance with JWT interceptors
├── services/
│   ├── authService.js         # Authentication logic (register, login, logout)
│   ├── policyService.js       # Policy CRUD operations
│   └── claimService.js        # Claim CRUD operations
├── components/
│   ├── ProtectedRoute.jsx     # Route guard for authenticated pages
│   ├── Navbar.jsx             # Navigation bar with logout
│   ├── PolicyModal.jsx        # Modal for creating/editing policies
│   └── ClaimModal.jsx         # Modal for creating/editing claims
├── pages/
│   ├── Login.jsx              # Login page
│   ├── Register.jsx           # Registration page
│   ├── Dashboard.jsx          # Main dashboard with statistics
│   ├── Policies.jsx           # Policies list and management
│   └── Claims.jsx             # Claims list and management
├── App.jsx                    # Main routing component
└── main.tsx                   # Entry point
```

## Installation

```bash
npm install
```

## Configuration

1. **Backend URL**: Update the API base URL in `src/config/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

2. **Environment Variables** (optional):
   Create a `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

## Development

Start the development server:
```bash
npm run dev
```

The app will run at `http://localhost:5173`

## Production Build

```bash
npm run build
```

Output files will be in the `dist/` directory.

## Features by Page

### Login / Register
- Email and password authentication
- Form validation
- Error handling
- JWT token storage in localStorage
- Auto-redirect to dashboard on successful login

### Dashboard
- Overview statistics (total policies, active policies, total claims, pending claims)
- Quick action links to add policies and file claims
- Visual stat cards with gradient backgrounds
- Support button

### Policies
- View all user policies
- Search by insurer or policy type
- Filter by status (Active, Lapsed, Cancelled)
- Add new policies via modal
- Edit existing policies
- Delete policies
- Display: Insurer, Policy Type, Premium, Start Date, End Date, Status

### Claims
- View all user claims
- Search claims
- Filter by status (Submitted, Under Review, Approved, Rejected)
- File new claims via modal
- Edit pending claims
- Delete pending claims (cannot modify approved/rejected claims)
- Display: Policy info, Claim amount, Description, Submission date

## API Integration

### Authentication Endpoints

```
POST /api/auth/register
Request: { username, email, password }
Response: { message, userId }

POST /api/auth/login
Request: { email, password }
Response: { token, user: { id, username, email } }
```

### Policy Endpoints

```
GET /api/policies
Response: Array of policies

GET /api/policies/{id}
Response: Single policy object

POST /api/policies
Request: { insurer, policyType, premiumAmt, startDate, endDate, status }
Response: Created policy object

PUT /api/policies/{id}
Request: Same as POST
Response: Updated policy object

DELETE /api/policies/{id}
Response: Success message
```

### Claim Endpoints

```
GET /api/claims
Response: Array of claims

GET /api/claims/{id}
Response: Single claim object

POST /api/claims
Request: { policyId, claimAmt, description, status }
Response: Created claim object

PUT /api/claims/{id}
Request: Same as POST
Response: Updated claim object

DELETE /api/claims/{id}
Response: Success message
```

## Authentication Flow

1. User registers with username, email, and password
2. User logs in with email and password
3. Backend returns JWT token
4. Token is stored in localStorage
5. Token is automatically added to all API requests via axios interceptor
6. If token expires (401 response), user is redirected to login
7. Logout clears token and user data from localStorage

## Form Validation

### Registration
- All fields required
- Password minimum 6 characters
- Passwords must match

### Policy Form
- All fields required
- Premium amount > 0
- End date must be after start date
- Dates validated on submit

### Claim Form
- All fields required
- Claim amount > 0
- Description 10-200 characters
- Policy must be selected

## Data Types

### Policy Object
```javascript
{
  policyId: number,
  userId: number,
  insurer: string,
  policyType: string,
  premiumAmt: number,
  startDate: ISO string,
  endDate: ISO string,
  status: 'Active' | 'Lapsed' | 'Cancelled'
}
```

### Claim Object
```javascript
{
  claimId: number,
  policyId: number,
  userId: number,
  claimAmt: number,
  description: string,
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected',
  submittedAt: ISO string
}
```

## Design System

### Colors
- **Primary**: Blue (#2563eb, #3b82f6)
- **Secondary**: Green (#10b981, #059669)
- **Status Colors**:
  - Active/Approved: Green
  - Pending/Under Review: Yellow
  - Rejected/Cancelled: Red
  - Submitted: Blue

### Responsive Breakpoints
- Mobile: Single column
- Tablet (md): 2 columns
- Desktop (lg): 3-4 columns

### Interactive Elements
- Hover effects: Scale, color shift
- Active effects: Scale down
- Loading states: Opacity reduction
- Disabled states: Cursor not-allowed

## Styling

All styling uses Tailwind CSS utility classes. Key utilities:
- Gradients: `bg-gradient-to-r`, `from-blue-600`, `to-green-500`
- Spacing: 8px system with Tailwind defaults
- Transitions: `transition-all`, `duration-300`
- Shadows: `shadow-lg`, `hover:shadow-2xl`
- Transforms: `hover:scale-105`, `active:scale-[0.98]`

## Error Handling

- API errors display in error alerts
- Invalid form submissions show field-level validation
- 401 responses trigger automatic logout and redirect
- Network errors are caught and displayed

## Local Storage

The app stores:
- `token`: JWT authentication token
- `user`: User object (id, username, email)

These are cleared on logout.

## Browser Support

Modern browsers supporting:
- ES2020+
- Fetch API
- LocalStorage
- CSS Grid & Flexbox

## Development Tips

1. **JWT Tokens**: Stored in localStorage for persistence
2. **Protected Routes**: Use `ProtectedRoute` component for authenticated pages
3. **API Calls**: Use service modules to keep components clean
4. **Modals**: Use portal pattern for overlay dialogs
5. **Forms**: All forms are controlled components with validation

## Troubleshooting

### CORS Errors
- Ensure backend allows cross-origin requests
- Check API base URL in `src/config/api.js`

### Unauthorized Errors
- Verify token is being sent in Authorization header
- Check if token has expired
- User will be redirected to login on 401

### Form Validation Errors
- Check browser console for specific error messages
- Ensure all required fields are filled
- Review validation logic in modal components

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear dist folder: `rm -rf dist`
- Try building again

## Performance Optimizations

- Lazy loading with React.lazy and Suspense (can be added)
- Memoization of expensive components (can be added)
- Debounced search (can be added)
- Pagination for large lists (can be added)

## Next Steps

1. Ensure ASP.NET Core backend is running on port 5000
2. Update API base URL if backend runs on different port
3. Run `npm run dev` to start development server
4. Test authentication flow
5. Test policy and claim CRUD operations
