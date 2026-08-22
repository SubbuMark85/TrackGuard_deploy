export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred.';

  const code = error.code || error.message || '';

  switch (code) {
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return "Firebase Auth Not Enabled in Console: Please go to Firebase Console (trackguard-dd2d4) > Authentication > Sign-in method tab, and click Enable for 'Email/Password' & 'Google'.";
    case 'auth/invalid-email':
      return 'The email address provided is not valid. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Try again later.';
    case 'auth/requires-recent-login':
      return 'This action requires recent authentication. Please sign in again.';
    case 'permission-denied':
      return 'Firestore Permission Denied: You do not have permission to access or modify these records.';
    case 'unavailable':
      return 'Firestore Service Unavailable: The service is currently offline or unreachable.';
    default:
      if (typeof error === 'string') return error;
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}
