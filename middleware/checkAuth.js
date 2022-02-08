const checkAuth = (req, res, next) => {
  //checking the user is logged in or not using session id which we get in request object
  const id = req.session.userId;
  if (id) {
    req.id = id;
  } else {
    return;
  }
  next();
};
export default checkAuth;
