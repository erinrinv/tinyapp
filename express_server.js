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
app.use(express.urlencoded({ extended: true }));

// User database:

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Helper Function:

// Helper function to find a user by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false; 
}



// GET Route  new URL
app.get("/urls/new", (req, res) => {
  const user = req.user;
  res.render("urls_new", { user });
});

// POST Route

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})


app.post('/login', (req, res) => {
  const templateVars = { 
    user: req.cookies[users]};
    res.render("urls_index",templateVars);
});


//register form 
app.get("/register", (req, res) => {
  const templateVars = { 
  username: req.cookies["username"]
  };
  res.render("/register",templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Check if email or password are empty strings
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  // Check if email is already in use
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Email already exists.");
  }

  const userId = generateRandomString();

  // Create user object
  const newUser = {
    id: userId,
    email,
    password
  };

  // Add user to global users object
  users[userId] = newUser;

  // Set user_id cookie containing the user's ID
  res.cookie('user_id', userId);

  // Redirect user to /urls page
  res.redirect('/urls');

});



app.post('/login', (req, res) => {
  const templateVars = { 
    user: req.cookies[users]};
    res.render("urls_index",templateVars);
});


app.post("/login",(req, res) => {

  const emailIn = req.body.email;
  const passwordIn = req.body.password;

  

  if (!existingEmail(emailIn) || !existingPassword(passwordIn)) {
    
    res.status(403).send("Error!: email or password wrong");
  } else {
    const foundUser = findUserByEmail(emailIn,users);
    if (foundUser) {
      req.session.user_id = foundUser.id;
      res.redirect("/urls");
    }
  }
});

app.get("/logout",(req, res) => {
  
  req.session = null;
  res.redirect("/urls");
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