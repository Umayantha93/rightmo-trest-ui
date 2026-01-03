import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import './ProductDetail.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string | null;
  image_url: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    rating: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get<{ data: Product }>(`/products/${id}`);
      const productData = response.data.data || response.data;
      setProduct(productData);
      setFormData({
        name: productData.name || '',
        category: productData.category || '',
        price: productData.price?.toString() || '0',
        rating: productData.rating?.toString() || '0',
        description: productData.description || '',
      });
    } catch (err) {
      setError('Failed to fetch product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('description', formData.description);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      formDataToSend.append('_method', 'PUT');

      const response = await apiClient.post(`/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the product with the response data
      const updatedProduct = response.data.data || response.data;
      setProduct(updatedProduct);
      
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
      
      // Optionally refetch to ensure we have latest data
      await fetchProduct();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiClient.delete(`/products/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    }
  };

  const getImageUrl = (imageUrl: string | null, imagePath: string | null) => {
    if (imageUrl) return imageUrl;
    if (!imagePath) return 'https://via.placeholder.com/600x400?text=No+Image';
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${imagePath}`;
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        {!isEditing && (
          <div className="action-buttons">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit Product
            </button>
            <button onClick={handleDelete} className="delete-btn">
              Delete Product
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {!isEditing ? (
        <div className="product-detail-content">
          <div className="product-image-large">
            <img src={getImageUrl(product.image_url, product.image)} alt={product.name} />
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="category-badge">{product.category}</p>

            <div className="product-meta">
              <div className="meta-item">
                <span className="label">Price:</span>
                <span className="price">${Number(product.price).toFixed(2)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Rating:</span>
                <span className="rating">⭐ {Number(product.rating).toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            <div className="product-dates">
              <p><strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(product.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="product-edit-form">
          <h2>Edit Product</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="rating">Rating *</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="5"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Product Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(imagePreview || product.image) && (
                <div className="image-preview">
                  <img 
                    src={imagePreview || getImageUrl(product.image_url, product.image)} 
                    alt="Preview" 
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
