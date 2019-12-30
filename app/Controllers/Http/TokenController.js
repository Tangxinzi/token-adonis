'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
const { validate, validateAll }  = use('Validator')
require('superagent-charset')(superagent)
const Env           = use('Env')
const Redis         = use('Redis')
const Helpers       = use('Helpers')

class TokenController {
  _rules(request) {
    switch (request.input('submit')) {
      case '0':
        return [
          {
            name: 'required',
            symbol: 'required',
            supply: 'required',
            account: 'required',
            precision: 'required',
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
              "precision": request.input('precision'),
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
      case '6':
        return [
          {
            tokenKey: 'required',
            fee: 'required',
            otcAccount: 'required',
            usdRate: 'required',
            cnyRate: 'required',
            price: 'required'
          },
          {
            url: Env.get('BASE_URL') + 'v1/token/pageCoin'
          },
          {
            json: JSON.stringify({
              "tokenKey": request.input('tokenKey'),
              "isOtc": request.input('isOtc') == 'on' ? true : false,
              "fee": Number(request.input('fee')),
              "otcAccount": Number(request.input('otcAccount')),
              "usdRate": Number(request.input('usdRate')),
              "cnyRate": Number(request.input('cnyRate')),
              "price": Number(request.input('price')),
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

    if (request.file('tokenLogo')) {
      const tokenLogo = request.file('tokenLogo', {
        types: ['image'],
        size: '10mb'
      })

      const fileName = `${ new Date().getTime() }.${ tokenLogo.subtype }`

      // await tokenLogo.move(Helpers.publicPath('uploads', {
      //   name: fileName
      // }))

      // var formData = new FormData()
      // formData.append('tokenKey', request.input('tokenKey'))
      // formData.append('tokenLogo', {
      //   uri: tokenLogo.tmpPath,
      //   type: 'multipart/form-data',
      //   name: fileName,
      //   mime: tokenLogo.subtype
      // })

      await superagent.post(Env.get('BASE_URL') + 'v1/token/pageCoinLogo')
        .field('tokenKey', request.input('tokenKey'))
        .field('tokenLogo', 'tokenLogo')
        .attach('tokenLogo', tokenLogo.tmpPath)
        .then((result) => {
          const json = JSON.parse(result.text)
          console.log(json)
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
        })
        .catch((err) => {
          throw err;
        });
    }

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
      // set user-agent
      await Redis.set('userAgent', JSON.stringify(request.request.headers['user-agent']))
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
    // route
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
      {
        id: 7,
        text: '所有币种'
      },
      {
        id: 8,
        text: '用户管理'
      },
    ]
    const route = '/console/token'

    // get user
    const cachedUsers = await Redis.get('users')
    const users = JSON.parse(cachedUsers)

    // token?id=
    if (request.input('id') == 6) {
      const result = await superagent.post(Env.get('BASE_URL') + 'v1/token/showCurrency')
        .buffer(true)
        .send(JSON.stringify({
          "status": request.input('status') || ''
        }))

      const json = JSON.parse(result.text)
      return view.render('token', { navigation, id: request.input('id') || 0, route, users, data: json.data, status: request.input('status') || '' })
    }

    if (request.input('id') == 7) {
      const result = await superagent.get(Env.get('BASE_URL') + 'v1/token/getCoin')
        .buffer(true)
        .send(JSON.stringify({
          "status": request.input('status') || ''
        }))

      var tokenKeyResult, tokenKeyJson = null

      if (request.input('tokenKey')) {
        tokenKeyResult = await superagent.post(Env.get('BASE_URL') + 'v1/token/getCoinByKey')
          .buffer(true)
          .send(JSON.stringify({
            "tokenKey": request.input('tokenKey')
          }))

        tokenKeyJson = JSON.parse(tokenKeyResult.text)
      }

      const json = JSON.parse(result.text)
      return view.render('token', {
        navigation,
        id: request.input('id') || 0,
        route,
        users,
        data: json.data,
        token: tokenKeyJson ? tokenKeyJson.data.Data : null
      })
    }

    if (request.input('id') == 8) {
      const result = await superagent.post(Env.get('BASE_URL') + 'v1/token/UserManagement')
        .buffer(true)
        .send(JSON.stringify({
          "coin":  request.input('coin') || 'GDCC'
        }))

      const json = JSON.parse(result.text)
      return view.render('token', {
        navigation,
        id: request.input('id') || 0,
        route,
        users,
        data: json.data,
        status: request.input('status') || ''
      })
    }

    if (users != null && users.Code == 200) {
      return view.render('token', { navigation, id: request.input('id') || 0, route, users })
    } else {
      return view.render('user', { route: '/console/login' })
    }
  }
}

module.exports = TokenController
