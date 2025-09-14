import React from 'react';
import { Search, Heart, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ cartCount, onCartClick, searchQuery, setSearchQuery }) => {
    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <figure className="flex items-center space-x-8">
                        <Link to="/" className="hidden md:flex space-x-8">
                            <h2 className="text-2xl font-bold text-gray-600">E-Commerce</h2>
                        </Link>
                    </figure>
                    
                    <figure className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <Link to="/favorite" aria-label="Wishlist">
                            <Heart className="w-6 h-6 text-gray-600 hover:text-red-500 cursor-pointer" />
                        </Link>
                        <Link to="/cart" className="relative cursor-pointer" onClick={onCartClick} aria-label="Shopping Cart">
                            <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-black" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button aria-label="User Account">
                            <User className="w-6 h-6 text-gray-600 hover:text-black cursor-pointer" />
                        </button>
                    </figure>
                </div>
            </main>
        </header>
    );
};

export default Header;