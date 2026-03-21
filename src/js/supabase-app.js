/**
 * SUPABASE APP INTEGRATION
 * Bridge between existing app logic and Supabase backend
 * Replaces localStorage while maintaining existing UI
 */

class SupabaseAppBridge {
  constructor() {
    this.supabase = window.supabaseConfig?.supabase;
    this.auth = null;
    this.dataSync = null;
    this.appState = null;
    this.isInitialized = false;
    this.demoMode = false;  // false = Supabase cloud mode, true = localStorage only
    this.currentUser = null;  // Vivek, Mirat, or Chirag
  }

  /**
   * Initialize Supabase integration (with demo mode fallback)
   */
  async initialize() {
    try {
      console.log("Initializing Vivarta Dashboard...");

      // Check if user already selected
      const savedUser = localStorage.getItem("vivarta_demo_user");
      if (savedUser) {
        console.log("User selected: " + savedUser);
        this.currentUser = savedUser;
        
        // Use Supabase cloud sync instead of localStorage
        if (!this.demoMode && window.supabaseConfig?.supabase) {
          console.log("🌐 Initializing Supabase cloud mode...");
          await this.initializeSupabaseMode();
        } else {
          console.log("📱 Using demo mode (localStorage)");
          this.initializeDemoMode();
        }
        return true;
      }

      // Show user selector
      console.log("Showing user selector...");
      this.showUserSelector();
      return false;
      
    } catch (error) {
      console.error("Integration initialization error:", error);
      this.showUserSelector();  // Fallback to demo mode
      return false;
    }
  }

  /**
   * Initialize Supabase cloud mode (real-time sync from database)
   */
  async initializeSupabaseMode() {
    try {
      this.supabase = window.supabaseConfig?.supabase;
      if (!this.supabase) {
        throw new Error("Supabase client not available");
      }

      console.log("✓ Supabase mode initialized for user: " + this.currentUser);
      
      // Fetch user's data from Supabase
      await this.loadStateFromSupabase();
      
      // CRITICAL: Copy to window.appState so bundle.js sees it
      if (window.appState) {
        Object.assign(window.appState, this.appState);
        console.log("✓ State synced to window.appState for bundle.js");
      }
      
      // CRITICAL: Set flag to indicate Supabase is ready
      window.supabaseReady = true;
      console.log("✓ SUPABASE READY - flag set for bundle.js");
      
      // Set up real-time subscription
      this.setupRealtimeSync();

      // Dispatch event that app is ready
      window.dispatchEvent(new CustomEvent("stateChange", {
        detail: { type: "app:ready", data: { user: this.currentUser }, timestamp: Date.now() }
      }));

      this.isInitialized = true;
      console.log("✓ Dashboard ready for " + this.currentUser + " (Supabase cloud)");
      
      return true;
    } catch (error) {
      console.error("Supabase mode initialization error:", error);
      console.warn("Falling back to demo mode");
      this.initializeDemoMode();
      return false;
    }
  }

