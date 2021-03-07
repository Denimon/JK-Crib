
const sqlite3 = require('sqlite3')
const dataBase = new sqlite3.Database('./database.db')

dataBase.exec("PRAGMA foreign_keys = ON;", function(error){

    if(error){

        console.log(error)
    }
})

const createBlogpostsTable = `CREATE TABLE IF NOT EXISTS BlogPosts(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT, 
    Author TEXT,
    BlogText TEXT, 
    ImageFileName TEXT,
    CreateDate TEXT
);`

const createCommentsTable = `CREATE TABLE IF NOT EXISTS Comments(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT, 
    Comment TEXT,
    BlogpostId INTEGER,
    CreateDate TEXT,
    FOREIGN KEY (BlogpostId) REFERENCES BlogPosts(Id) ON DELETE CASCADE
);`

const createProjectsTable = `CREATE TABLE IF NOT EXISTS Projects(
    Id INTEGER PRIMARY KEY AUTOINCREMENT, 
    Name TEXT, 
    ShortDescription TEXT, 
    InformationText TEXT, 
    ImageFileName TEXT,   
    WebLink TEXT,
    CreateDate TEXT
);`

dataBase.run(createBlogpostsTable, function(error){

    if(error){

        console.log("Error, Blogposts-table not created")
        console.log(error)   
    }
    else{

        console.log("Blogposts-table created")
    }   
})

dataBase.run(createCommentsTable, function(error){

    if(error){

        console.log("Error, Comments-table not created")
        console.log(error)
    }
    else{

        console.log("Comments-table created")
    }
})

dataBase.run(createProjectsTable, function(error){

    if(error){

        console.log("Error, Projects-table not created")
        console.log(error)
    }
    else{

        console.log("Projects-table created")
    }
})

exports.getAllComments = function(blogPostId, callback){

    dataBase.all("SELECT * FROM Comments WHERE blogpostId = ?", blogPostId, function(error, commentObj){

        callback(error, commentObj)
    })
}

exports.getAllBlogPosts = function(callback){

    dataBase.all("SELECT * FROM BlogPosts ORDER BY Id DESC", function(error, blogPostObj){

        callback(error, blogPostObj)
    })   
}

exports.getAllProjects = function(callback){
    
    dataBase.all("SELECT * FROM Projects", function(error, projectObj){

        callback(error, projectObj)
    })
}

exports.newComment = function(blogPostId, name, comment, callback){

    const addCommentQuery = "INSERT INTO Comments(Name, Comment, BlogpostId, CreateDate) VALUES(?, ?, ?, date())"
    const values = [name, comment, blogPostId]

    dataBase.run(addCommentQuery, values, function(error){

        callback(error)
    })
}

exports.newBlogPostNoImage = function(title, author, content, callback){

    const addBlogPostQuery = "INSERT INTO BlogPosts(Title, Author, BlogText, ImageFileName, CreateDate) VALUES(?, ?, ?, ?, date())"
    const values = [title, author, content, null]

    dataBase.run(addBlogPostQuery, values, function(error){
        
        callback(error)
    })
}

exports.newBlogPostWithImage = function(title, author, content, fileName, callback){

    const addBlogPostQuery = "INSERT INTO BlogPosts(Title, Author, BlogText, ImageFileName, CreateDate) VALUES(?, ?, ?, ?, date())"
    const values = [title, author, content, fileName]

    dataBase.run(addBlogPostQuery, values, function(error){

        callback(error)
    })
}

exports.newProjectNoImage = function(name, shortDescription, informationText, link, callback){

    const addProjectQuery = "INSERT INTO Projects(Name, ShortDescription, InformationText, ImageFileName, WebLink, CreateDate) VALUES(?,?,?,?,?,date())"
    const values = [name, shortDescription, informationText, null, link]

    dataBase.run(addProjectQuery, values, function(error){

        callback(error)
    })
}

