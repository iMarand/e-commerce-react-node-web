
import Aside from "./Aside";
import Card from "./Card";

const ProductGrid = ({ products, onProductClick }) => {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
                <Card key={index} product={product} onProductClick={onProductClick} />
            ))}
        </section>
    );
};

function Home({ products, handleProductClick, searchQuery, filteredProducts, loading }) {
    
    return (
        <>
            <div className="flex relative gap-8">
                <Aside />
                <section className="flex-1">
                    <header className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">
                            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
                        </h1>
                        <p className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{filteredProducts.length} products</span>
                        </p>
                    </header>

                    {filteredProducts.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No products found.</p>
                        </div>
                    ) : (
                        <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
                    )}
                </section>
            </div>
        </>
    )
}

export default Home;