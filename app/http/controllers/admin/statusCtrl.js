const Order = require("../../../models/order")

function statusCtrl() {
	return {
		async update(req, res) {
			try {
				await Order.updateOne({_id: req.body.orderID}, { status: req.body.status });
				// Emit an event
				// Retrieves the `eventEmitter` object from the Express application.
				const eventEmitter = req.app.get('eventEmitter');
				eventEmitter.emit('orderUpdated', { _id: req.body.orderID, status: req.body.status })
		        return res.redirect('/admin/orders');
			} catch (err) {
		        console.error(err);
		        return res.redirect('/admin/orders');
		    }
		}
	}
}
module.exports = statusCtrl