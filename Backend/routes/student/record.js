//Employee collection
const express = require("express");
const jwt = require("jsonwebtoken");

const recordRoutes = express.Router();

const dbo = require("../../db/conn");

const ObjectId = require("mongodb").ObjectId;

const bcrypt = require("bcrypt");

const saltRounds = 10;

//Select all record
recordRoutes.route("/").get(function (req, res) {
  let db_connect = dbo.getDb("Management");
  db_connect
    .collection("Student")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

//Select one record
recordRoutes.route("/:id").get(function (req, res) {
  let db_connect = dbo.getDb("Management");
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect
    .collection("Student")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

//add record
recordRoutes.route("/add").post(function (req, response) {
	let db_connect = dbo.getDb("Management");

	// let email = req.body.email.email;
	let myquery = { email: req.body.email.email };
	db_connect.collection("Student").findOne(myquery, function (err, result) {
		if (err) throw err;
		if (result) {
			console.log("Email already exists");
			console.log(req.body.email.email);
			return response.status(400).json({ success: false, msg: "Email already exists" , found: "email" });
		} else {
			let myquery = { contactno: req.body.contactno.contactno };
			db_connect.collection("Student").findOne(myquery, function (err, result) {
				if (err) throw err;
				if (result) {
					console.log("Contact No already exists");
					console.log(req.body.contactno.contactno);
					return response.status(400).json({ success: false, msg: "Contact No already exists" , found: "contact" });
				} else {
					let myobj = {
						name: req.body.name,
                        email: req.body.email,
                        contact: req.body.contact,
                        photo: req.body.photo,
                        address: req.body.address,
                        password: passowrd
					};
					db_connect.collection("Student").insertOne(myobj, function (err, res) {
						if (err) throw err;
						console.log("1 document inserted");
						return response.status(400).json({ success: true, msg: "1 document inserted" });
					});
				}
			});
		}
	});
});

//update record by id
recordRoutes.route("/update/:id").post(async (req, response) => {
  let db_connect = dbo.getDb("Management");
  let myquery = { _id: ObjectId(req.params.id) };
  let passowrd = await bcrypt.hash(req.body.password, saltRounds);
  let newvalues = {
    $set: {
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      photo: req.body.photo,
      address: req.body.address,
      password: passowrd
    },
  };
  db_connect
    .collection("Student")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      response.json(res);
    });
});

//delete a record by id
recordRoutes.route("/delete/:id").delete((req, response) => {
  let db_connect = dbo.getDb("Management");
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("Student").deleteOne(myquery, function (err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    response.json(obj);
  });
});

//login function
recordRoutes.route("/login").post(async (req, response) => {
  let db_connect = dbo.getDb("Management");
  let email = req.body.email;
  let password = req.body.password;

  db_connect.collection("Student").findOne({ email: email }, async (err, result) => {
    if (err) throw err;
    if (result) {
      try {
        if (await bcrypt.compare(password, result.password)) {
          console.log("Login Success");
          const token = jwt.sign(
            {
              id: result._id,
            },
            "secretkey"
          );

          return response.json({ user: true, msg: "Login Success", status: "ok", token: token });
        } else {
          return response.json({ user: false, msg: "Invalid Password", status: "error" });
        }
      } catch {
        response.status(500).send()
      }
    } else {
      return response.json({ user: false, msg: "User Not Found", status: "error" });
    }
  });
});

module.exports = recordRoutes;