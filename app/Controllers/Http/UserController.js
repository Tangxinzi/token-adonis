'use strict'

const Env           = use('Env')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')
const Database      = use('Database')

class UserController {
  async set_user_meta (user_id, meta_key, meta_value) {
    await Database
      .table('ex_usermeta')
      .where({
        user_id,
        meta_key
      })
      .update({
        meta_value
      })
  }

  async store ({ request, view, response, session }) {
    const users = JSON.parse(await Redis.get('users'))

    var rows = request.only(['info_phone', 'info_address', 'info_number', 'info_gender'])
    this.set_user_meta(users.id, 'info_phone', rows.info_phone)
    this.set_user_meta(users.id, 'info_address', rows.info_address)
    this.set_user_meta(users.id, 'info_number', rows.info_number)
    this.set_user_meta(users.id, 'info_gender', rows.info_gender)

    var user_email = request.only(['user_email'])
    await Database
      .table('ex_users')
      .where('ID', users.id)
      .update(user_email)

    Redis.set('users', JSON.stringify({
      token: users.token,
      user_email: user_email.user_email,
      user_nicename: users.user_nicename,
      user_display_name: users.user_display_name,
      id: users.id,
      info: {
        phone: rows.info_phone,
        address: rows.info_address,
        number: rows.info_number,
        gender: rows.info_gender
      }
    }))

    session.flash({
      type: 'success',
      header: 'success',
      message: '信息更新成功'
    })

    response.redirect('back')
  }

  async render ({ request, view, params }) {
    const users = JSON.parse(await Redis.get('users'))
    const paper = await Database.from('ex_paper').where({ user_id: users.id })

    return view.render('user', {
      users,
      paper
    })
  }
}

module.exports = UserController
