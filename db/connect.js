const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

mongoose.connect(process.env.MONGO_URL, {
  // https://mongoosejs.com/docs/deprecations.html
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => console.log(`Connected to db`));
