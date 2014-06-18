'use strict';

var geboMongoose = require('gebo-mongoose-connection');

module.exports = function() {

    var mongoose = geboMongoose.get();

    var Schema = mongoose.Schema,
        ObjectId = Schema.Types.ObjectId;

    exports.connection = mongoose.connection;

    /**
     * Blogs
     */
    var blogSchema = new Schema({
        title: { type: String, required: true, unique: false },
      });

    // Export comment schema
    try {
      var blogModel = mongoose.model('Blog', blogSchema);
      exports.blogModel = blogModel;
    }
    catch (error) {}


    /**
     * Comments
     */
    var commentSchema = new Schema({
        postId: { type: ObjectId, require: true },
        byline: { type: String, required: true },
        body: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now() },
      });

    // Export comment schema
    try {
      var commentModel = mongoose.model('Comment', commentSchema);
      exports.commentModel = commentModel;
    }
    catch (error) {}

    /**
     * Posts
     */
    var postSchema = new Schema({
        blogId: { type: ObjectId, require: true },
        headline: { type: String, required: true },
        byline: { type: String, required: true },
        lead: { type: String, required: false },
        body: { type: String, required: false },
        date: { type: Date, required: true, default: Date.now() },
        published: { type: Boolean, required: true, default: false },
        commentsAllowed: { type: Boolean, required: true, default: false },
      });

    // Export post schema
    try {
      var postModel = mongoose.model('Post', postSchema);
      exports.postModel = postModel;
    }
    catch (error) {}

    return exports;
};
