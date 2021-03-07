
const express = require('express')
const db = require('./database')
const router = express.Router()

function projectInputValidation(name, shortDescription, informationText, link){
    
    const errors = []

    if(name == ""){

        errors.push("Must enter a Title")
    }
    if(shortDescription == ""){

        errors.push("Must enter a description")
    }
    if(informationText == ""){

        errors.push("Must enter text")
    }
    if(link == ""){

        errors.push("Must enter a Link to project")
    }
    return errors
}

router.get('/createproject', function(request, response){
    
    const token = request.csrfToken()
    const loggedIn = response.locals.isLoggedIn

    if(loggedIn){

        const model = {token}
        response.render("createproject.hbs", model)
    }
    else{

        const model = {notLoggedIn: true}
        response.render("errordisplay.hbs", model)
    }
})

router.get('/editproject/:id', function(request, response){

    const id = request.params.id
    const token = request.csrfToken()
    const loggedIn = response.locals.isLoggedIn

    if(loggedIn){

        db.getProjectById(id, function(error, projectObj){

            if(error){

                console.log(error)
                const model = {internalSystemError: true, token}
                response.render("errordisplay.hbs", model)
            }
            else{

                if(projectObj){

                    const model = {projectObj, token}
                    response.render("editproject.hbs", model)
                }
                else{

                    const model = {notValidProject: true, token}
                    response.render("errordisplay.hbs", model)
                }
            }
        })
    }
    else{

        const model = {notLoggedIn: true}
        response.render("errordisplay.hbs",model)
    }
})

router.get('/portfolio', function(request, response){

    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()

    db.getAllProjects(function(error, projectObj){

        if(error){

            console.log(error)
            const model = {internalSystemError: true, token}
            response.render("errordisplay.hbs", model)
        }
        else{

            const model = {projectObj, loggedIn, token}
            response.render("portfolio.hbs", model)
        }
    })
})

router.get('/project/:id',function(request, response){

    const id = request.params.id
    const token = request.csrfToken()
    const loggedIn = response.locals.isLoggedIn

    db.getProjectById(id, function(error, project){

        if(error){

            console.log(error)
            const model = {internalSystemError: true, token}
            response.render("errordisplay.hbs", model)
        }
        else{

            if(project){

                const model = {project, loggedIn, token}
                response.render("project.hbs", model)
            }
            else{

                const model = {notValidProject: true, token}
                response.render("errordisplay.hbs", model)
            }
        }
    })
})

router.post('/createProject', function(request, response){

    const name = request.body.projectName
    const shortDescription = request.body.projectShortDescription
    const informationText = request.body.projectInformationText
    const link = request.body.projectLink
    const token = request.csrfToken()
    const loggedIn = response.locals.isLoggedIn
    const validationErrors = projectInputValidation(name, shortDescription, informationText, link)

    if(loggedIn){

        if(validationErrors.length == 0){

            if(request.files == null){
    
                db.newProjectNoImage(name, shortDescription, informationText, link, function(error){

                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("New Project Created")
                    }
                })
            }
            else{

                const projectImage = request.files.projectImage
                const fileName = projectImage.name
    
                projectImage.mv('./public/projectimg/' + fileName, function(error){

                    if (error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("project-image uploaded")
                    }
                })
                db.newProjectWithImage(name, shortDescription, informationText, fileName, link, function(error){

                    if (error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("New project created")
                    }
                })
            }
            response.redirect("/portfolio")
        }
        else{

            const model = {validationErrors, name, shortDescription, informationText, link, token}
            response.render("createproject.hbs", model)
        }
    }
    else{

        const model = {notLoggedIn: true}
        response.render("errordisplay.hbs",model)
    }
})


router.post('/updateproject/:id', function(request, response){

    const id = request.params.id
    const name = request.body.projectName
    const shortDescription = request.body.projectShortDescription
    const informationText = request.body.projectInformationText
    const link = request.body.projectLink
    const keepImage = request.body.keepImage
    const token = request.csrfToken()
    const loggedIn = response.locals.isLoggedIn
    const validationErrors = projectInputValidation(name, shortDescription, informationText, link)

    if(loggedIn){

        if(validationErrors.length == 0){

            if(keepImage == "keep" || request.files == null){

                db.updateProject(name, shortDescription, informationText, link, id, keepImage, function(error){

                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("Project updated")
                        response.redirect("/portfolio")
                    }
                })
            }
            else{

                const projectImage = request.files.projectImage
                const fileName = projectImage.name

                projectImage.mv('./public/projectimg/' + fileName, function(error){

                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("New project-image is saved")
                    }
                })
                db.updateProjectNewImage(name, shortDescription, informationText, link, id, fileName, function(error){
                    
                    if(error){

                        console.log(error)
                        const model = {internalSystemError: true, token}
                        response.render("errordisplay.hbs", model)
                    }
                    else{

                        console.log("Project updated")
                        response.redirect("/portfolio")
                    }
                })
            }
        }
        else{

            const model = {validationErrors, id, name, shortDescription, informationText, link, token}
            response.render("editproject.hbs", model)
        }
    }
    else{

        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

router.post('/deleteproject/:id', function(request, response){
    
    const id = request.params.id
    const loggedIn = response.locals.isLoggedIn
    const token = request.csrfToken()

    if(loggedIn){

        db.deleteProject(id, function(error){
                
            if(error){

                console.log(error)
                const model = {internalSystemError: true, token}
                response.render("errordisplay.hbs", model)
            }
            else{

                console.log("Project deleted")
                response.redirect("/portfolio")
            }
        })
    }
    else{
        
        const model = {notLoggedIn: true, token}
        response.render("errordisplay.hbs", model)
    } 
})

module.exports = router