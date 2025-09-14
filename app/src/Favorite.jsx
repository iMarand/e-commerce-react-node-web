import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Plus, Minus, Trash2, Loader2 } from 'lucide-react';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [addingToCart, setAddingToCart] = useState(new Set());

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(savedFavorites);
        
        const initialQuantities = {};
        savedFavorites.forEach(product => {
            initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
    }, []);


    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
        }));
    };

    const removeFromFavorites = (productId) => {
        const updatedFavorites = favorites.filter(product => product.id !== productId);
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Remove from quantities as well
        setQuantities(prev => {
            const newQuantities = { ...prev };
            delete newQuantities[productId];
            return newQuantities;
        });
    };

    const addToCart = async (product) => {
        const quantity = quantities[product.id] || 1;
        setAddingToCart(prev => new Set(prev).add(product.id));

        try {
            const response = await fetch('http://localhost:3500/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: quantity.toString()
                })
            });

            if (response.ok) {
                alert(`${product.name} added to cart with quantity ${quantity}!`);
            } else {
                console.error('Failed to add to cart');
                alert('Failed to add item to cart. Please try again.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding item to cart. Please try again.');
        } finally {
            setAddingToCart(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.id);
                return newSet;
            });
        }
    };

    if (favorites.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">No favorites yet</h2>
                    <p className="text-gray-500">Start adding products to your favorites!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-4 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
                    <p className="text-gray-600">{favorites.length} favorite item{favorites.length !== 1 ? 's' : ''}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((product) => {
                        const isAddingToCart = addingToCart.has(product.id);
                        const currentQuantity = quantities[product.id] || 1;

                        return (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="relative">
                                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => { 
                                                e.target.src = 'https://questlab.pro/computing/gpu-cloud.jpg'; 
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromFavorites(product.id)}
                                        className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
                                    >
                                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">Product ID: {product.id}</p>
                                    
                                    <div className="mb-4">
                                        <p className="text-2xl font-bold text-orange-600">${product.price}</p>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-600">Quantity:</span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                                                disabled={currentQuantity <= 1}
                                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="w-4 h-4 text-white" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-100 rounded-lg min-w-[40px] text-center font-semibold">
                                                {currentQuantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total:</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                ${(product.price * currentQuantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={isAddingToCart}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {isAddingToCart ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Adding...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-4 h-4" />
                                                    <span>Add to Cart</span>
                                                </>
                                            )}
                                        </button>
                                        
                                        <button
                                            onClick={() => removeFromFavorites(product.id)}
                                            className="p-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                            title="Remove from favorites"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Clear All Favorites Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to clear all favorites?')) {
                                setFavorites([]);
                                setQuantities({});
                                localStorage.removeItem('favorites');
                            }
                        }}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Clear All Favorites
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Favorites;