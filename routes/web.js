const homeCtrl = require('../app/http/controllers/homeCtrl');
const authCtrl = require('../app/http/controllers/authCtrl');
const cartCtrl = require('../app/http/controllers/customer/cartCtrl');
const orderCtrl = require('../app/http/controllers/customer/orderCtrl');
const adminOrderCtrl = require('../app/http/controllers/admin/orderCtrl');
const statusCtrl = require('../app/http/controllers/admin/statusCtrl');

// Middlewares
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');

function initRoute(app) {
    app.get("/", homeCtrl().index);
    app.post("/add-pizza", homeCtrl().newPizza);

    app.get("/login", guest, authCtrl().loginPage);
    app.post("/login", authCtrl().loginPost);

    app.get("/register", guest, authCtrl().registerPage);
    app.post("/register", authCtrl().register);

    app.post("/logout", authCtrl().logout);

    app.get("/cart", cartCtrl().index);
    app.post("/update-cart", cartCtrl().update);

    // Customer Routes
    app.post('/orders', auth, orderCtrl().store)
    app.get('/customers/orders', auth, orderCtrl().index)
    app.get('/customers/orders/:id', auth, orderCtrl().showStatus)

    // Admen Routes
    app.get('/admin/orders', admin, adminOrderCtrl().index)
    app.post('/admin/orders/status', admin, statusCtrl().update)
}
module.exports = initRoute