// Generate a Random Short URL ID
function generateRandomString() {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 7; i++) {
  result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
}




const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.use(cookieParser());


app.set("view engine", "ejs");
//POST Requests
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// GET Route 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// POST Route

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})


app.post('/login', (req, res) => {
  const templateVars = { 
    username: res.cookies["username"]};
    res.render("urls_login",templateVars);
});




app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL
  urlDatabase[req.params.id] = longURL;
  res.redirect('/urls');
})


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log("longURL", longURL);
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log("DELETE ROUTE");
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  //console.log(req.body); // Log the POST request body to the console
  const longURL = req.body.longURL
  urlDatabase[shortURL]= longURL
  //console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); 
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});