const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Load common passwords
let commonPasswords = new Set();
try {
  const passwordList = fs.readFileSync(
    path.join(__dirname, "10-million-password-list-top-1000.txt"),
    "utf8"
  );
  commonPasswords = new Set(
    passwordList
      .split("\n")
      .map((pwd) => pwd.trim())
      .filter((pwd) => pwd.length > 0)
  );
} catch (error) {
  console.warn("Warning: Could not load common passwords list");
}

// Password validation function based on OWASP recommendations
function validatePassword(password) {
  const errors = [];

  // Check minimum length (8 characters)
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check maximum length (64 characters to prevent DoS)
  if (password.length > 64) {
    errors.push("Password must not exceed 64 characters");
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for at least one digit
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit");
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check against common passwords
  if (commonPasswords.has(password.toLowerCase())) {
    errors.push("Password is too common and not allowed");
  }

  // Check for common patterns
  if (/^(.)\1+$/.test(password)) {
    errors.push("Password cannot be all the same character");
  }

  // Check for sequential characters
  if (/123456|abcdef|qwerty/i.test(password)) {
    errors.push("Password cannot contain common sequential patterns");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

// Routes
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Password Login</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
            .form-container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
            input[type="password"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 3px; }
            button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
            button:hover { background-color: #0056b3; }
            .error { color: red; margin: 10px 0; }
            .requirements { font-size: 12px; color: #666; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h2>Secure Password Login</h2>
            <form method="POST" action="/login">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <div class="requirements">
                    Password requirements:
                    <ul>
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one digit</li>
                        <li>Contains at least one special character</li>
                        <li>Not a common password</li>
                    </ul>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Error</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
              .error { color: red; }
              a { color: #007bff; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="error">Password is required</div>
          <a href="/">Back to login</a>
      </body>
      </html>
    `);
  }

  const validation = validatePassword(password);

  if (!validation.isValid) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Validation Failed</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
              .error { color: red; margin: 10px 0; }
              a { color: #007bff; text-decoration: none; }
              ul { margin: 10px 0; }
          </style>
      </head>
      <body>
          <h3>Password validation failed:</h3>
          <ul>
              ${validation.errors
                .map((error) => `<li class="error">${error}</li>`)
                .join("")}
          </ul>
          <a href="/">Back to login</a>
      </body>
      </html>
    `);
  }

  // If password is valid, show welcome page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
            .welcome-container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; text-align: center; }
            .password-display { background-color: #f8f9fa; padding: 10px; border-radius: 3px; margin: 20px 0; word-break: break-all; }
            button { background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
            button:hover { background-color: #218838; }
        </style>
    </head>
    <body>
        <div class="welcome-container">
            <h2>Welcome!</h2>
            <p>Your password has been successfully validated.</p>
            <div class="password-display">
                Password: ${password}
            </div>
            <form method="GET" action="/">
                <button type="submit">Logout</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, validatePassword };
