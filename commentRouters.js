
const express = require('express')
const db = require('./database')
const router = express.Router()

function commentInputValidation(name, comment){

    const errors = []
    
    if (name.length > 30){

        errors.push("Name: You entered to many characters")
    }
    if (name == ""){

        errors.push("Must enter a name")
    }
    if (comment == ""){

        errors.push("Must write a comment")
    }
    if (comment.length > 200){

        errors.push("Comment: Max length of comment are reached")
    }
    return errors
}

router.get('/blogpost/:id/comments', function(request, response){

    const blogPostId = request.params.id
    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()

    db.getBlogPostById(blogPostId, function(error, blogPost){

        if(error){

            console.log(error)
            const model = {internalSystemError: true, token}
            response.render("errordisplay.hbs", model)
        }
        else{

            if(blogPost){

                db.getAllComments(blogPostId, function(error, commentObj){

                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)        
                    }
                    else{

                        var model = {blogPost, commentObj,loggedIn, token}
                        response.render("comments.hbs", model)
                    }
                })
            }   
            else{

                const model = {notValidBlogPost: true, token}
                response.render("errordisplay.hbs", model)
            }
        }
    })
})

router.get('/editcomment/:id', function(request, response){

    const id = request.params.id
    const token = request.csrfToken()
    const loggedIn = response.locals.isLoggedIn

    if(loggedIn){

        db.getCommentById(id, function(error, comment){

            if(error){

                console.log(error)
                const model = {internalSystemError: true, token}
                response.render("errordisplay.hbs", model)
            }
            else{

                if(comment){

                    const model = {comment, token}
                    response.render("editcomment.hbs", model)
                }
                else{

                    const model = {notValidComment: true, token}
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

router.post('/blogpost/:id/comments', function(request, response){
    
    const blogPostId = request.params.id
    const name = request.body.commentName
    const comment = request.body.commentText
    const token = request.csrfToken()
    const validationErrors = commentInputValidation(name, comment)

    if(validationErrors.length == 0){

        db.newComment(blogPostId, name, comment, function(error){

            if(error){

                if(error.code = 'SQLITE_CONSTRAINT'){

                    console.log(error)
                    const model = {notValidBlogPost:true, token}
                    response.render("errordisplay.hbs", model)
                }
                else{

                    console.log(error)
                    const model= {internalSystemError: true, token}
                    response.render("errordisplay.hbs", model)
                }
                
            }
            else{

                response.redirect("/blogpost/" + blogPostId + "/comments")    
            }
        })
    }
    else{

        db.getBlogPostById(blogPostId, function(error, blogPost){

            if(error){

                console.log(error)
                const model= {internalSystemError: true, token}
                response.render("errordisplay.hbs", model)
            }
            else{

                const model = {validationErrors, name, comment, blogPost, token}
                response.render("comments.hbs", model)
            }
        })      
    }
})

router.post('/updatecomment/:id', function(request,response){

    const id = request.params.id
    const name = request.body.commentName
    const comment = request.body.commentText
    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()
    const validationErrors = commentInputValidation(name, comment)

    if(loggedIn){

        if(validationErrors.length == 0){

            db.updateComment(id, name, comment, function(error){

                if(error){

                    console.log(error)
                    const model = {internalSystemError: true, token}
                    response.render("errordisplay.hbs", model)

                }
                else{

                    console.log("Comment updated")
                    response.redirect('/blog') 
                }
            })
        }
        else{

            const model = {validationErrors, id, name, comment, token}
            response.render("editcomment.hbs", model)
        }
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

router.post('/deletecomment/:id', function(request,response){

    const loggedIn = response.locals.isLoggedIn
    const id = request.params.id
    const token = request.csrfToken()

    if(loggedIn){

        db.deleteComment(id, function(error){

            if(error){

                console.log(error)
                const model = {internalSystemError: true, token}
                response.render("errordisplay.hbs", model)
            }
            else{

                console.log("Comment deleted")
                response.redirect('/blog')     
            }
        })
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

module.exports = router
