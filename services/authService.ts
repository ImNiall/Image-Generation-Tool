interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthService {
  private storageKey = 'drivediagram_users';
  private currentUserKey = 'drivediagram_current_user';

  private getStoredUsers(): User[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  private getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.currentUserKey);
    return stored ? JSON.parse(stored) : null;
  }

  private setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.currentUserKey);
    }
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getStoredUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
          reject(new Error('User already exists'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          createdAt: new Date().toISOString()
        };

        // Store password separately (in real app, this would be hashed)
        const userWithPassword = { ...newUser, password };
        users.push(userWithPassword);
        this.saveUsers(users);
        
        // Set as current user
        this.setCurrentUser(newUser);
        
        resolve(newUser);
      }, 500); // Simulate API delay
    });
  }

  async login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email && (u as any).password === password);
        
        if (!user) {
          reject(new Error('Invalid credentials'));
          return;
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user as any;
        this.setCurrentUser(userWithoutPassword);
        
        resolve(userWithoutPassword);
      }, 500); // Simulate API delay
    });
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  getAuthState(): AuthState {
    const user = this.getCurrentUser();
    return {
      user,
      isAuthenticated: !!user
    };
  }

  // Check if user is authenticated on app load
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export const authService = new AuthService();
export type { User, AuthState };
