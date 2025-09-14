
export class Functions {
    constructor(DB) {
        this.db = DB;
    }

    async getProduct(collection, criteria) {
        let products = this.db.collection(collection);
        return await products.find(criteria).toArray();
    }
    
    async getProducts(collection) {
        let products = this.db.collection(collection);
        return await products.find({}).toArray();
    }

    async inCart(collection, criteria, cr2) {
        let cart = this.db.collection(collection);
        if (cr2) {
            return await cart.find({ productReference: criteria, [cr2['as']]: cr2['matchAlsoBy'] }).toArray();
        }

        return await cart.find({ productReference: criteria }).toArray();
    }

    async addInCart(productTarget, collections, ref, quantity) {
        try {
            const cart = this.db.collection(collections.cart);
            const product = await this.getProduct(collections.products, productTarget);
    
            if (!product || !product.length) {
                throw new Error(JSON.stringify({
                    Error: "productError",
                    Message: "No Product Matched Found"
                }));
            } 

            /** COMMENT THIS IF U WANT SAME-MULTIPLE PRODUCTS TO BE CART  */

            // const isInCart = await this.inCart(collections.cart, productTarget);

            // if (isInCart && isInCart.length) {
            //     throw new Error(JSON.stringify({
            //         Error: "cartError",
            //         Message: "Product Already In Cart"
            //     }))
            // }

            /** IN-CART CHECK FOR SAME PRODUCT - END CODE LINE----------------  */

            await cart.insertOne({
                productReference: productTarget,
                date: new Date(),
                cartId: ref,
                ...(quantity ? { quantity } : {})
            });

            return product;
        } catch(err) {
            console.error(err);
            return err;
        }
    }

    async removeAllInCart(collections) {
        try {
            const cart = this.db.collection(collections.cart);
            await cart.deleteMany({});

            return "Successfully Deleted All In Cart";
        } catch(err) {
            console.error(err);
            return err;
        }
    }

    async removeInCart(productTarget, collections, ref) {
        try {
            const cart = this.db.collection(collections.cart);
            const isInCart = await this.inCart(collections.cart, productTarget, {
                matchAlsoBy: ref.incartId,
                as: "cartId"
            });

            if (!isInCart || !isInCart.length) {
                throw new Error(JSON.stringify({
                    Error: "cartError",
                    Message: "Unable to delete from cart" // can't match id and names from cart
                }))
            }

            await cart.deleteOne({
                cartId: ref.incartId,
                productReference: productTarget
            });

            return "Successfully Deleted";
        } catch(err) {
            console.error(err);
            return err;
        }
    }

    async getInCart(collection) {
        const cart = this.db.collection(collection);
        return await cart.find({}).toArray();   
    }

    async placeOrder(collections) {
        const products = await this.getProducts(collections.productsCollection);
        const getInCart = await this.getInCart(collections.cartCollection);

        function getPrice() {
            let totalPrice = 0;
            let orderItems = [];
            let itemsTotal = 0;

            getInCart.map((cart) => {
                const product = products.find((prod) => prod['id'] === cart.productReference['id'] && prod['name'] === cart.productReference['name']);
                if (product) {
                    totalPrice += parseFloat(product.price * cart.quantity); 

                    cart.productDetails = { ...product };
                    cart.itemTotal = totalPrice;

                    orderItems.push(cart);
                    itemsTotal += ( 1 * cart.quantity );
                }
            });

            return {
                totalPrice,
                orderItems,
                itemsTotal
            }
        };

        try {
            const order = this.db.collection(collections.orderCollection);
            const cart = this.db.collection(collections.cartCollection);

            const summary = {};

            summary.orderId = `ORDER-${Date.now()}`;
            summary.items = getPrice().orderItems;
            summary.totalAmount = getPrice().totalPrice;
            summary.totalItemsCart = getPrice().orderItems['length'];
            summary.totalItems = getPrice().itemsTotal;
            summary.orderDate = new Date().toISOString();

            order.insertOne(summary);
            cart.deleteMany({});
            
            return summary;

        } catch(err) {
            console.error(err);
            return err;
        }
    }
}