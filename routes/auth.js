const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

// User Creation Route:
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    // Check if any of the required fields are missing
    return res
      .status(400)
      .json({ message: "Please fill all details correctly." });
  }

  if (name.length < 4) {
    // Validate name length
    return res
      .status(400)
      .json({ message: "Name should be at least 4 characters long." });
  }

  if (!isValidEmail(email)) {
    // Validate email format
    return res.status(400).json({ message: "Invalid email address." });
  }

  if (password.length < 6) {
    // Validate password length
    return res
      .status(400)
      .json({ message: "Password should be at least 6 characters long." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if a user with the same email already exists in the database
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });
    }

    const user = new User({
      name,
      email,
      password: password,
    });
    await user.save();

    const data = {
      user: {
        id: user._id,
      },
    };
    const secretkey = process.env.SECRET_KEY;
    const authToken = jwt.sign(data, secretkey);

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating the user." });
  }
});

// Login endpoint:
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Check if any of the required fields are missing
    return res
      .status(400)
      .json({ message: "Please fill all details correctly." });
  }

  if (!isValidEmail(email)) {
    // Validate email format
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      // Check if the user with the given email exists
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (!comparePassword) {
      // Check if the password is incorrect
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const data = {
      user: {
        id: findUser._id,
      },
    };
    const secretkey = process.env.SECRET_KEY;
    const authToken = jwt.sign(data, secretkey);

    res.status(200).json({
      message: "Login successful",
      name: findUser.name,
      token: authToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating the user." });
  }
});

// User details fetch:
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/updateuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }
    if (password) {
        user.password = password;
    }
    await user.save();

    res.json({ message: "User details updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Function to validate the email format (basic check for the presence of '@')
function isValidEmail(email) {
  return email.includes("@");
}

module.exports = router;
