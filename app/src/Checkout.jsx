import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, ShoppingBag, CreditCard, ArrowLeft, Package } from 'lucide-react';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderSummary, setOrderSummary] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const productsResponse = await fetch('http://localhost:3500/products');
                if (!productsResponse.ok) throw new Error('Failed to fetch products');
                const productsData = await productsResponse.json();
                setProducts(productsData);

                const cartResponse = await fetch('http://localhost:3500/cart');
                if (!cartResponse.ok) throw new Error('Failed to fetch cart items');
                const cartData = await cartResponse.json();
                setCartItems(cartData);
                
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getProductDetails = (productId) => {
        return products.find(product => product.id === productId);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = getProductDetails(item.productReference.id);
            return product ? total + (product.price * parseInt(item.quantity)) : total;
        }, 0);
    };

    const handlePlaceOrder = async () => {
        setProcessing(true);
        setError(null);

        try {
            const orderItems = cartItems.map(item => {
                const product = getProductDetails(item.productReference.id);
                return {
                    ...item,
                    productDetails: product,
                    itemTotal: product ? product.price * parseInt(item.quantity) : 0
                };
            });

            const totalAmount = calculateTotal();
            const totalItems = cartItems.reduce((sum, item) => sum + parseInt(item.quantity), 0);

            const response = await fetch('http://localhost:3500/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to place order');
            const result = await response.json();
            
            setOrderSummary(result);
            setOrderComplete(true);

        } catch (err) {
            console.error('Error placing order:', err);
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const goBackToCart = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <span className="text-gray-600">Loading checkout...</span>
                </div>
            </main>
        );
    }

    if (error && !orderComplete) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <section className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <div className="space-x-4">
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors" onClick={() => window.location.reload()}>
                            Try Again
                        </button>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors" onClick={goBackToCart}>
                            Back to Cart
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    if (cartItems.length === 0 && !orderComplete) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <section className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">No items to checkout</h2>
                    <p className="text-gray-500 mb-4">Your cart is empty!</p>
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors" onClick={goBackToCart}>
                        Back to Cart
                    </button>
                </section>
            </main>
        );
    }

    if (orderComplete && orderSummary) {
        return (
            <main className="min-h-screen bg-white py-4">
                <div className="max-w-4xl mx-auto px-4">
                    <header className="mb-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                        <p className="text-gray-600">Thank you for your purchase</p>
                        <p className="text-sm text-gray-500 mt-2">Order ID: {orderSummary.orderId}</p>
                    </header>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-orange-500" />
                                Order Summary
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Placed on {new Date(orderSummary.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        
                        <ul className="divide-y divide-gray-100">
                            {orderSummary.items.map((item) => {
                                const product = item.productDetails;
                                if (!product) return <li key={item.cartId} className="p-6 bg-red-50"><p className="text-red-600">Product not found: {item.productReference.name}</p></li>;

                                return (
                                    <li key={item.cartId} className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <figure className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                <img className="w-full h-full object-cover" src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://questlab.pro/computing/gpu-cloud.jpg'; }} />
                                            </figure>
                                            <article className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                <p className="text-sm text-gray-500">Product ID: {product.id}</p>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                <p className="text-lg font-bold text-gray-900 mt-1">${product.price} each</p>
                                            </article>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Item Total</p>
                                                <p className="text-xl font-bold text-gray-900">${item.itemTotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <footer className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Total</h3>
                                <p className="text-gray-600">Total items: {orderSummary.totalItems}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Grand Total</p>
                                <p className="text-3xl font-bold text-green-600">${orderSummary.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">Your order has been received and is being processed.</p>
                            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-8 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl" onClick={() => window.location.href = '/'}>
                                Continue Shopping
                            </button>
                        </div>
                    </footer>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white py-4">
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-8 flex justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                        <p className="text-gray-600">Review your order and complete your purchase</p>
                    </div>
                    <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors" onClick={goBackToCart} style={{background: "transparent", border: "none"}}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </button>
                </header>

                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Order Review</h2>
                    </div>
                    
                    <ul className="divide-y divide-gray-100">
                        {cartItems.map((item) => {
                            const product = getProductDetails(item.productReference.id);
                            if (!product) return <li key={item.cartId} className="p-6 bg-red-50"><p className="text-red-600">Product not found: {item.productReference.name}</p></li>;

                            return (
                                <li key={item.cartId} className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <figure className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            <img className="w-full h-full object-cover" src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://questlab.pro/computing/gpu-cloud.jpg'; }} />
                                        </figure>
                                        <article className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-500">Product ID: {product.id}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            <p className="text-lg font-bold text-gray-900 mt-1">${product.price} each</p>
                                        </article>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Item Total</p>
                                            <p className="text-xl font-bold text-gray-900">${(product.price * parseInt(item.quantity)).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <footer className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order Total</h2>
                            <p className="text-gray-600">Total items: {cartItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Grand Total</p>
                            <p className="text-3xl font-bold text-orange-600">${calculateTotal().toFixed(2)}</p>
                        </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" onClick={handlePlaceOrder} disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Processing Order...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5 mr-2" />
                                Place Order
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </main>
    );
};

export default Checkout;