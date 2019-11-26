const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO check if they are logged

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    )

    return item
  },
  updateItem(parent, args, ctx, info) {
    //first take a copy of the updates
    const { ...updates } = args
    //Remove the id from the updates
    delete updates.id
    //Run the update
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    )
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    //1 find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`)
    //2 Check if we own it TODO

    //3 Delete item
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signUp(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    //has password
    const password = await bcrypt.hash(args.password, 10)

    //create user in database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    )

    //create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    //set JWT on cookies
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })

    return user
  },

  async signIn(parent, { email, password }, ctx, info) {
    // Check if user with that mail exists
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No user found for email ${email}`)
    }

    // Check if password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // Set Cookie with token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // Return user
    return user
  },
  signOut(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Good bye!' }
  },
  async requestReset(parent, { email }, ctx, info) {
    // Check if user is real
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No user found for email ${email}`)
    }

    // Set reset token and expiry on user
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 //1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    })

    // Email the the reset token
    const mailRes = await transport.sendMail({
      from: 'jen.calvineo@gmail.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeANiceEmail(
        `Your password reset token is here \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset your password</a>`
      ),
    })
    return { message: 'The reset password token has been sent to your email' }
  },
  async resetPassword(parent, args, ctx, info) {
    const { password, confirmPassword, resetToken } = args
    //check if passwords match
    if (password !== confirmPassword) {
      throw new Error('Passwords need to match!')
    }
    //check if token is real
    //check if token is expired
    const [user] = await ctx.db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() - 3600000 },
    })
    if (!user) {
      throw new Error('That reset token does not exist or the token is expired')
    }

    //hash new password
    const newPassword = await bcrypt.hash(password, 10)

    //save new password and remove reset tokens
    const newUser = await ctx.db.mutation.updateUser({
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
      where: { email: user.email },
    })
    //generate JWT
    const token = jwt.sign({ userId: newUser.id }, process.env.APP_SECRET)

    //set JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    //return the new user

    return newUser
  },
}

module.exports = Mutations
