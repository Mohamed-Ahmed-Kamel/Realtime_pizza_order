const Order = require("../../../models/order")
const moment = require('moment');
function orderCtrl() {
    return {
        store(req, res) {
            // Validate request
            const { phone, address } = req.body;
            if (!phone || !address) {
                req.flash('error', 'All field are required')
                return res.redirect('/cart')
            }
            const newOrder = new Order(
                {
                    userID: req.user._id,
                    items: req.session.cart.items,
                    phone,
                    address
                }
            ).save().then(async (result) => {
                console.log(result)
                await Order.populate(result, { path: 'userID' });
                req.flash('success', 'Order placed successfully')
                delete req.session.cart
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderPlaced', result)
                console.log(result)
                return res.redirect('/customers/orders')
            }).catch((err) => {
                console.log(err)
                req.flash('error', 'Somethine went wrog')
                return res.redirect('/cart')
            });
        },
        async index(req, res) {
            // Get order's user
            const orders = await Order.find({ userID: req.user._id }, null, { sort: { 'createdAt': -1 } });
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customer/orders', { orders, moment })
        },
        async showStatus(req, res) {
            const { id } = req.params;
            const order = await Order.findById(id);
            /*
                Checking if the ID of the currently logged-in user is the same as the ID of the user who placed the order.
            */
            if (req.user._id.toString() === order.userID.toString()) {
                res.render('customer/singleOrder', { order })
            } else return res.redirect('/')
        }
    }
}
module.exports = orderCtrl