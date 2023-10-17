const Menu = require("../../../models/menu");

function cartCtrl() {
    return {
        index(req, res) {
            res.render("customer/cart");
        },
        update(req, res) {
            // first checks if the cart object exists in the user’s session
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            };
            // Check if item does not exist in the cart
            let cart = req.session.cart;
            if (!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    itemQty: 1
                }
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            } else {
                cart.items[req.body._id].itemQty = cart.items[req.body._id].itemQty + 1;
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            }
            // console.log(cart);
            return res.json({ totalQty: cart.totalQty })
        }
    }
};
module.exports = cartCtrl