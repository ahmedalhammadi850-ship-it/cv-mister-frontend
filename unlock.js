const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://useradmin:ahmedyes300@cluster0.63tummq.mongodb.net/cv-mister?retryWrites=true&w=majority')
  .then(async () => {
    const User = require('../backend/models/User');
    const users = await User.find({});
    for(let u of users) {
      u.upgradeFailedAttempts = 0;
      u.upgradeLastRejectedAt = null;
      u.upgradeLockedUntil = null;
      await u.save();
    }
    console.log("Done unlocking all users");
    process.exit();
  });
