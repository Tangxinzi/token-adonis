'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
const { validate, validateAll }  = use('Validator')
require('superagent-charset')(superagent)
const Env           = use('Env')
const Redis         = use('Redis')

class TokenController {
  _rules(request) {
    switch (request.input('submit')) {
      case '0':
        return [
          {
            name: 'required',
            symbol: 'required',
            supply: 'required',
            account: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/initCurrencyByAdmin'
          },
          {
            json: JSON.stringify({
              "name": request.input('name'),
              "symbol": request.input('symbol'),
              "supply": request.input('supply'),
              "account": request.input('account'),
              "lock": request.input('lock') == 'on' ? 'true' : 'false'
            })
          }
        ]
        break;
      case '1':
        return [
          {
            symbol: 'required',
            amount: 'required',
            phone: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/mintToken'
          },
          {
            json: JSON.stringify({
              "symbol": request.input('symbol'),
              "amount": request.input('amount'),
              "phone": request.input('phone')
            })
          }
        ]
        break;
      case '2':
        return [
          {
            symbol: 'required',
            amount: 'required',
            account: 'required',
            phone: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/burnToken'
          },
          {
            json: JSON.stringify({
              "symbol": request.input('symbol'),
              "amount": request.input('amount'),
              "account": request.input('account'),
              "phone": request.input('phone')
            })
          }
        ]
        break;
      case '3':
        return [
          {
            symbol: 'required',
            phone: 'required',
            lock: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/setLock'
          },
          {
            json: JSON.stringify({
              "symbol": request.input('symbol'),
              "phone": request.input('phone'),
              "lock": request.input('lock') == 'on' ? 'true' : 'false'
            })
          }
        ]
        break;
      case '4':
        return [
          {
            account: 'required',
            phone: 'required',
            status: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/frozenAccount'
          },
          {
            json: JSON.stringify({
              "account": request.input('account'),
              "phone": request.input('phone'),
              "status": request.input('status') == 'on' ? 'true' : 'false'
            })
          }
        ]
        break;
      case '5':
        return [
          {
            phone: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/createTokenAdmin'
          },
          {
            json: JSON.stringify({
              "phone": request.input('phone')
            })
          }
        ]
        break;
      case '5':
        return [
          {
            phone: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/createTokenAdmin'
          },
          {
            json: JSON.stringify({
              "phone": request.input('phone')
            })
          }
        ]
        break;
      case '6':
        return [
          {
            status: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/showCurrency'
          },
          {
            json: JSON.stringify({
              "status": request.input('status')
            })
          }
        ]
        break;
    }
  }

  async store ({ request, view, response, session }) {
    const rules = this._rules(request)
    const validation = await validateAll(request.all(), rules[0])
    if (validation.fails()) {
      session.flash({
        type: 'red',
        header: '提交失败',
        message: `请检查您提交的信息是否有误！`
      })

      return response.redirect('back')
    }

    const result = await superagent.post(rules[1].url)
      .buffer(true)
      .send(rules[2].json)
    const json = JSON.parse(result.text)

    if (json.data.Code == 200) {
      session.flash({
        type: 'blue',
        header: '提交成功',
        message: `${ json.data.Message }`
      })
    } else {
      session.flash({
        type: 'red',
        header: '提交失败',
        message: `${ json.data.Message }`
      })
    }

    return response.redirect('back')
  }

  async login ({ request, view, response, session }) {
    const validation = await validateAll(request.all(), {
      phone: 'required',
      password: 'required'
    })

    if (validation.fails()) {
      session.flash({
        type: 'red',
        header: '提交失败',
        message: `请检查您提交的信息是否有误！`
      })

      return response.redirect('back')
    }

    const result = await superagent.post(Env.get('BASE_URL') + 'v1/user/login')
      .buffer(true)
      .type('form')
      .send(JSON.stringify({
        "phone": request.input('phone'),
        "password": request.input('password'),
        "smsCode": ''
      }))
    const json = JSON.parse(result.text)

    if (json.data.Code == 200) {
      session.flash({
        type: 'blue',
        header: '提交成功',
        message: `${ json.data.Message }`
      })

      // set user
      await Redis.set('users', JSON.stringify(json.data))
      return response.redirect('/console/token?id=0')
    } else {
      session.flash({
        type: 'red',
        header: '提交失败',
        message: `${ json.data.Message }`
      })

      return response.redirect('back')
    }
  }

  async logout ({ request, view }) {
    await Redis.del('users')
    return view.render('user', { route: '/console/login' })
  }

  async user ({ request, view, response }) {
    // get user
    const cachedUsers = await Redis.get('users')
    const users = JSON.parse(cachedUsers)
    if (users != null && users.Code == 200) {
      return response.redirect('/console/token?id=0')
    } else {
      return view.render('user', { route: '/console/login' })
    }
  }

  async render ({ request, view }) {
    const navigation = [
      {
        id: 0,
        text: '创建 Token（发币）'
      },
      {
        id: 1,
        text: '代币增发'
      },
      {
        id: 2,
        text: '代币销毁'
      },
      {
        id: 3,
        text: '锁仓 / 解锁'
      },
      {
        id: 4,
        text: '冻结 / 解冻账户'
      },
      {
        id: 5,
        text: '设置 Token（平台）管理员'
      },
      {
        id: 6,
        text: '审核代币'
      },
    ]
    const route = '/console/token'

    // get user
    const cachedUsers = await Redis.get('users')
    const users = JSON.parse(cachedUsers)

    if (request.input('id') == 6) {
      const result = await superagent.post(Env.get('BASE_URL') + 'v1/token/showCurrency')
        .buffer(true)
        .send(JSON.stringify({
          "status": request.input('status') || ''
        }))

      const json = JSON.parse(result.text)
      return view.render('token', { navigation, id: request.input('id') || 0, route, users, data: json.data, status: request.input('status') || '' })
    }
    if (users != null && users.Code == 200) {
      return view.render('token', { navigation, id: request.input('id') || 0, route, users })
    } else {
      return view.render('user', { route: '/console/login' })
    }
  }
}

module.exports = TokenController
