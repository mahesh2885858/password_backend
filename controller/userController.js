import session from "express-session";
import userModel from "../models/userScheema.js";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password, cpassword } = req.body;
      //checking whether the given input is meet our requirements
      const isGoodInput =
        name.trim().length > 3 &&
        email.trim().length > 3 &&
        password.trim().length > 5 &&
        cpassword.trim().length > 5
          ? true
          : false;
      if (isGoodInput) {
        //seraching if the email entered is already existig in our database
        const similarEmail = await userModel.find({ email });
        if (similarEmail.length === 0) {
          if (password === cpassword) {
            // hasing the password before saving in database
            const hashedPassword = await bcrypt.hash(password, 12);
            const data = new userModel({
              name,
              email,
              password: hashedPassword,
            });
            const result = await data.save();
            console.log(result);
            res.status(200).send("User Registered Successfully");
          } else {
            res.status(400).send("Both passwords did not match");
          }
        } else {
          res.status(400).send("user with that email already exist");
        }
      } else {
        res
          .status(400)
          .send(
            "All fields should be greater than three characters and password fields should be greather than five characters"
          );
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const isGoodInput =
        email.length > 3 && password.length > 5 ? true : false;
      if (isGoodInput) {
        // checking any user exist with the email entered by the user
        const user = await userModel.findOne({ email });
        if (user) {
          // comparing the both passwords
          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );
          if (isPasswordCorrect) {
            let session = req.session;
            session.userId = user._id;
            // adding a session
            console.log(req.session);
            const mapthis = user.items.map((item) => {
              // decrypting the user saved passwords so that they can see those passwords
              const bytes = CryptoJS.AES.decrypt(
                item.password,
                process.env.SECRET_KEY
              );
              const originalText = bytes.toString(CryptoJS.enc.Utf8);
              item.password = originalText;
              return item;
            });
            res.status(200).send(user);
          } else {
            res.status(401).send("Entered password is wrong");
          }
        } else {
          res.status(400).send("User with that Email does not exist");
        }
      } else {
        res.status(400).send("Details are not Valid");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },
  retainLogin: async (req, res) => {
    try {
      // To keep user logged in between the page reloads
      const user = await userModel.findOne({ _id: req.id });
      const mapthis = user.items.map((item) => {
        const bytes = CryptoJS.AES.decrypt(
          item.password,
          process.env.SECRET_KEY
        );
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        item.password = originalText;
        return item;
      });
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(403).send("not found user");
      }
    } catch (err) {
      res.status(401).send(err);
    }
  },
  logout: async (req, res) => {
    try {
      req.session.destroy((err) => {
        res.send("logout");
      });
    } catch (error) {
      console.log(error);
    }
  },
  addItem: async (req, res) => {
    // Adding an Entry to the user's database i.e, user's account
    try {
      const { websitename, username, email, password } = req.body;
      const isGoodInput =
        websitename && username && email && password ? true : false;
      if (isGoodInput) {
        // encrypting the passwords before storing on the database
        const cryptedPassword = CryptoJS.AES.encrypt(
          password,
          process.env.SECRET_KEY
        ).toString();
        const body = { ...req.body, password: cryptedPassword };
        const user = await userModel.updateOne(
          { _id: req.id },
          { $push: { items: body } }
        );
        if (user) {
          res.status(200).send("added item into database");
        } else {
          res.status(400).send("Not able to add item to database");
        }
      } else {
        res.status(400).send("Empty fields are not allowed");
      }
    } catch (err) {
      console.log(err);
    }
  },

  update: async (req, res) => {
    // updating the user entries
    try {
      // encrypting the updated passwords before saving on database
      let crypt = CryptoJS.AES.encrypt(
        req.body.state.password,
        process.env.SECRET_KEY
      ).toString();

      const user = await userModel.updateOne(
        { _id: req.id, "items._id": req.body.id },
        {
          $set: {
            "items.$.username": req.body.state.username,
            "items.$.websitename": req.body.state.websitename,
            "items.$.email": req.body.state.email,
            "items.$.password": crypt,
          },
        }
      );
      if (user) {
        res.status(200).send(user);
      }
    } catch (error) {
      console.log(error);
    }
  },
  delete: async (req, res) => {
    // Deleting an en entry
    try {
      const deletedItem = await userModel.updateOne(
        { _id: req.id },
        {
          $pull: {
            items: {
              _id: req.body.id,
            },
          },
        }
      );
      res.send(deletedItem);
    } catch (err) {
      console.log(err);
    }
  },
};
export default userController;
