'use strict'

const Env           = use('Env')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')

class UserController {
  async render ({ request, view, params }) {
    const users = await Redis.get('users')
    return view.render('user', {
      users: JSON.parse(users)
    })
  }
}

module.exports = UserController
