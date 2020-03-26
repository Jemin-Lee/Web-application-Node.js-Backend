const petitionsModel = require('../models/petitions.model');

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
