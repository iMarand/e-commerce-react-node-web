import React, { useState, useEffect } from 'react';
import { Heart, Plus, Minus, X, ShoppingCart, Star } from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose, quantity, onQuantityChange }) => {
    console.log(product);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !product) return null;

    const handleIncrement = () => {
        onQuantityChange(quantity + 1);
    };

    const handleDecrement = () => {
        onQuantityChange(Math.max(0, quantity - 1));
    };

    const handleAddToCart = async () => {
        if (quantity > 0) {
            setIsLoading(true);
            try {
                const cartData = {
                    product_id: product.id,
                    product_name: product.name,
                    inCartId: crypto.randomUUID(),
                    quantity: quantity.toString()
                };

                const response = await fetch('http://localhost:3500/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cartData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Successfully added to cart:', result);
                    // Optionally close the modal or show success message
                    onClose();
                } else {
                    console.error('Failed to add to cart:', response.statusText);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/20 transition-opacity duration-300 z-40 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} onClick={onClose} />
            
            <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <section className="h-full overflow-y-auto">
                    <header className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                        <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose} aria-label="Close product details">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </header>

                    <main className="p-6 space-y-6">
                        <figure className="relative">
                            <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl overflow-hidden">
                                <img className="w-full h-full object-cover" src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://questlab.pro/computing/gpu-cloud.jpg'; }} />
                            </div>
                            <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                            </div>
                        </figure>

                        <section className="space-y-4">
                            <main className="flex justify-between">
                                <header>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                                </header>

                                <section className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3">
                                    <p className="flex items-baseline space-x-2">
                                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                                        <span className="text-sm text-gray-500 line-through">${(product.price * 1.2).toFixed(2)}</span>
                                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">20% OFF</span>
                                    </p>
                                </section>
                            </main>

                            <fieldset className="space-y-3">
                                <legend className="block text-sm font-medium text-gray-700">Quantity</legend>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <button className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" onClick={handleDecrement} disabled={quantity === 0} aria-label="Decrement quantity">
                                            <Minus className="w-4 h-4 text-white" /> 
                                        </button>
                                        <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center" aria-live="polite">{quantity}</span>
                                        <button className="p-3 hover:bg-gray-100 transition-colors" onClick={handleIncrement} aria-label="Increment quantity">
                                            <Plus className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    {quantity > 0 && (
                                        <p className="text-right">
                                            <span className="text-sm text-gray-500">Total</span>
                                            <span className="block text-xl font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</span>
                                        </p>
                                    )}
                                </div>
                            </fieldset>
                            
                            <article className="space-y-3">
                                <h3 className="font-medium text-gray-900">Description</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    High-quality product crafted with premium materials and attention to detail.
                                    Features excellent durability, modern design, and outstanding performance.
                                    Perfect for daily use with a sleek aesthetic that complements any style.
                                </p>
                            </article>
                        </section>
                    </main>

                    <footer className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-3">
                        <button 
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl" 
                            onClick={handleAddToCart} 
                            disabled={quantity === 0 || isLoading}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>
                                {isLoading ? 'Adding...' : `Add to Cart ${quantity > 0 ? `(${quantity})` : ''}`}
                            </span>
                        </button>
                    </footer>
                </section>
            </aside>
        </>
    );
};

const Card = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorite = favorites.some(fav => fav.id === product.id);
        setIsLiked(isFavorite);
    }, [product.id]);

    const handleIncrement = (e) => {
        e.stopPropagation();
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        setQuantity(prev => Math.max(0, prev - 1));
    };

    const handleLike = (e) => {
        e.stopPropagation();
        
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isCurrentlyLiked = favorites.some(fav => fav.id === product.id);
        
        if (isCurrentlyLiked) {
            const updatedFavorites = favorites.filter(fav => fav.id !== product.id);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setIsLiked(false);
        } else {
    
            const favoriteProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                ...product
            };
            
            const updatedFavorites = [...favorites, favoriteProduct];
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setIsLiked(true);
        }
    };

    const handleCardClick = () => {
        setIsModalOpen(true);
        setModalQuantity(Math.max(1, quantity));
    };

    const handleQuickAddToCart = async (e) => {
        e.stopPropagation();
        if (quantity > 0) {
            setIsLoading(true);
            try {
                const cartData = {
                    product_id: product.id,
                    product_name: product.name,
                    inCartId: crypto.randomUUID(),
                    quantity: quantity.toString()
                };

                const response = await fetch('http://localhost:3500/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cartData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Successfully added to cart:', result);
                } else {
                    console.error('Failed to add to cart:', response.statusText);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <article product_id={product.id} className="group cursor-pointer bg-white rounded-xl shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleCardClick}>
                <figure className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden aspect-square">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://questlab.pro/computing/gpu-cloud.jpg'; }} />
                    
                    <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <div className="flex items-center flex-col justify-between bg-white/95 backdrop-blur-sm rounded-xl py-3 px-4 shadow-lg border border-white/50">
                            <div className="flex items-center space-x-3">
                                <button className="w-8 h-8 flex items-center text-white justify-center border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" onClick={handleDecrement} disabled={quantity === 0} aria-label="Decrement item quantity">
                                    <Minus className="w-4 h-4 text-white" /> -
                                </button>
                                <span className="w-8 text-center font-semibold text-gray-900" aria-live="polite">{quantity}</span>
                                <button className="w-8 h-8 text-white flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors" onClick={handleIncrement} aria-label="Increment item quantity">
                                    <Plus className="w-4 h-4 text-white" /> +
                                </button>
                            </div>
                            {quantity > 0 && (
                                <button className="bg-orange-500 w-full mt-1 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1" onClick={handleQuickAddToCart} disabled={isLoading}>
                                    <ShoppingCart className="w-3 h-3" />
                                    <span>{isLoading ? 'Adding...' : 'Add'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <button className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${isLiked ? 'bg-red-50 text-red-500 shadow-lg' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50'}`} onClick={handleLike} aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}>
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                </figure>

                <section className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>
                    <div className="flex items-center justify-between">
                        <p className="flex items-baseline space-x-2">
                            <span className="text-xl font-bold text-gray-900">${product.price}</span>
                            <span className="text-xs text-gray-500 line-through">${(product.price * 1.2).toFixed(1)}</span>
                        </p>
                        {quantity > 0 && (
                            <p className="text-right">
                                <span className="text-xs text-gray-500">Total</span>
                                <span className="block text-lg font-bold text-orange-600">${(product.price * quantity).toFixed(1)}</span>
                            </p>
                        )}
                    </div>
                </section>
            </article>

            <ProductDetailModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} quantity={modalQuantity} onQuantityChange={setModalQuantity} />
        </>
    );
};

export default Card;