exports.newProjectWithImage = function(name, shortDescription, informationText, fileName, link, callback){

    const addProjectQuery = "INSERT INTO Projects(Name, ShortDescription, InformationText, ImageFileName, WebLink, CreateDate) VALUES(?, ?, ?, ?, ?, date())"
    const values = [name, shortDescription, informationText, fileName, link]

    dataBase.run(addProjectQuery, values, function(error){

        callback(error)
    })
}

exports.updateComment = function(id, name, comment, callback){

    const updateCommentQuery = "UPDATE Comments SET Name = ?, Comment = ? WHERE Id = ?"
    const values = [name, comment, id]

    dataBase.run(updateCommentQuery, values, function(error){

        callback(error)
    })
}

exports.updateBlogPostNewImage = function(title, author, text, id, fileName, callback){

    const editBlogPostQuery = "UPDATE BlogPosts SET Title = ?, Author = ?, BlogText = ?, ImageFileName = ? WHERE Id = ?"
    const values = [title, author, text, fileName, id]

    dataBase.run(editBlogPostQuery, values, function(error){

        callback(error)
    })
}

exports.updateBlogPost = function(title, author, text, id, keepImage, callback){
    
    if(keepImage == "keep"){

        const editblogPostQuery = "UPDATE BlogPosts SET Title = ?, Author = ?, BlogText = ? WHERE Id = ?"
        const values = [title, author, text, id]

        dataBase.run(editblogPostQuery, values, function(error){

            callback(error)
        })
    }
    else{

        const editblogPostQuery = "UPDATE BlogPosts SET Title = ?, Author = ?, BlogText = ?, ImageFileName = ? WHERE Id = ?"
        const values = [title, author, text, null, id]

        dataBase.run(editblogPostQuery, values, function(error){

            callback(error)
        })     
    }
}

exports.updateProject = function(name, shortDescription, informationText, link, id, keepImage, callback){

    if(keepImage == "keep"){

        const updateProjectQuery = "UPDATE Projects SET Name = ?, ShortDescription = ?, InformationText = ?, WebLink = ? WHERE Id = ?"
        const values = [name, shortDescription, informationText, link, id]

        dataBase.run(updateProjectQuery, values, function(error){

            callback(error)
        })
    }
    else{

        const updateProjectQuery = "UPDATE Projects SET Name = ?, ShortDescription = ?, InformationText = ?, ImageFileName = ?, WebLink = ? WHERE Id = ?"
        const values = [name, shortDescription, informationText, null, link, id]

        dataBase.run(updateProjectQuery, values, function(error){

            callback(error)
        })
    }
}

exports.updateProjectNewImage = function(name, shortDescription, informationText, link, id, fileName, callback){

    const updateProjectQuery = "UPDATE Projects SET Name = ?, ShortDescription = ?, InformationText = ?, ImageFileName = ?, WebLink = ? WHERE Id = ?"
    const values = [name, shortDescription, informationText, fileName, link, id]

    dataBase.run(updateProjectQuery, values, function(error){

        callback(error)
    })
}

exports.getProjectById = function(id, callback){

    dataBase.get("SELECT * FROM Projects WHERE Id = ?", [id], function(error, project){

        callback(error, project)
    })
}

exports.getBlogPostById = function(id, callback){

    dataBase.get("SELECT * FROM Blogposts WHERE Id = ?", [id], function(error, blogPost){

        callback(error, blogPost)
    })
}

exports.getCommentById = function(id, callback){
    
    dataBase.get("SELECT * FROM Comments WHERE Id = ?", [id], function(error, comment){

        callback(error, comment)
    })
}

exports.deleteBlogPost = function(id, callback){
    
    dataBase.run("DELETE FROM Blogposts WHERE Id = ?", [id], function(error){

        callback(error)
    })
}

exports.deleteComment = function(id, callback){

    dataBase.run("DELETE FROM Comments WHERE Id = ?", [id], function(error){

        callback(error)
    })
}

exports.deleteProject = function(id, callback){

    dataBase.run("DELETE FROM Projects WHERE Id = ?", [id], function(error){

        callback(error)
    })
}