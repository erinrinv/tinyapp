const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["TinyApp"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }),
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
    id: "user1Random",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync("funk", 10),
  },
};

// Generate a Random Short URL ID
function generateRandomString() {
  const alphaNumerical =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += alphaNumerical.charAt(
      Math.floor(Math.random() * alphaNumerical.length),
    );
  }
  return result;
}

const checkIfUserIdInData = function (req, res) {
  const shortURL = req.params.shortURL;
  const userid = req.session.user_id;
  if (userid !== urlDatabase[shortURL].userID) {
    res.status(400).send("Error: You cannot delete this");
    return;
  }
};

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
  };

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  // Check if a user with the provided email exists
  if (!user) {
    return res.status(403).send("Email not found");
  } else {
    // Compare the password with the existing user's password
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;

      res.redirect("/urls");
    } else {
      return res.status(403).send("Incorrect password");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
  };

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  } else {
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
      password: hashedPassword,
    };

    users[userId] = newUser;
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});

// GET Route
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
  };

  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// POST Route

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  checkIfUserIdInData(req, res);
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL; // Extract shortURL from request parameters
  if (!urlDatabase[shortURL]) {
    return res
      .status(404)
      .send("<h1>404 Not Found</h1><p>The requested URL does not exist.</p>");
  }

  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res
      .status(403)
      .send(
        "<h1>403 Forbidden</h1><p>You are not authorized to delete this URL.</p>",
      );
  }

  // Now that you've checked authorization, you can safely delete the URL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  if (!req.session.user_id) {
    return res
      .status(403)
      .send("<p>You must be logged in to create a new URL.</p>");
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
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
    return res
      .status(404)
      .send("<h1>404 Not Found</h1><p>The requested URL does not exist.</p>");
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res
      .status(403)
      .send(
        "<h1>403 Forbidden</h1><p>You are not authorized to access this URL.</p>",
      );
  }

  const templateVars = {
    user: user,
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };
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

  const templateVars = { user: user, urls: userURLs };

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
