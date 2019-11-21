const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
  }
}

module.exports = Mutations
