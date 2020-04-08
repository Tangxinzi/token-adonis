'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', 'IndexController.render')
Route.get('/user', 'UserController.render')


Route.get('/login', 'LoginController.render')
Route.post('/login', 'LoginController.store')
Route.get('/register', 'RegisterController.render')
Route.get('/register/result', 'RegisterController.result')
Route.post('/register', 'RegisterController.store')

Route.group(() => {
  Route.get('/', 'PaperController.render')
  Route.get('/:id/download', 'PaperController.download')
    .as('download')
  Route.post('/', 'PaperController.store')

  Route.get('/result', 'ResultController.render')
}).prefix('paper')

Route.group(() => {
  Route.get('login', 'TokenController.user')
  Route.post('login', 'TokenController.login')
  Route.get('logout', 'TokenController.logout')
  Route.get('token', 'TokenController.render')
  Route.post('token', 'TokenController.store')
}).prefix('console')
