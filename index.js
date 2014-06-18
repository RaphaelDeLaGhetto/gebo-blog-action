var nconf = require('nconf'),
    q = require('q');

module.exports = function () {

    var blogDb = require('./schemata/blog')();

    /**
     * Add a new document to the blog collection
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.createBlog = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content && message.content.title) {
            var blog = new blogDb.blogModel({ title: message.content.title });
            blog.save(function(err, savedBlog) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(savedBlog);
                }
              });
          }
          else {
            deferred.reject('You didn\'t title your new blog');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };

    /**
     * Delete a document from the blog collection
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.deleteBlog = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content && message.content.id) {
            blogDb.blogModel.findByIdAndRemove(message.content.id, function(err) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(true);
                }
              });
          }
          else {
            deferred.reject('You didn\'t specify which blog you want to turf');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };

    /**
     * Save a post to the blog collection 
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.savePost = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content) {
            var post = new blogDb.postModel(message.content);
            post.save(function(err, savedPost) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(savedPost);
                }
              });
          }
          else {
            deferred.reject('Where\'s the post? You\'re missing something');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };

    /**
     * Delete post from database 
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.deletePost = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content && message.content.id) {
            blogDb.postModel.findByIdAndRemove(message.content.id, function(err, post) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(post);
                }
              });
          }
          else {
            deferred.reject('Which post do you want to delete?');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };


    /**
     * Set a post's published flag to true
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.publishPost = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content && message.content.id && typeof message.content.published === 'boolean') {
            blogDb.postModel.findOneAndUpdate({ _id: message.content.id }, { published: message.content.published }, function(err, post) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(post);
                }
              });
          }
          else {
            deferred.reject('Which post do you want to publish?');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };

    /**
     * Save a comment to the comments collection 
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.saveComment = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content) {
            var comment = new blogDb.commentModel(message.content);
            comment.save(function(err, savedComment) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(savedComment);
                }
              });
          }
          else {
            deferred.reject('Upon what are you commenting? You\'re missing something');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };

    /**
     * Delete comment from the comment collection 
     *
     * @param Object
     * @param Object
     * 
     * @return Promise
     */
    exports.deleteComment = function(verified, message) {
        var deferred = q.defer();
        if (verified.admin || verified.write) {
          if (message.content && message.content.id) {
            blogDb.commentModel.findByIdAndRemove(message.content.id, function(err, post) {
                if (err) {
                  deferred.reject(err);
                }
                else {    
                  deferred.resolve(post);
                }
              });
          }
          else {
            deferred.reject('Which comment do you want to delete?');
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };


    return exports;
};
