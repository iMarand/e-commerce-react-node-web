import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Loader2, Heart } from 'lucide-react';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(savedFavorites);
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3500/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        }
    };

    const fetchCartItems = async () => {
        try {
            const response = await fetch('http://localhost:3500/cart');
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            const data = await response.json();
            setCartItems(data);
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchCartItems()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const getProductDetails = (productId) => {
        return products.find(product => product.id === productId);
    };

    const toggleFavorite = (product) => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isAlreadyFavorite = savedFavorites.some(fav => fav.id === product.id);
        
        let updatedFavorites;
        if (isAlreadyFavorite) {
            updatedFavorites = savedFavorites.filter(fav => fav.id !== product.id);
        } else {
            updatedFavorites = [...savedFavorites, product];
        }
        
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
    };

    const isFavorite = (productId) => {
        return favorites.some(fav => fav.id === productId);
    };

    const removeItem = async (cartId) => {
        const item = cartItems.find(cartItem => cartItem.cartId === cartId);
        if (!item) return;

        setUpdatingItems(prev => new Set(prev).add(cartId));
        
        try {
            const removeData = {
                product_id: item.productReference.id,
                product_name: item.productReference.name,
                inCartId: cartId
            };

            const response = await fetch('http://localhost:3500/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(removeData)
            });

            if (response.ok) {
                setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
            } else {
                console.error('Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartId);
                return newSet;
            });
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = getProductDetails(item.productReference.id);
            return product ? total + (product.price * parseInt(item.quantity)) : total;
        }, 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const proceedToCheckout = () => {
        window.location.href = '/checkout';
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <span className="text-gray-600">Loading cart...</span>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <section className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </section>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <section className="text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500">Add some products to get started!</p>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-4">
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
                </header>

                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {cartItems.map((item) => {
                            const product = getProductDetails(item.productReference.id);
                            const isUpdating = updatingItems.has(item.cartId);
                            
                            if (!product) {
                                return (
                                    <li key={item.cartId} className="p-6 bg-red-50">
                                        <p className="text-red-600">Product not found: {item.productReference.name}</p>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.cartId} className={`p-6 ${isUpdating ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center space-x-4">
                                        <figure className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            <img className="w-full h-full object-cover" src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://questlab.pro/computing/gpu-cloud.jpg'; }} />
                                        </figure>

                                        <article className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                                            <p className="text-sm text-gray-500 mb-1">Product ID: {product.id}</p>
                                            <p className="text-sm text-gray-500">Added: {formatDate(item.date)}</p>
                                            <p className="text-lg font-bold text-gray-900 mt-2">${product.price}</p>
                                        </article>

                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                                                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[50px] text-center">
                                                    {item.quantity}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Total</p>
                                                <p className="text-xl font-bold text-gray-900">${(product.price * parseInt(item.quantity)).toFixed(2)}</p>
                                            </div>

                                            <button className="p-2 rounded-lg transition-colors hover:bg-red-50" onClick={() => toggleFavorite(product)} disabled={isUpdating}>
                                                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                                            </button>

                                            <button className="p-2 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => removeItem(item.cartId)} disabled={isUpdating} style={{background: "#9e454569"}}>
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <footer className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Cart Summary</h2>
                            <p className="text-gray-600">Total items: {cartItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Grand Total</p>
                            <p className="text-3xl font-bold text-orange-600">${calculateTotal().toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl" onClick={proceedToCheckout}>
                            Proceed to Checkout
                        </button>
                        <button className="px-6 py-4 text-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors" onClick={() => window.location.reload()}>
                            Refresh Cart
                        </button>
                    </div>
                </footer>
            </div>
        </main>
    );
};

export default Cart;