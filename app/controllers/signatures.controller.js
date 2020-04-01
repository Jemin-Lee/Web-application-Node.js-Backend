const signaturesModel = require('../models/signatures.model');
const petitionsModel = require('../models/petitions.model');
const passwords = require('../service/password');
const camelcaseKeys = require('camelcase-keys');

exports.viewSignatures = async function(req, res){
  try{
    const signatures = await signaturesModel.getSignatures(req.params.id);
    if (!signatures){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    } else{
      res.statusMessage = 'OK';
      res.status(200).json(signatures);
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};

exports.signPetition = async function (req, res){
  try{
    const petitionFound = await petitionsModel.viewPetition(req.params.id);

    if (!req.currentId){
      res.statusMessage = 'Unauthorized';
      res.status(401).send();
    }

    else if (!petitionFound){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    }else{
      const result = await signaturesModel.signPetition(req.currentId, req.params.id);
      if (!result){
        res.statusMessage = 'Forbidden';
        res.status(403).send();
      }else{
        res.statusMessage = 'OK';
        res.status(200).send();
      }
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};


exports.unsignPetition = async function (req, res) {
  try{
    const petitionFound = await petitionsModel.viewPetition(req.params.id);

    if (!req.currentId){
      res.statusMessage = 'Unauthorized';
      res.status(401).send();
    }

    else if (!petitionFound){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    }else{


      const result = await signaturesModel.unsignPetition(req.currentId, req.params.id);

      if (!result){
        res.statusMessage = 'Forbidden';
        res.status(403).send();
      }else{
        res.statusMessage = 'OK';
        res.status(200).send();
      }



    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};
