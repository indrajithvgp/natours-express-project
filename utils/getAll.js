    //Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    //Advanced Filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    let query = Tour.find(JSON.parse(queryStr));
    // console.log(query);///////////////////////////////
    //Sorting

    if(req.query.sort){
      const sortStr = req.query.sort.split(',').join(" ")
      query = query.sort(sortStr)
    }else{
      query = query.sort('-createdAt')
    }
    Fields
    if(req.query.fields){
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    }else{
      query = query.select("-__v")
    }
    Pagination
    const page = req.query.page*1 || 1
    const limit = req.query.limit*1 || 100
    const skip = (page-1)*limit
    query = query.skip(skip).limit(limit)

    if(req.query.page){
      const numTours = await Tour.countDocuments()
      if(skip>numTours) throw new Error('This Page does not Exist')
    }