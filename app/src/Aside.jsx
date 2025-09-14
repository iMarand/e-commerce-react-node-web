

const Aside = () => {
    return (
        <aside className="w-64 space-y-6 border-r border-orange-400 h-[80vh] p-2">
            <menu>
                <h3 className="font-medium mb-3">Clothes and shoes</h3>
                <div className="space-y-2 text-sm">
                    <div className="text-gray-600 hover:text-black cursor-pointer">Shoes</div>
                    <div className="text-gray-600 hover:text-black cursor-pointer">Hoodies</div>
                </div>
            </menu>

            <menu className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Popular brands with discounts over 25%</h3>
                <div className="flex space-x-2 mb-3">
                    <div className="w-6 h-6 bg-black rounded-full"></div>
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <button className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                    View more
                </button>
            </menu>
        </aside>
    );
};

export default Aside;