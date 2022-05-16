const { BadRequestError } = require("../errors");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { Number, String } = Schema.Types;
const roles = require("./role.model");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const UserSchema = new Schema(
  {
    role: {
      type: Number,
      required: true,
      default: roles.user,
      validate: {
        validator: function (value) {
          const existingRoles = Object.values(roles);
          return existingRoles.includes(value);
        },
      },
    },
    email: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      unique: true,
      validate: {
        validator: function (value) {
          return isEmail(value);
        },
        message: "Must be a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          const matchCapitalLetter = /[A-Z]+/.test(value);
          const matchLowerCaseLetter = /[a-z]+/.test(value);
          const matchNumber = /\d+/.test(value);
          const matchSpecialChar = /[^A-Za-z0-9éèàù]+/.test(value);
          return (
            matchCapitalLetter &&
            matchLowerCaseLetter &&
            matchNumber &&
            matchSpecialChar
          );
        },
        message:
          "Must be a valid password, must contains capitalcase letter, lowercase letter, number and special character",
      },
    },
    resetPasswordToken: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 50,
    },
    firstName: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 50,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { getters: true, virtuals: true },
    timestamps: true,
  }
);

UserSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "user",
});

UserSchema.methods.hashPassword = async function () {
  const saltRounds = 10;
  const hash = await new Promise((resolve, reject) =>
    bcrypt.hash(this.password, saltRounds, function (err, hash) {
      if (err) {
        reject();
      } else {
        resolve(hash);
      }
    })
  );
  this.password = hash;
  return this;
};

UserSchema.methods.passwordVerify = async function (textPassword) {
  const check = await new Promise((resolve, reject) =>
    bcrypt.compare(textPassword, this.password, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  );

  if (!check) {
    throw new ForbiddenError("invalid credentials");
  }

  return check;
};

UserSchema.methods.generateResetPasswordToken = async function () {
  const _nanoId = nanoid();
  this.resetPasswordToken = Buffer.from(_nanoId).toString("hex");
  return this;
};

UserSchema.methods.encodeJWT = function encodeJWT() {
  const { JWT_EXP, JWT_SECRET, JWT_ISSUER } = process.env;
  const payload = {
    iss: JWT_ISSUER,
    sub: this._id,
  };
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXP * 1000 });
};

UserSchema.statics.login = async function (
  data = {
    email: null,
    password: null,
  }
) {
  const { email, password } = data;
  if (email && password) {
    const user = await this.findOne({
      email,
    });
    if (!user) {
      throw new BadRequestError("invalid credentials");
    }

    const check = await user.passwordVerify(password);

    if (!check) {
      throw new BadRequestError("invalid credentials");
    }

    const token = user.encodeJWT();
    return {
      token,
    };
  }
};

UserSchema.statics.register = async function (
  data = {
    email: null,
    password: null,
  }
) {
  const userRole = roles.user;

  const existingUser = await this.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new BadRequestError("Email is invalid");
  }

  const newUser = new this({
    ...data,
    role: userRole,
  });

  await newUser.generateResetPasswordToken();

  const validate = newUser.validateSync();
  if (validate !== undefined) {
    throw new BadRequestError(`Validation error: ${validate.message}`);
  }

  await newUser.hashPassword();

  return await newUser.save();
};

module.exports = model("User", UserSchema);