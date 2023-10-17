const User = require('../../models/user');
const { hash } = require('bcrypt');
const passport = require('passport');

function authCtrl() {
    const _getRedirectUrl = (req) => {
        if (req.user.role  === 'admin') {
            return '/admin/orders'
        } else {
            return '/customers/orders'
        }
    }
    return {
        loginPage(req, res) {
            res.render("auth/login");
        },
        loginPost(req, res, next) {
            const { email, password } = req.body;
            if (!email || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/login')
            }
            // Save the session cart
            const sessionCart = req.session.cart;
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    // Restore the session cart after login
                    req.session.cart = sessionCart;
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        registerPage(req, res) {
            res.render("auth/register");
        },
        async register(req ,res) {
            const { name, email, password } = req.body;

            // Check if the user add all data
            if (!name || !email || !password) {
                req.flash('error', 'All fields are required')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            // Check if email exists
            const userDB = await User.findOne({ email });
            if (userDB) {
                req.flash('error', 'Email already exists')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            // Hash password
            const hashPassord = await hash(password, 10)
            
            // Create new user
            const newUser = new User(
                {
                    name,
                    email,
                    password: hashPassord,
                }
            ).save().then(() => {
                return res.redirect('/')
            }).catch((err) => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/register')
            });
        },
        logout(req, res) {
            req.logout((err) => {
                if (err) {
                    console.log(err);
                    return res.redirect('/logout');
                }
                return res.redirect('/login');
            });
        }        
    }
};
module.exports = authCtrl