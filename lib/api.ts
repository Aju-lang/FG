// API Service for FG School Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Student {
  id: string;
  username: string;
  email: string;
  name: string;
  class: string;
  division: string;
  parentName: string;
  place: string;
  rollNumber?: string;
  phone?: string;
  role: string;
  bio?: string;
  mission?: string;
  skills?: string[];
  interests?: string[];
  academicGoals?: string[];
  favoriteSubjects?: string[];
  achievements?: Array<{
    title: string;
    description: string;
    date: string;
    category: string;
  }>;
  totalPoints?: number;
  certificates?: number;
  rewardPoints?: number;
  qrCodeImage?: string;
  marks?: Record<string, any>;
  attendance?: Record<string, any>;
  certificates_earned?: any[];
  classes_attended?: any[];
  leadership_position?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: Student;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  student: {
    id: string;
    username: string;
    password: string;
    email: string;
    name: string;
    qrCodeImage: string;
    qrToken: string;
  };
}

// API Helper Functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Register a new student
  register: async (studentData: {
    name: string;
    email: string;
    class: string;
    division: string;
    parentName: string;
    place: string;
    rollNumber?: string;
    phone?: string;
  }): Promise<RegisterResponse> => {
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  // Login with username/password
  login: async (username: string, password: string, role: string = 'student'): Promise<LoginResponse> => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  },

  // Login with QR code
  loginQR: async (qrToken: string, role: string = 'student'): Promise<LoginResponse> => {
    return apiRequest('/login-qr', {
      method: 'POST',
      body: JSON.stringify({ qrToken, role }),
    });
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; user: Student }> => {
    return apiRequest('/me');
  },

  // Update user profile
  updateProfile: async (profileData: Partial<Student>): Promise<{ success: boolean; message: string; user: Student }> => {
    return apiRequest('/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Bulk register students from CSV
  registerBulk: async (csvFile: File): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      name: string;
      success: boolean;
      username?: string;
      password?: string;
      email?: string;
      qrCodeImage?: string;
      error?: string;
    }>;
  }> => {
    const formData = new FormData();
    formData.append('csv', csvFile);

    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/register-bulk`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Bulk registration failed');
    }

    return data;
  },
};

// Utility functions
export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// EmailJS integration
export const sendWelcomeEmail = async (studentData: {
  email: string;
  username: string;
  password: string;
  qrCodeImage: string;
}) => {
  try {
    const emailjs = (await import('@emailjs/browser')).default;
    
    const templateParams = {
      student_email: studentData.email,
      username: studentData.username,
      password: studentData.password,
      qr_code: studentData.qrCodeImage,
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_4pcybvf',
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_jeniuml',
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw error;
  }
}; 