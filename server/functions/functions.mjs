
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

    async addInCart(productTarget, collections, ref) {
        try {
            const cart = this.db.collection(collections.cart);
            const product = await this.getProduct(collections.products, productTarget);
    
            if (!product || !product.length) {
                throw new Error(JSON.stringify({
                    Error: "productError",
                    Message: "No Product Matched Found"
                }));
            } 

            /** COMMENT THIS IF U DON'T WANT SAME-MULTIPLE PRODUCTS TO BE CART  */

            const isInCart = await this.inCart(collections.cart, productTarget);

            if (isInCart && isInCart.length) {
                throw new Error(JSON.stringify({
                    Error: "cartError",
                    Message: "Product Already In Cart"
                }))
            }

            /** IN-CART CHECK FOR SAME PRODUCT - END CODE LINE----------------  */

            await cart.insertOne({
                productReference: productTarget,
                date: new Date(),
                cartId: ref
            });

            return product;
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

    async placeOrder(options) {
        
    }
}