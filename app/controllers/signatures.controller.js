const signaturesModel = require('../models/signatures.model');
const petitionsModel = require('../models/petitions.model');
const passwords = require('../service/password');
const camelcaseKeys = require('camelcase-keys');

exports.getSignatures = async function(req, res){
  try{
    const petition = await petitionsModel.getPetition(req.params.id);
    if (!petition){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    }else{
      const signatures = await signaturesModel.getSignatures(req.params.id);
      if(signatures.length < 1){
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
      }
      res.statusMessage = 'OK';
      res.status(200).json(signatures);
      return;
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};

exports.postSignature = async function (req, res){
  try{
    const petition = await petitionsModel.getPetition(req.params.id);
    if (!petition){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    }else{
      const signed = await signaturesModel.signedPetition(req.currentId);
      if (signed.find(element => element.petition_id == req.params.id)){
        await signaturesModel.postSignature(req.currentId, req.params.id);
        res.statusMessage = 'Created';
        res.status(201).send();
        return;
      }else{
        res.statusMessage = 'Forbidden not signed';
        res.status(403).send();
        return;
      }
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};


exports.deleteSignature = async function (req, res) {
  try{
    const petition = await petitionsModel.getPetition(req.params.id);
    if (!petition){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    }else{
      const signed = await signaturesModel.signedPetition(req.currentId);
      if (signed.find(element => element.petition_id == req.params.id)){
        await signaturesModel.deleteSignature(req.currentId, req.params.id);
        res.statusMessage = 'OK';
        res.status(200).send();
        return;

      }else{
        res.statusMessage = 'Forbidden already signed';
        res.status(403).send();
        return;
      }
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};
