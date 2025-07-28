// src/api.js - Updated with environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Algorithm execution - FIXED URL
export async function runAlgorithm(requestBody) {
  console.log('API call with data:', requestBody);
  
  try {
    // 🔧 FIXED: Added /algorithms/ to the path
    const response = await fetch(`${API_BASE_URL}/api/graphs/algorithms/${requestBody.algorithm}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API result:', result);
    return result;
    
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Authentication API calls
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Graph management API calls
export async function saveGraph(graphData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graphs/save_graph`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(graphData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save graph: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Save graph error:', error);
    throw error;
  }
}

export async function loadGraphs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graphs/user_graphs`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load graphs: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Load graphs error:', error);
    throw error;
  }
}

export async function getAlgorithmHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graphs/algorithms/results`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get history error:', error);
    throw error;
  }
}
