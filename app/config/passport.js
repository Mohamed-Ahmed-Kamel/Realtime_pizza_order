const { Strategy } = require('passport-local');
const User = require('../models/user');
const { compare } = require('bcrypt');

function init(passport) {
    passport.use(new Strategy({ usernameField: 'email' }, async (email, password, done) => {
        // Check if email exists
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'The email is not found' });
        }
        // Compare the password
        compare(password, user.password).then((match) => {
            if (match) {
                return done(null, user, { message: 'logged in succesfully' })
            } else {
                return done(null, false, { message: 'Wrong username or password' })
            }
        }).catch((err) => {
            return done(null, false, { message: 'Something went wrong' })
        })
    }))

    // Serialize and Deserialize User
    passport.serializeUser((user, done) => {
        done(null, user._id)
    });
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
}
module.exports = init