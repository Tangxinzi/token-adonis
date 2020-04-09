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
Route.post('/user', 'UserController.store')

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