  /**
   * Load state from Supabase database
   */
  async loadStateFromSupabase() {
    try {
      console.log(`📥 Querying Supabase for user: "${this.currentUser}"`);
      
      // Query for this user's data using limit instead of single
      // .single() can fail with certain data structures
      const { data, error } = await this.supabase
        .from("user_data")
        .select("*")
        .eq("user_name", this.currentUser)
        .limit(1);

      console.log(`Query response:`, { data, error });

      if (error) {
        console.warn(`❌ Query error code: ${error.code}, message: ${error.message}`);
        
        if (error.code === "PGRST116") {
          // 116 = no rows found (table exists but empty for this user)
          console.log(`ℹ️  No data yet for user "${this.currentUser}" - starting fresh`);
          this.createDefaultAppState();
        } else if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
          console.error("❌ user_data table not found in Supabase");
          console.error("Please run the docs/SUPABASE_USER_DATA_TABLE.sql in your Supabase SQL Editor");
          this.demoMode = true;
          this.initializeDemoMode();
          return;
        } else {
          console.error("Unexpected query error:", error);
          throw error;
        }
      } else if (data && data.length > 0) {
        // data is now an array because we used .limit() instead of .single()
        const userData = data[0];
        console.log(`✅ SUCCESS! Loaded existing data for "${this.currentUser}"`);
        console.log("Raw data from Supabase:", userData);
        
        // Parse the state object
        try {
          const state = JSON.parse(userData.state_json || "{}");
          this.appState = {
            timeline: state.timeline || [],
            meetings: state.meetings || [],
            contacts: state.contacts || [],
            futureEvents: state.futureEvents || [],
            ruleOfThree: state.ruleOfThree || [],
            affirmations: state.affirmations || []
          };
          
          // CRITICAL: Sync to window.appState so bundle.js sees the data
          if (window.appState) {
            Object.assign(window.appState, this.appState);
          } else {
            window.appState = { ...this.appState };
          }
          
          console.log("✓ Parsed app state with", this.appState.ruleOfThree?.length || 0, "tasks");
          console.log("✓ window.appState synchronized with loaded data");
        } catch (parseErr) {
          console.error("Error parsing state_json:", parseErr);
          this.createDefaultAppState();
        }
      } else {
        console.warn("⚠️  Query returned no rows - creating default state");
        this.createDefaultAppState();
      }

      // Set up data sync (interceptLocalStorage will handle saves)
      this.interceptLocalStorageForSync();
      
    } catch (error) {
      console.error("❌ Exception in loadStateFromSupabase:", error);
      this.createDefaultAppState();
    }
  }

  /**
   * Set up real-time subscription to Supabase changes (optional enhancement for v2)
   * For now, focus on reliable load/save between devices
   */
  setupRealtimeSync() {
    // Real-time subscriptions are a nice-to-have enhancement
    // The core sync happens through load/save, which is reliable
    console.log("ℹ️  Real-time subscriptions disabled for now (focus on load/save)");
    console.log("💡 To see updates: refresh the page or switch users");
  }

  /**
   * Intercept localStorage to sync with Supabase
   */
  interceptLocalStorageForSync() {
    const self = this;
    const originalSetItem = Storage.prototype.setItem;

    Storage.prototype.setItem = function(key, value) {
      // For vivartaState, sync to Supabase
      if (key === "vivartaState") {
        try {
          console.log(`🔄 Saving state for user: "${self.currentUser}"`);
          
          if (!self.currentUser) {
            console.warn("⚠️  currentUser not set! Cannot sync to Supabase. Data will be lost!");
            return;
          }
          
          // Parse the state
          const state = JSON.parse(value);
          self.appState = state;
          
          console.log(`📤 Uploading to Supabase: user="${self.currentUser}", tasks=${state.ruleOfThree?.length || 0}`);

          // Save to Supabase asynchronously
          if (self.supabase && self.currentUser) {
            self.supabase
              .from("user_data")
              .upsert(
                {
                  user_name: self.currentUser,
                  state_json: JSON.stringify(state),
                  updated_at: new Date().toISOString()
                },
                { 
                  onConflict: "user_name"
                }
              )
              .then(({ data, error }) => {
                if (error) {
                  console.error(`❌ Supabase upsert error: ${error.message}`);
                  console.error("Error code:", error.code);
                } else {
                  console.log(`✅ Successfully synced to Supabase for ${self.currentUser}`);
                }
              })
              .catch(err => {
                console.error(`❌ Supabase exception: ${err.message}`);
              });
          } else {
            console.warn("⚠️  Cannot sync: Supabase client not ready");
          }

          console.log(`✓ State queued for sync`);
        } catch (error) {
          console.error("Error in setItem interception:", error);
        }
      } else {
        // Other keys: save normally
        originalSetItem.call(this, key, value);
      }
    };
    
    console.log(`✓ Supabase sync interceptor installed for user: "${self.currentUser}"`);
  }

  /**
   * Initialize demo mode (no Supabase auth required)
   */
  initializeDemoMode() {
    try {
      console.log("✓ Demo mode initialized for user: " + this.currentUser);
      
      // Create in-memory appState from localStorage
      this.createAppStateFromStorage();

      // Replace localStorage operations to use per-user namespace
      this.interceptLocalStorage();

      // Dispatch event that app is ready
      window.dispatchEvent(new CustomEvent("stateChange", {
        detail: { type: "app:ready", data: { user: this.currentUser }, timestamp: Date.now() }
      }));

      this.isInitialized = true;
      console.log("✓ Dashboard ready for " + this.currentUser);
      
      return true;
    } catch (error) {
      console.error("Demo mode initialization error:", error);
      return false;
    }
  }

  /**
   * Create app state from localStorage (demo mode)
   */
  createAppStateFromStorage() {
    const storageKey = `vivartaState_${this.currentUser}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        this.appState = JSON.parse(stored);
        console.log("App state loaded for " + this.currentUser, this.appState);
      } catch (error) {
        console.warn("Error parsing stored state:", error);
        this.createDefaultAppState();
      }
    } else {
      this.createDefaultAppState();
    }
  }

  /**
   * Create default empty app state
   */
  createDefaultAppState() {
    this.appState = {
      timeline: [],
      meetings: [],
      contacts: [],
      futureEvents: [],
      ruleOfThree: [],
      affirmations: [],
      goals: [],
      announcements: [],
      milestones: [],
    };
    
    // CRITICAL: Also set window.appState so bundle.js sees it
    if (typeof window.appState !== 'undefined') {
      Object.assign(window.appState, this.appState);
    } else {
      window.appState = { ...this.appState };
    }
    
    console.log("✓ Default app state created for " + this.currentUser);
    console.log("✓ window.appState synchronized");
  }

  /**
   * Intercept localStorage calls for per-user isolation (demo mode)
   */
  interceptLocalStorage() {
    const self = this;  // Capture context for nested functions
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    // Intercept setItem
    Storage.prototype.setItem = function(key, value) {
      // For vivartaState, use per-user namespace
      if (key === "vivartaState") {
        if (!self.currentUser) {
          console.warn("No currentUser set yet, storing under default key");
          originalSetItem.call(this, key, value);
          return;
        }
        
        const userKey = `vivartaState_${self.currentUser}`;
        console.log(`Saving to ${userKey}`);
        
        try {
          // Save to per-user storage
          originalSetItem.call(this, userKey, value);
          
          // Also parse and update appState
          self.appState = JSON.parse(value);
          console.log("Updated appState:", self.appState);
        } catch (error) {
          console.error("Error in setItem interception:", error);
        }
      } else {
        // Other keys save normally
        originalSetItem.call(this, key, value);
      }
    };

    // Intercept getItem
    Storage.prototype.getItem = function(key) {
      if (key === "vivartaState") {
        if (!self.currentUser) {
          console.warn("No currentUser set, reading default key");
          return originalGetItem.call(this, key);
        }
        
        const userKey = `vivartaState_${self.currentUser}`;
        const value = originalGetItem.call(this, userKey);
        console.log(`Retrieved from ${userKey}:`, value ? "✓" : "empty");
        return value;
      }
      return originalGetItem.call(this, key);
    };

    // Intercept removeItem
    Storage.prototype.removeItem = function(key) {
      if (key === "vivartaState") {
        if (!self.currentUser) {
          console.warn("No currentUser set, using default key");
          originalRemoveItem.call(this, key);
          return;
        }
        
        const userKey = `vivartaState_${self.currentUser}`;
        originalRemoveItem.call(this, userKey);
        console.log(`Cleared ${userKey}`);
        self.createDefaultAppState();
      } else {
        originalRemoveItem.call(this, key);
      }
    };
  }

  /**
   * Show user selector (instead of login screen)
   */
  showUserSelector() {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #f5f2ed 0%, #efe9e0 100%); font-family: 'Figtree', sans-serif;">
        <div style="background: white; padding: 50px 40px; border-radius: 20px; box-shadow: 0 8px 32px rgba(26,23,20,0.15); max-width: 450px; width: 100%; text-align: center;">
          <h1 style="margin: 0 0 12px; font-size: 2rem; font-family: 'DM Serif Display', serif; color: #1a1714; letter-spacing: -0.5px;">Vivarta Dashboard</h1>
          <p style="margin: 0 0 40px; color: #8b8680; font-size: 1rem;">Welcome! Select your profile to continue</p>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 30px;">
            <button data-user="Vivek" style="padding: 16px 20px; background: #c17d3c; color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 12px;">
              <span style="font-size: 1.5rem;">👨‍💼</span> Vivek
            </button>
            <button data-user="Mirat" style="padding: 16px 20px; background: #2e8b98; color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 12px;">
              <span style="font-size: 1.5rem;">👨‍💻</span> Mirat
            </button>
            <button data-user="Chirag" style="padding: 16px 20px; background: #6b4c8a; color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 12px;">
              <span style="font-size: 1.5rem;">🧑‍💼</span> Chirag
            </button>
          </div>
          
          <div style="padding-top: 20px; border-top: 1px solid #e8e2d8;">
            <p style="margin: 12px 0 0; color: #9d9490; font-size: 0.85rem;">Demo mode • No authentication required • Data saved locally</p>
          </div>
        </div>
      </div>
    `;

    // Add event listeners to user buttons
    document.querySelectorAll('[data-user]').forEach(button => {
      button.addEventListener('click', () => {
        const user = button.getAttribute('data-user');
        this.selectUser(user);
      });
      
      // Add hover effect
      button.addEventListener('mouseenter', () => {
        button.style.opacity = '0.9';
        button.style.transform = 'scale(1.02)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.opacity = '1';
        button.style.transform = 'scale(1)';
      });
    });
  }

  /**
   * User selected, initialize dashboard
   */
  selectUser(userName) {
    console.log("User selected: " + userName);
    localStorage.setItem("vivarta_demo_user", userName);
    this.currentUser = userName;
    
    // Initialize appropriate mode
    if (!this.demoMode && window.supabaseConfig?.supabase) {
      console.log("🌐 Initializing Supabase for " + userName);
      this.initializeSupabaseMode().then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }).catch(error => {
        console.error("Failed to init Supabase:", error);
        this.initializeDemoMode();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      });
    } else {
      this.initializeDemoMode();
      
      // Trigger full page load of dashboard
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  /**
   * Get current user info (demo mode)
   */
  getCurrentUser() {
    if (!this.currentUser) return null;
    return {
      id: this.currentUser,
      email: `${this.currentUser.toLowerCase()}@vivarta.local`,
      name: this.currentUser,
      demo: true,
    };
  }

  /**
   * Get current user ID (demo mode)
   */
  getCurrentUserId() {
    return this.currentUser || null;
  }

  /**
   * Get current user name
   */
  getCurrentUserName() {
    return this.currentUser || "Guest";
  }

  /**
   * Switch user (show selector again)
   */
  switchUser() {
    localStorage.removeItem("vivarta_demo_user");
    this.currentUser = null;
    this.isInitialized = false;
    window.location.reload();
  }

  /**
   * Sign out (same as switch user)
   */
  signOut() {
    this.switchUser();
  }
}

// Create global instance
window.supabaseApp = new SupabaseAppBridge();

// Auto-initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.supabaseApp.initialize();
  });
} else {
  window.supabaseApp.initialize();
}
