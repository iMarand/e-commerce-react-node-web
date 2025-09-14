import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './Header';
import Aside from './Aside';
import Card from './Card';
import Cart from './Cart';
import Home from './Home';
import Favorites from './Favorite';

// const ProductGrid = ({ products, onProductClick }) => {
//     return (
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {products.map((product, index) => (
//                 <Card key={index} product={product} onProductClick={onProductClick} />
//             ))}
//         </section>
//     );
// };

const Main = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3500/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-white">
                <Header cartCount={0} onCartClick={() => {}} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading products...</p>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-white">
                <Header cartCount={0} onCartClick={() => {}} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <article className="text-center">
                            <p className="text-red-600 mb-4">Error: {error}</p>
                            <button className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800" onClick={() => window.location.reload()}>
                                Try Again
                            </button>
                        </article>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <Header cartCount={0} onCartClick={() => {}} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <menu className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path='/cart' element={<Cart />}></Route>
                    <Route path='/favorite' element={<Favorites />}></Route>
                    <Route path='/' element={<Home products={products} filteredProducts={filteredProducts} handleProductClick={handleProductClick} searchQuery={searchQuery}/>}></Route>
                </Routes>
            </menu>
        </main>
    );
};

export default Main;