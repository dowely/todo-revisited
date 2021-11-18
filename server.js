require('dotenv').config()
let express = require('express')
let mongodb = require('mongodb')
let sanitizeHtml = require('sanitize-html')

let app = express()
let db

const connectionString = `mongodb+srv://admin:${process.env.DB_PASS}@cluster0.urekp.mongodb.net/TodoApp?retryWrites=true&w=majority`

mongodb.connect(connectionString, {useNewUrlParser: true}, (err, client) => {
  db = client.db()
  app.listen(3000)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))
app.use(passwordEntered)

function passwordEntered(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm="Simple App"')
  if(req.headers.authorization == process.env.APP_PASS) {
    next()
  } else {
    res.status(401).send('Unauthorized access')
  }
}

app.get('/', function(req, res) {
  db.collection('items').find().toArray((err, items) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
      </head>
      <body>
        <div class="container">
          <h1 class="display-4 text-center py-1">To-Do App!</h1>
          
          <div class="jumbotron p-3 shadow-sm">
            <form id="user-form" action="/create-item" method="POST">
              <div class="d-flex align-items-center">
                <input id="input-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
              </div>
            </form>
          </div>
          
          <ul id="item-list" class="list-group pb-5">
        
          </ul>
          
        </div>

        <script>
            let items = ${JSON.stringify(items)}
        </script>
        
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

        <script src="browser.js"></script>
      </body>
      </html>
  `)
  })
})

app.post('/create-item', (req, res) => {
  let cleanText = sanitizeHtml(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').insertOne({text: cleanText}, (err, info) => res.json(info.ops[0]))
})

app.post('/update-item', (req, res) => {
  let cleanText = sanitizeHtml(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: cleanText}}, () => res.send('Thanks for updating'))
})

app.post('/delete-item', (req, res) => {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, () => res.send('Success'))
})

