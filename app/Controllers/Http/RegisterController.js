'use strict'

const Env           = use('Env')
const superagent    = use('superagent')
require('superagent-charset')(superagent)

class RegisterController {
  async store ({ request, view, response, session }) {
    const data = {
    	"username": request.input('username') || '',
    	"password": request.input('password') || '',
    	"email": request.input('email') || '',
    	"info": {
    		"phone": request.input('phone') || '',
    		"address": request.input('address') || '',
    		"number": request.input('number') || '',
    		"gender": request.input('gender') || ''
    	}
    }

    await superagent
      .post(Env.get('BASE_URL') + '/exam/wp-json/users/v1/register')
      .type('application/json')
      .send(data)
      .then(res => {
        const text = JSON.parse(error.response.res.text)
        console.log(text)

        session.flash({
          type: 'blue',
          header: '创建成功',
          message: null
        })

        response.redirect('back')
      })
      .catch(error => {
        const text = JSON.parse(error.response.res.text)
        switch (text.code) {
          case 'rest_invalid_param':
            session.flash({
              type: 'red',
              header: text.message,
              message: JSON.stringify(text.data.params)
            })
            break
          case 'existing_user_login':
            session.flash({
              type: 'red',
              header: text.message,
              message: `<a href="/">返回首页</a>`
            })
            break
        }

        response.redirect('back')
      })
  }

  render ({ request, view, params }) {
    return view.render('register')
  }
}

module.exports = RegisterController
