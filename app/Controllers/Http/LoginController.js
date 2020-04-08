'use strict'

const Env           = use('Env')
const superagent    = use('superagent')
require('superagent-charset')(superagent)
const Redis         = use('Redis')

class LoginController {
  async store ({ request, view, response, session }) {
    const data = {
      "id":       request.input('id'),
      "username": request.input('username') || '',
      "password": request.input('password') || '',
      "examword": request.input('examword') || ''
    }

    var paper = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/' + data.id)
    paper = JSON.parse(paper.text)

    if (paper.extended_custom_fields.extended_content.options.pass != data.examword) {
      session.flash({
        type: 'red',
        header: '考试密码错误',
        message: '请重试'
      })

      response.redirect('back')
    } else {
      await superagent
        .post(Env.get('BASE_URL') + '/exam/wp-json/jwt-auth/v1/token')
        .type('application/json')
        .send(data)
        .then(users => {
          var point = 0
          for (var i = 0; i < paper.extended_custom_fields.extended_content.examinee.length; i++) {
            if (paper.extended_custom_fields.extended_content.examinee[i].user_email == users.body.user_email) {
              point = 1
            }
          }

          if (point) {
            Redis.set('users', JSON.stringify(users.body))
            response.redirect('paper?id=' + data.id)
          } else {
            session.flash({
              type: 'red',
              header: '考生账号未指定',
              message: '请重试'
            })

            response.redirect('back')
          }
        })
        .catch(error => {
          const text = JSON.parse(error.response.text)

          session.flash({
            type: 'red',
            header: text.message,
            message: JSON.stringify(text.data.status)
          })

          response.redirect('back')
        })
    }
  }

  async render ({ request, view, params }) {
    const result = await superagent.get(Env.get('BASE_URL') + '/exam/wp-json/wp/v2/paper/' + request.input('id'))
      .buffer(true)
      .send()

    return view.render('login', {
      result: result.body
    })
  }
}

module.exports = LoginController
