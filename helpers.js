// Helper function to find a user by email
function getUserByEmail(email, users) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return false; 
}


module.exports = { getUserByEmail };