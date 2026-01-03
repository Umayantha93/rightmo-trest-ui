import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string | null;
  description: string;
}

interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ProductsResponse {
  data: Product[];
  links: PaginationLinks;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];

  useEffect(() => {
    fetchProducts();
  }, [search, category, sortBy, sortOrder, minPrice, maxPrice, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page: currentPage,
        per_page: 12,
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (sortBy) params.sort_by = sortBy;
      if (sortOrder) params.sort_order = sortOrder;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const response = await axios.get<ProductsResponse>('http://localhost:8000/api/products', { params });
      setProducts(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('created_at');
    setSortOrder('desc');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return 'https://via.placeholder.com/300x200?text=No+Image';
    return `http://localhost:8000/storage/${image}`;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Product Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Category</label>
            <select value={category} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={handleSortChange}>
              <option value="created_at">Date</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order</label>
            <select value={sortOrder} onChange={handleSortOrderChange}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={handleMinPriceChange}
            />
          </div>

          <div className="filter-group">
            <label>Max Price</label>
            <input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={handleMaxPriceChange}
            />
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">Clear Filters</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <div className="products-info">
            <p>Showing {products.length} of {total} products</p>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="product-image">
                  <img src={getImageUrl(product.image)} alt={product.name} />
                </div>
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <div className="product-footer">
                    <span className="price">${Number(product.price).toFixed(2)}</span>
                    <span className="rating">⭐ {Number(product.rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="no-products">No products found</div>
          )}

          {lastPage > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {lastPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === lastPage}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
