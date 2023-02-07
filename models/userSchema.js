const mongoose = require("mongoose")
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keysecret = "atulshahajichougalepoojapatiladi";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not valid Email")
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
     verifytoken:{
            type: String,
        }
    


},
    {
        versionKey: false
    }
)

//hash password

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }

    next()
})


//token generate

userSchema.methods.generateAuthtoken = async function () {
    try {
        let token1 = jwt.sign({ _id: this._id }, keysecret, {
            expiresIn: "1d"
        });
        // console.log(token1,"token1")
        this.tokens = this.tokens.concat({ token: token1 });
        await this.save();
        return token1;
    } catch (error) {
        res.status(422).json(error, { error: "token not generate" })
    }
}

// createing model
const userdb = new mongoose.model("users", userSchema);

module.exports = userdb;