
const express = require('express')
const db = require('./database')
const router = express.Router()

function blogPostInputValidation(title, author, text){

    const errors =[]

    if (title == ""){

        errors.push("Must enter a title")
    }
    if (author == ""){

        errors.push("Must enter a name")
    }
    if (text == ""){

        errors.push("Must enter text")
    }

    return errors
}


router.get('/blog', function(request, response){
    
    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()
    
    db.getAllBlogPosts(function(error, blogPostObj){

        if(error){

            console.log(error)
            const model = {internalSystemError: true, token}
            response.render("errordisplay.hbs", model)
        }
        else{
          
            const model = {blogPostObj, loggedIn, token} 
            response.render("blog.hbs", model)
        }
    })
})

router.get('/createblogpost', function(request, response){

    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()
    
    if(loggedIn){

        const model = {token}
        response.render("createblogpost.hbs", model)
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    }
})

router.get('/editblogpost/:id', function(request, response){
    
    const id = request.params.id
    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()

    if(loggedIn){

        db.getBlogPostById(id, function(error, blogPost){

            if(error){

                console.log(error)
                const model = {internalSystemError: true, token}
                response.render("errordisplay.hbs", model)
            }
            else{

                if(blogPost){
                    
                    const model = {blogPost, token}
                    response.render("editblogpost.hbs", model)
                }
                else{

                    const model = {notValidBlogPost: true, token}
                    response.render("errordisplay.hbs", model)
                }               
            }
        })   
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

router.post('/updateblogpost/:id', function(request, response){
    
    const loggedIn = response.locals.isLoggedIn
    const id = request.params.id
    const title = request.body.blogTitle
    const author = request.body.blogAuthor
    const text = request.body.blogText
    const keepImage = request.body.keepImage
    const token = request.csrfToken()
    const validationErrors = blogPostInputValidation(title, author, text)
    
    if(loggedIn){

        if(validationErrors.length == 0){

            if(keepImage == "keep" || request.files == null){ 

                db.updateBlogPost(title, author, text, id, keepImage, function(error){
                    if(error){
                    
                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("Blogpost updated")
                        response.redirect("/blog")
                    }
                })
            }
            else{

                const blogImage = request.files.blogImage
                const fileName = blogImage.name

                blogImage.mv('./public/blogimg/' + fileName, function(error){

                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("New blog-image saved")
                    }
                })
                db.updateBlogPostNewImage(title, author, text, id, fileName, function(error){

                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("Blogpost updated")
                        response.redirect("/blog")
                    }
                })
            }
        }
        else{
        
            const model = {validationErrors, id, title, author, text, token}
            response.render("editblogpost.hbs", model)
        }
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

router.post('/deleteblogpost/:id', function(request,response){
    
    const loggedIn = response.locals.isLoggedIn
    const id = request.params.id
    const token = request.csrfToken()
   
    if(loggedIn){

        db.deleteBlogPost(id, function(error){

            if(error){

                 console.log(error)
                 const model = {internalSystemError: true, token}
                 response.render("errordisplay.hbs", model)
            }
            else{

                console.log("Blogpost deleted")
                response.redirect("/blog")
            }
        })
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

router.post('/createblogpost', function(request, response){

    const loggedIn = response.locals.isLoggedIn
    const title = request.body.blogTitle
    const author = request.body.blogAuthor
    const text = request.body.blogText
    const validationErrors = blogPostInputValidation(title, author, text)
    const token = request.csrfToken()

    if(loggedIn){

        if(validationErrors.length == 0){

            if(request.files == null){
    
                db.newBlogPostNoImage(title, author, text, function(error){
    
                    if(error){
                         console.log("här")
                         console.log(error)
                         const model = {internalSystemError: true, token}
                         response.render("errordisplay.hbs", model)
                    }
                    else{
        
                        console.log("new blogpost added")
                        response.redirect("/blog")
                    }
                })
            }
            else{
    
                const blogImage = request.files.blogImage
                const fileName = blogImage.name
    
                blogImage.mv('./public/blogimg/' + fileName, function(error){
    
                    if(error){
    
                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{
    
                        console.log("Image uploaded")
                    }
                })
    
                db.newBlogPostWithImage(title, author, text, fileName, function(error){
    
                    if(error){
    
                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{
                    
                        response.redirect("/blog")
                    }
                })
            }
        }
        else{
    
            const model = {validationErrors, title, author, text, token}
            response.render("createblogpost.hbs", model)
        }
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})


module.exports = router

