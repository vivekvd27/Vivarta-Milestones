/**
 * AUTHENTICATION MODULE
 * Handle user login, logout, and session management
 */

class AuthManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.sessionCheckInterval = null;
  }

  /**
   * Initialize auth - check for existing session
   */
  async initialize() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        this.currentUser = session.user;
        console.log("✓ Session restored:", this.currentUser.email);
        return true;
      } else {
        this.currentUser = null;
        console.log("No active session");
        return false;
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      return false;
    }
  }

  /**
   * Sign up new user (email/password)
   */
  async signUp(email, password, displayName = "") {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      });

      if (error) throw error;

      // Create profile after signup
      if (data.user) {
        await this.createProfile(data.user.id, email, displayName);
        console.log("✓ User created:", email);
        return data.user;
      }
    } catch (error) {
      console.error("Sign up error:", error.message);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.currentUser = data.user;
      console.log("✓ Signed in:", email);
      
      // Start session monitoring
      this.monitorSession();
      
      return data.user;
    } catch (error) {
      console.error("Sign in error:", error.message);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;
      
      this.currentUser = null;
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
      }
      
      console.log("✓ Signed out");
      return true;
    } catch (error) {
      console.error("Sign out error:", error.message);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    return this.currentUser?.id;
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail() {
    return this.currentUser?.email;
  }

  /**
   * Create user profile in profiles table
   */
  async createProfile(userId, email, displayName) {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          name: displayName || email.split("@")[0],
        });

      if (error && error.code !== "23505") { // Ignore duplicate key error
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Profile creation error:", error.message);
      return false;
    }
  }

  /**
   * Monitor session and refresh if needed
   */
  monitorSession() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Check every 30 minutes
    this.sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (!session) {
          this.currentUser = null;
          console.warn("Session expired");
          document.dispatchEvent(new CustomEvent("auth:expired"));
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    }, 30 * 60 * 1000);
  }

  /**
   * Reset password (send email)
   */
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      console.log("✓ Password reset email sent");
      return true;
    } catch (error) {
      console.error("Reset password error:", error.message);
      throw error;
    }
  }

  /**
   * Update password after reset
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      console.log("✓ Password updated");
      return true;
    } catch (error) {
      console.error("Update password error:", error.message);
      throw error;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.currentUser = session.user;
      } else {
        this.currentUser = null;
      }
      callback(event, session);
    });
  }
}

// Export for use in app
window.AuthManager = AuthManager;
