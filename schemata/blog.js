
var mongoose = require('mongoose');

modules.exports = function(email) {

    /**
     *  Database config
     */
    var uristring =
            process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            'mongodb://localhost/' + dbName;

    var mongoOptions = { db: { safe: true } };

    /**
     * Connect to mongo
     */
    var connection = mongoose.createConnection(uristring, mongoOptions);

    connection.on('open', function() {
        console.log ('Successfully connected to: ' + uristring);
      });

    connection.on('error', function(err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      });

    exports.connection = connection;

    var Schema = mongoose.Schema,
        ObjectId = Schema.Types.ObjectId;

    /**
     * Simple blog schema
     */
    var blogSchema = new Schema({
        headline: { type: String, required: true },
        slug: { type: String, required: true },
        body: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now() },
        published: { type: Boolean, required: true, default: false },
      });

    // Export blog schema
    try {
      var blogModel = connection.model('Blog', blogSchema);
          exports.blogModel = blogModel;
    }
    catch (error) {}

    return exports;
};
