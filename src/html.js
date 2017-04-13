

export default (req, res) => {
  let data = {appOrigin : '', renderOrigin : ''};
  res.render('index.pug', data);
};
