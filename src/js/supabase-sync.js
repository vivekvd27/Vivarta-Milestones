/**
 * SUPABASE DATA SYNC LAYER
 * Abstracts Supabase operations and replaces localStorage
 * Maintains real-time sync and event system
 */

class SupabaseDataSync {
  constructor(supabaseClient, authManager) {
    this.supabase = supabaseClient;
    this.auth = authManager;
    this.subscriptions = {};
    this.syncedData = {};
    this.isSyncing = false;
  }

  /**
   * Initialize data sync - fetch all data and subscribe to changes
   */
  async initialize() {
    try {
      if (!this.auth.getCurrentUserId()) {
        console.warn("Cannot initialize sync: no authenticated user");
        return false;
      }

      console.log("Initializing Supabase data sync...");
      
      // Fetch all data
      await this.fetchAllData();
      
      // Subscribe to changes
      this.subscribeToAllTables();
      
      console.log("✓ Supabase sync initialized");
      return true;
    } catch (error) {
      console.error("Sync initialization error:", error);
      return false;
    }
  }

  /**
   * Fetch all user data from Supabase
   */
  async fetchAllData() {
    const userId = this.auth.getCurrentUserId();

    try {
      const [
        timeline,
        meetings,
        contacts,
        futureEvents,
        ruleOfThree,
        affirmations,
        goals,
        announcements,
        milestones,
      ] = await Promise.all([
        this.supabase.from("timeline_events").select("*").eq("user_id", userId),
        this.supabase.from("meetings").select("*").eq("user_id", userId),
        this.supabase.from("contacts").select("*").eq("user_id", userId),
        this.supabase.from("future_events").select("*").eq("user_id", userId),
        this.supabase.from("rule_of_three_tasks").select("*").eq("user_id", userId),
        this.supabase.from("affirmations").select("*").eq("user_id", userId).order("display_order"),
        this.supabase.from("goals").select("*").eq("user_id", userId),
        this.supabase.from("announcements").select("*").eq("user_id", userId),
        this.supabase.from("milestones").select("*").eq("user_id", userId),
      ]);

      // Store synced data
      this.syncedData = {
        timeline: timeline.data || [],
        meetings: meetings.data || [],
        contacts: contacts.data || [],
        futureEvents: futureEvents.data || [],
        ruleOfThree: ruleOfThree.data || [],
        affirmations: affirmations.data || [],
        goals: goals.data || [],
        announcements: announcements.data || [],
        milestones: milestones.data || [],
      };

      console.log("✓ All data fetched:", this.syncedData);
      return this.syncedData;
    } catch (error) {
      console.error("Fetch all data error:", error);
      throw error;
    }
  }

  /**
   * Subscribe to all table changes (real-time)
   */
  subscribeToAllTables() {
    const userId = this.auth.getCurrentUserId();
    const tables = [
      "timeline_events",
      "meetings",
      "contacts",
      "future_events",
      "rule_of_three_tasks",
      "affirmations",
      "goals",
      "announcements",
      "milestones",
    ];

    tables.forEach((table) => {
      const subscription = this.supabase
        .channel(`${table}:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log(`Real-time update on ${table}:`, payload);
            this.handleRealtimeUpdate(table, payload);
          }
        )
        .subscribe();

      this.subscriptions[table] = subscription;
    });
  }

  /**
   * Handle real-time database updates
   */
  handleRealtimeUpdate(table, payload) {
    const eventMap = {
      INSERT: "INSERT",
      UPDATE: "UPDATE",
      DELETE: "DELETE",
    };

    const eventType = eventMap[payload.eventType];
    const dataKey = this.getDataKeyForTable(table);

    if (eventType === "INSERT") {
      if (!this.syncedData[dataKey].find((item) => item.id === payload.new.id)) {
        this.syncedData[dataKey].push(payload.new);
      }
      this.dispatchSyncEvent(`${dataKey}:add`, payload.new);
    } else if (eventType === "UPDATE") {
      const index = this.syncedData[dataKey].findIndex((item) => item.id === payload.new.id);
      if (index >= 0) {
        this.syncedData[dataKey][index] = payload.new;
      }
      this.dispatchSyncEvent(`${dataKey}:update`, payload.new);
    } else if (eventType === "DELETE") {
      this.syncedData[dataKey] = this.syncedData[dataKey].filter((item) => item.id !== payload.old.id);
      this.dispatchSyncEvent(`${dataKey}:delete`, payload.old);
    }
  }

  /**
   * Map table names to data keys
   */
  getDataKeyForTable(table) {
    const mapping = {
      timeline_events: "timeline",
      meetings: "meetings",
      contacts: "contacts",
      future_events: "futureEvents",
      rule_of_three_tasks: "ruleOfThree",
      affirmations: "affirmations",
      goals: "goals",
      announcements: "announcements",
      milestones: "milestones",
    };
    return mapping[table];
  }

  /**
   * Get data by key
   */
  getData(key) {
    return this.syncedData[key] || [];
  }

  /**
   * Add item to table and sync
   */
  async addItem(table, data) {
    const userId = this.auth.getCurrentUserId();

    try {
      const { data: newData, error } = await this.supabase
        .from(table)
        .insert([{ ...data, user_id: userId }])
        .select();

      if (error) throw error;

      console.log(`✓ Item added to ${table}:`, newData);
      return newData[0];
    } catch (error) {
      console.error(`Error adding item to ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update item in table and sync
   */
  async updateItem(table, id, data) {
    try {
      const { data: updatedData, error } = await this.supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log(`✓ Item updated in ${table}:`, updatedData);
      return updatedData[0];
    } catch (error) {
      console.error(`Error updating item in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete item from table and sync
   */
  async deleteItem(table, id) {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log(`✓ Item deleted from ${table}:`, id);
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${table}:`, error);
      throw error;
    }
  }

  /**
   * Dispatch sync event (replaces localStorage dispatchStateChange)
   */
  dispatchSyncEvent(eventType, data) {
    const event = new CustomEvent("supabaseSync", {
      detail: {
        type: eventType,
        data: data,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Record activity log
   */
  async logActivity(action, description) {
    const userId = this.auth.getCurrentUserId();

    try {
      await this.supabase
        .from("activity_log")
        .insert({
          user_id: userId,
          action,
          description,
          timestamp: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      console.warn("Activity log error:", error.message);
      return false;
    }
  }

  /**
   * Cleanup subscriptions
   */
  unsubscribeAll() {
    Object.values(this.subscriptions).forEach((sub) => {
      if (sub) {
        this.supabase.removeChannel(sub);
      }
    });
    this.subscriptions = {};
    console.log("✓ All subscriptions removed");
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    const userId = this.auth.getCurrentUserId();

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Get profile error:", error.message);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    const userId = this.auth.getCurrentUserId();

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select();

      if (error) throw error;

      return data[0];
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
}

// Export for use in app
window.SupabaseDataSync = SupabaseDataSync;
