

const Aside = () => {
    return (
        <aside className="w-64 sticky top-20 hidden md:flex flex-col justify-between space-y-6 border-r border-gray-400 h-[80vh] p-2">
            <menu>
                <h3 className="font-medium mb-3">All products</h3>
                <div className="space-y-2 text-sm">
                    <div className="text-gray-600 hover:text-black cursor-pointer">Headphones</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Computers</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Smart Phones</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Shoes</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">T-Shirts</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Televisions</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Bags</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">All Cables</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Lotions</div>
                </div>
            </menu>

            <menu className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Popular brands with discounts of 20%</h3>
                <div className="flex space-x-2 mb-3">
                    <div className="w-6 h-6 bg-black rounded-full"></div>
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <button className="text-sm text-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                    View more
                </button>
            </menu>
        </aside>
    );
};

export default Aside;