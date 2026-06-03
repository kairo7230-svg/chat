import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchProducts, clearAuth } from '../utils/api.js';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Guest';

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts();
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          toast.error('Session expired. Please log in again.');
          handleLogout();
          return;
        }

        if (!response.ok || !data.success) {
          toast.error(data.message || 'Could not load products.');
          return;
        }

        setProducts(data.products || []);
      } catch (error) {
        toast.error('Unable to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Hello, {userName}</h1>
          <p style={styles.subtitle}>Here are the available products for your session.</p>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div style={styles.productGrid}>
        {loading ? (
          <p style={styles.loadingText}>Loading products...</p>
        ) : products.length ? (
          products.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <h2 style={styles.productName}>{product.name}</h2>
              <p style={styles.productDescription}>{product.description}</p>
              <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p style={styles.loadingText}>No products available right now.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#eef2ff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '1rem'
  },
  title: {
    margin: 0,
    fontSize: '2.2rem',
    color: '#111827'
  },
  subtitle: {
    marginTop: '0.5rem',
    color: '#4b5563',
    fontSize: '1rem'
  },
  logoutButton: {
    padding: '0.9rem 1.4rem',
    backgroundColor: '#4338ca',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  productGrid: {
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '1.5rem',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
  },
  productName: {
    margin: '0 0 0.75rem',
    color: '#111827',
    fontSize: '1.35rem'
  },
  productDescription: {
    margin: 0,
    color: '#4b5563',
    lineHeight: 1.6,
  },
  productPrice: {
    marginTop: '1.25rem',
    color: '#4338ca',
    fontSize: '1.15rem',
    fontWeight: '700'
  },
  loadingText: {
    color: '#4b5563',
    fontSize: '1rem'
  }
};

export default Dashboard;
