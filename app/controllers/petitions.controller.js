const petitionsModel = require('../models/petitions.model');
const passwords = require('../service/password');
const camelcaseKeys = require('camelcase-keys');

function checkEmpty(input){
    if (!input){
        return false;
    }else{
        //input empty || only white-space || null
        return !(input.length === 0 || !input.trim() || !input);
    }
}


/*list all petitions come back later


exports.viewPetitions = async function (req, res){


};


*/

exports.addPetition = async function (req, res) {
  const categoriesDB = await petitionsModel.categories();
  const categories = categoriesDB[0];

  if (!req.currentId){
    res.statusMessage = "Unauthorized";
    res.status(401).send();
  }

  if (((!('title' in req.body)) || (!checkEmpty(req.body.title)))){
    res.statusMessage = "Bad Request title";
    res.status(400).send();
  }

  if (!categories.find(element => element.category_id == req.body.categoryId)) {
    res.statusMessage = "Bad Request";
    res.status(400).send();
  }
  try {
    const petitionId = await petitionsModel.addPetition(req.body, req.currentId);
    res.statusMessage = 'Created';
    res.status(201).json({petitionId});
  } catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};


exports.viewPetition = async function (req, res) {
  try {
    const petition = await petitionsModel.viewPetition(req.params.id);
    if (!petition){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    } else {
      res.statusMessage = 'OK';
      res.status(200).json(petition);
    }
  }catch(err){
    res.status(500).send();
  }
}


exports.changePetition = async function (req, res){
  const petitionFound = await petitionsModel.viewPetition(req.params.id);
  const categoriesDB = await petitionsModel.categories();
  const categories = categoriesDB[0];

  if (!categories.find(element => element.category_id == req.body.categoryId)) {
    res.statusMessage = "Bad Request";
    res.status(400).send();
  }
  else if (!(petitionFound.authorId == req.currentId)){

    res.statusMessage = 'Forbidden';
    res.status(403).send();

  }

  else if (!req.currentId){
    res.statusMessage = 'Unauthorized';
    res.status(401).send();
  }

  else if (!petitionFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
  }

  else{
    try {
          await petitionsModel.changePetition(req.body, req.params.id);
          res.statusMessage = 'OK';
          res.status(200).send();
      } catch (err) {
          res.statusMessage = 'Internal Server Error';
          res.status(500).send();
      }
  }
};


exports.deletePetition = async function (req, res) {
  const petitionFound = await petitionsModel.viewPetition(req.params.id);

  if (!req.currentId){
    res.statusMessage = 'Unauthorized';
    res.status(401).send();
  }

  else if (!(petitionFound.authorId == req.currentId)){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
  }

  else if (!petitionFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
  }

  else{
    try{
      await petitionsModel.deletePetition(req.params.id);
      res.statusMessage = 'OK';
      res.status(200).send();
    }catch(err){
      res.statusMessage = 'Internal Server Error';
      res.status(500).send();
    }
  }
};


exports.viewCategories = async function (req, res){
  try{
    const categoriesDB = await petitionsModel.categories();
    const categories = categoriesDB[0].map(category => camelcaseKeys(category));
    res.statusMessage = 'OK';
    res.status(200).json(categories);

  }catch(err){
    if (!err.hasBeenLogged) console.error(err);
    throw err;
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};
