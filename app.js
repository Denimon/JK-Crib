
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const projectRouter = require('./projectRouters')
const blogPostRouter = require('./blogPostRouters')
const commentRouter = require('./commentRouters')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session)
var csurf = require('csurf')
var bcrypt = require('bcryptjs')

const userAccount = "johan"
const hash = "$2a$10$0Ry6D/VhLi8.plLHBCpv1u7cX/GiFUKYGVepZmvQf2PllH47tWhou"

const app = express()

app.engine('hbs', expressHandlebars( {defaultLayout: 'main.hbs'}))

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(fileUpload())

app.use(cookieParser())
app.use(csurf({cookie: true}))

app.use(session({
    
	secret: "ldasdgewbodkodkfkrsldfsbgtdhhtyu",
	saveUninitialized: false,
	resave: false,
	store: new SQLiteStore()
}))

app.use(function(request, response, next){

	response.locals.isLoggedIn = request.session.isLoggedIn
	next()
})

app.use(projectRouter)
app.use(blogPostRouter)
app.use(commentRouter)

app.get('/', function(request, response){

    const model = {token: request.csrfToken()}
    response.render("home.hbs", model)
})

app.post('/logout',function(request, response){

    request.session.isLoggedIn = false
    response.redirect('/')
})

app.get('/login', function(request, response){

    const model = {token: request.csrfToken()}
    response.render("login.hbs", model)
})

app.get('/contact', function(request, response){

    const model = {token: request.csrfToken()}
    response.render("contact.hbs", model)
})

app.post('/login', function(request, response){
    
    const validationErrors = []
    const token = request.csrfToken()
    const username = request.body.username
    const password = request.body.password

    if(username == ""){

        validationErrors.push("Must enter a username")
    }
    if(password == ""){

        validationErrors.push("Must enter a password")
    }
    if(validationErrors.length == 0){

        bcrypt.compare(password, hash, function(error, res){
            
            if(error){

                console.log(error)
            }
            else{

                if (userAccount == username && res){

                    request.session.isLoggedIn = true
                    response.redirect('/')
                }
                else{

                    const model = {token}
                    response.render('login.hbs', model)
                }
            }
        })
    }
    else{

        const model = {validationErrors, token}
        response.render('login.hbs', model)
    }
})

app.get('*', function(request, response){

    const model = {notValidURI: true}
    response.render('errordisplay.hbs', model)
})

app.listen(8080)
 
