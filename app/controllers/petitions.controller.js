const petitionsModel = require('../models/petitions.model');
const passwords = require('../service/password');
const camelcaseKeys = require('camelcase-keys');
const fs = require('mz/fs');

function checkEmpty(input){
    if (!input){
        return false;
    }else{
        //input empty || only white-space || null
        return (input.length === 0 || !input.trim() || !input);
    }
}


exports.getPetition = async function (req, res) {
  try {
    const petition = await petitionsModel.getPetition(req.params.id);
    if (petition){
      res.statusMessage = 'OK';
      res.status(200).json(petition);
    } else {
      res.statusMessage = 'Not Found';
      res.status(404).send();
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
}


exports.patchPetition = async function (req, res){
  const petitionFound = await petitionsModel.getPetition(req.params.id);
  const categoriesDB = await petitionsModel.categories();
  const categories = categoriesDB[0];
  if (!petitionFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }

  if ('categoryId' in req.body){
    if (!categories.find(element => element.category_id == req.body.categoryId)) {
      res.statusMessage = "Bad Request";
      res.status(400).send();
      return;
    }
  }


  if (petitionFound.authorId == req.currentId){
    console.log(petitionFound);
    console.log(req.params.id);
    try {
          await petitionsModel.patchPetition(req.body, req.params.id);
          res.statusMessage = 'OK';
          res.status(200).send();
          return;
      } catch (err) {
          res.statusMessage = 'Internal Server Error';
          res.status(500).send();
      }
  }
  else{
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }
};



exports.deletePetition = async function (req, res) {
  const petitionFound = await petitionsModel.getPetition(req.params.id);
  if (!petitionFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }

  if (!req.currentId){
    res.statusMessage = 'Unauthorized';
    res.status(401).send();
    return;
  }


  if (petitionFound.authorId == req.currentId){
    try{
      await petitionsModel.deletePetition(req.params.id);
      res.statusMessage = 'OK';
      res.status(200).send();
      return;
    }catch(err){
      res.statusMessage = 'Internal Server Error';
      res.status(500).send();
      return;
    }
  }else{
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }
};


/*list all petitions come back later


exports.viewPetitions = async function (req, res){


};


*/

exports.postPetition = async function (req, res) {
  if (!('title' in req.body) || checkEmpty(req.body.title)){
    res.statusMessage = "Bad Request title";
    res.status(400).send();
  }

  const today = new Date();
  const closingDate = new Date(req.body.closingDate)
  if (closingDate < today){
    res.statusMessage = "Bad Request Date";
    res.status(400).send();
    return;
  }

  const categoriesDB = await petitionsModel.categories();
  const categories = categoriesDB[0];
  if (!categories.find(element => element.category_id == req.body.categoryId)) {
    res.statusMessage = "Bad Request";
    res.status(400).send();
    return;
  }else{
    try {
      const petitionId = await petitionsModel.postPetition(req.body, req.currentId);
      res.statusMessage = 'Created';
      res.status(201).json({petitionId});
    } catch(err){
      res.statusMessage = 'Internal Server Error';
      res.status(500).send();
    }
  }

};


exports.getCategories = async function (req, res){
  try{
    const categoriesRaw = await petitionsModel.categories();
    const categories = categoriesRaw[0].map(category => camelcaseKeys(category));

    res.statusMessage = 'OK';
    res.status(200).json(categories);

  }catch(err){
    throw err;
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};


exports.getPetitionPhoto = async function (req, res){
  try {
    console.log(req.params.id);
    const photoName = await petitionsModel.getPhotoName(req.params.id);
    if (!photoName){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    } else{
      console.log(photoName);
      const readPhoto = await petitionsModel.readPhoto(photoName);
      res.statusMessage = 'OK';
      res.status(200).contentType(readPhoto.mimeType).send(readPhoto.fileName);
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};

exports.putPetitionPhoto = async function (req, res){
  const petitionData = await petitionsModel.findPetitionId(req.params.id)
  if (!petitionData){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }
  if (!(petitionData.author_id == req.currentId)){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }

  let imageExtension = null;
  switch (req.header('Content-Type')){
    case 'image/jpeg':
    imageExtension = '.jpg';
    break;
    // case 'image/gif':
    // imageExtension = '.gif';
    // break;
    case 'image/png':
    imageExtension = '.png';
    break;
  }
  if (imageExtension === null){
    res.statusMessage = 'Bad Request';
    res.status(400).send();
    return;
  }

  try{
    const photoExist = await petitionsModel.getPhotoName(req.params.id);

    if (!photoExist) {
      const imageName = await petitionsModel.writePhoto(req.body, imageExtension);
      await petitionsModel.putProfilePhoto(req.params.id, imageName);
      res.statusMessage = 'Created';
      res.status(201).send();
      return;
    }else {
      await petitionsModel.unlinkPhoto(photoExist);
      const imageName = await petitionsModel.writePhoto(req.body, imageExtension);
      await petitionsModel.putProfilePhoto(req.currentId, imageName);
      res.statusMessage = 'OK';
      res.status(200).send();
      return;
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }

};
