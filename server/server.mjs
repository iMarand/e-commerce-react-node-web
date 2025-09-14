import "dotenv/config";
import cors from 'cors';
import express from "express";
import { MONGOCLIENTCONNECTION as MONGOCLIENT, connectionSignal, TerminateConnection, isCollectionExists } from "./configs/mongodb.config.mjs";
import multer from "multer";
import FS from 'fs';
import path from "path";
import { Functions } from "./functions/functions.mjs";

const app = express();
const upload = multer();
const PORT = 3500;
const MAX_SIZE = "10mb";
const IMAGEPATH = path.join(process.cwd(), "assets");

app.use(cors(), express.urlencoded({ limit: MAX_SIZE }));
app.use(express.json({ limit: MAX_SIZE }));

const COLLECTIONS = {
    PRODUCTS: process.env.PRODUCT_COLLECTION,
    ORDERS: process.env.ORDER_COLLECTION,
    CART: process.env.CART_COLLECTION,
};

// Await Database Connection Here
await MONGOCLIENT;
const DB = connectionSignal.client['db'](process.env.DB_NAME);

const uploadImage = async function(imageFile) {
    const filePath = path.join(IMAGEPATH, imageFile.originalname);
    await FS.promises.writeFile(filePath, imageFile.buffer);

    console.log("File uploaded successfully");
    return filePath;
}

app.get("/products", async function(request, response) {
    const productsExists = await isCollectionExists(COLLECTIONS['PRODUCTS'], DB);

    if (!productsExists) {
        await DB.createCollection(COLLECTIONS.PRODUCTS);
    }

    const products = await new Functions(DB).getProducts(COLLECTIONS.PRODUCTS);
    response.status(200).json(products);
});

app.post("/product", upload.single("image"), async function(request, response) {
    const sentData = request.body;
    const productsExists = await isCollectionExists(COLLECTIONS['PRODUCTS'], DB);

    if (!productsExists) {
        await DB.createCollection(COLLECTIONS.PRODUCTS);
    }

    const productsCollection = DB.collection(COLLECTIONS.PRODUCTS);
    const filePath = request.file ? await uploadImage(request.file) : sentData.imageUrl;

    await productsCollection.insertOne({
        id: sentData.id,
        name: sentData.name,
        price: sentData.price,
        ...(filePath && { image: request.file ? path.normalize(filePath).replace(/\\/g, "/") : filePath })
    });
  
    response.status(200).send(productsExists);
});

app.post("/cart/add", async function(request, response) {
    const { product_id, product_name, inCartId, quantity } = request.body;

    if (!product_id || !product_name) {
        const e = new Object;

        e.message = "Missing all needed info";
        e.error = "Bad Request";

        console.error(e.message);
        return response.status(400).json({
            Error: e.error,
            Message: e.message
        });
    }

    const carted = await new Functions(DB).addInCart({
        id: product_id,
        name: product_name
    }, {
        cart: COLLECTIONS.CART,
        products: COLLECTIONS.PRODUCTS
    }, inCartId, quantity);

    response.status(200).json(carted);
});

app.post("/cart/remove", async function(request, response) {
    const removeAll = (request.query.all == true);

    if (removeAll) {
        const uncart = await new Functions(DB).removeAllInCart({
            cart: COLLECTIONS.CART,
            products: COLLECTIONS.PRODUCTS
        });
    
        response.status(200).json(uncart);
    } else {
        const { product_id, product_name, inCartId } = request.body;
    
        if (!product_id || !product_name) {
            const e = new Object;
    
            e.message = "Missing all needed info";
            e.error = "Bad Request";
    
            console.error(e.message);
            return response.status(400).json({
                Error: e.error,
                Message: e.message
            });
        }
    
        const uncart = await new Functions(DB).removeInCart({
            id: product_id,
            name: product_name
        }, {
            cart: COLLECTIONS.CART,
            products: COLLECTIONS.PRODUCTS
        }, {
            incartId: inCartId,
        });
    
        response.status(200).json(uncart);
    }
});

app.get("/cart", async function(request, response) {
    const cartExists = await isCollectionExists(COLLECTIONS['CART'], DB);

    if (!cartExists) {
        await DB.createCollection(COLLECTIONS.CART);
    }

    const inCart = await new Functions(DB).getInCart(COLLECTIONS.CART);
    response.status(200).json(inCart);
});

app.post("/order", async function(request, response) {
    const orderExists = await isCollectionExists(COLLECTIONS['ORDER'], DB);

    if (!orderExists) {
        await DB.createCollection(COLLECTIONS.ORDERS);
    }

    const makeOrder = await new Functions(DB).placeOrder({
        orderCollection: COLLECTIONS.ORDERS,
        cartCollection: COLLECTIONS.CART,
        productsCollection: COLLECTIONS.PRODUCTS,
    });

    response.status(200).json(makeOrder);
})

app.get("/", async function(request, response) {
    response.status(200).send("Welcome to our server");
});

// app.get("/terminate", async function(request, response) {
//     await TerminateConnection();
//     response.status(200).send("Terminated Connection" + connectionSignal.connected);
// })

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
})