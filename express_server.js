
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

//app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["TinyApp"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// Generate a Random Short URL ID
function generateRandomString() {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 7; i++) {
  result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
}

// Helper function to find a user by email
function getUserByEmail(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return false; 
}


app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user:user};

  if (req.session.user_id) {
      return res.redirect('/urls');
    }

  
  res.render('login',templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  // Check if a user with the provided email exists
  if (!user) {
    return res.status(403).send("Email not found");
  }
  else{
    // Compare the password with the existing user's password
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
    
  }
  else{
    return res.status(403).send("Incorrect password");
  }
  };
});

// Need to test
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user:user};

  if (req.session.user_id) {
      return res.redirect('/urls');
    }
  
  res.render('register',templateVars);
});


app.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }
  else{
    // Check if email is already registered
  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already exists");
    }
  }

  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create a new user object
  const newUser = {
    id: userId,
    email,
    password: hashedPassword 
  };

  users[userId] = newUser;
  res.session.user_id = userId;
  res.redirect('/urls');

  
  }
//testing
//console.log(users);
});



// GET Route 
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user:user};
  
    if (!req.session.user_id) {
      return res.redirect('/login');
    }
  res.render("urls_new",templateVars);
});

// POST Route

app.post('/urls/:id', (req, res) => {
  
  const shortURL = req.params.id;

  if(!urlDatabase[shortURL]){
    return res.status(404).send("<h1>404 Not Found</h1><p>The requested URL does not exist.</p>");
  }
  else{
    if (urlDatabase[req.params.id].userID === req.session["userID"]) {
      let longURL = req.body.longURL;
      urlDatabase[req.params.id].longURL = longURL;
      res.redirect('/urls');
    }
    else{
      res.status(403).send("Access not allowed");
    }
  }
  //res.redirect('/urls');
});


app.get("/u/:shortURL", (req, res) => {
  //const longURL = urlDatabase[req.params.shortURL];
  //console.log("longURL", longURL);
  //res.redirect(longURL);

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {

  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send("<h1>403 Forbidden</h1><p>You are not authorized to delete this URL.</p>");
  }
  else{
    const shortURL = req.params.id;
    console.log(urlDatabase[req.params.shortURL].userID);
  if (urlDatabase[shortURL].userID === req.session["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not allowed Access");
  }

  }

  /* console.log(req.params.shortURL);
  delete urlDatabase[shortURL];
  res.redirect('/urls'); */
})


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  urlDatabase[shortURL]= longURL
  
  if (!req.session.user_id) {
    return res.status(403).send("<p>You must be logged in to create a new URL.</p>");
  }
  else{
  urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
      
    };
    res.redirect(`/urls/${shortURL}`); 
  }


  
});


app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const user = users[userId];
// Check if the URL exists in the database
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("<h1>404 Not Found</h1><p>The requested URL does not exist.</p>");
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send("<h1>403 Forbidden</h1><p>You are not authorized to access this URL.</p>");
  }
  

  const templateVars = { user:user, shortURL, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const userURLs = {};
  const userId = req.session.user_id;
  const user = users[userId];
 // Checks URLs associated with the logged-in user
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === req.session.user_id) {
      userURLs[id] = urlDatabase[id];
    }
  }


  const templateVars = { user: user,  urls: userURLs };
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