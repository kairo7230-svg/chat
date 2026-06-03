import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginRequest } from '../utils/api.js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginRequest({ email, password });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Unable to login. Check credentials.');
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userName', data.user.name);
      toast.success('Login successful! Redirecting to dashboard.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        <p style={styles.subtitle}>Use your account to access the dashboard.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={styles.toggleButton}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don’t have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#eef2ff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.2rem',
    borderRadius: '16px',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    color: '#111827',
    fontSize: '2rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0.75rem 0 1.75rem',
    color: '#4b5563',
    fontSize: '0.95rem',
  },
  form: {
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#4b5563',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPassword: {
    width: '100%',
    padding: '0.85rem 3.5rem 0.85rem 1rem',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
  },
  toggleButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#4338ca',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  button: {
    width: '100%',
    padding: '0.95rem',
    backgroundColor: '#4338ca',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  footerText: {
    marginTop: '1.25rem',
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  link: {
    color: '#4338ca',
    textDecoration: 'none',
    fontWeight: '700',
  }
};

export default Login;