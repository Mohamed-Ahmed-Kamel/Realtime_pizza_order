const Menu = require("../../models/menu");

function homeCtrl() {
    return {
        async index(req, res) {
            const pizzas = await Menu.find();
            return res.render("home", { pizzas });
        },
        async newPizza(req, res) {
            try {
                const newMenu = await Menu.create(req.body);
                res.json(newMenu)
            } catch (err) {
                console.log(err);
            }
        }
    }
};
module.exports = homeCtrl