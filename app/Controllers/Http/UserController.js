'use strict'

const Env           = use('Env')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')
const md5           = use('md5')
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
    var rows = request.only(['users', 'info_phone', 'info_address', 'info_number', 'info_gender', 'user_pass'])
    if (rows.user_pass == null || rows.user_pass.length < 5) {
      session.flash({
        type: 'red',
        header: '登录密码有误',
        message: '密码长度至少需 6 位'
      })

      response.redirect('back')
      return
    }

    const users = JSON.parse(await Redis.get('users'))
    this.set_user_meta(users.id, 'info_phone', rows.info_phone)
    this.set_user_meta(users.id, 'info_address', rows.info_address)
    this.set_user_meta(users.id, 'info_number', rows.info_number)
    this.set_user_meta(users.id, 'info_gender', rows.info_gender)

    var user_email = request.only(['user_email'])
    await Database
      .table('ex_users')
      .where('ID', users.id)
      .update(user_email)

    // await Database.raw('update ex_users set user_pass=md5(' + rows.user_pass + ') where ID = ' + users.id)
    await Database
      .table('ex_users')
      .where('ID', users.id)
      .update('user_pass', md5(rows.user_pass))

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
      },
      user_caps: users.user_caps
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

    if (users.user_caps.administrator) {
      const posts = await Database.raw("SELECT ID, DATE_FORMAT(post_date, '%Y-%m-%d %H:%i:%s') as post_date, post_title, count FROM (select * from ex_posts where post_type = 'paper' and post_status = 'publish' ORDER BY post_date ASC) AS A LEFT JOIN (SELECT posts_id, COUNT(*) as count FROM ex_paper GROUP BY posts_id) AS B ON A.ID = B.posts_id")

      return view.render('user', {
        users,
        paper,
        posts: posts[0]
      })
    } else {
      return view.render('user', {
        users,
        paper
      })
    }
  }
}

module.exports = UserController
