'use strict';

/**
 * Ensure that the connection is made to the test database
 */
var mongoose = require('gebo-mongoose-connection').get(true);

var actions = require('..')(),
    blogDb = require('../schemata/blog')(),
    utils = require('gebo-utils');

// Stores the various object IDs created in the setUps
var _id;

/**
 * createBlog
 */
exports.createBlog = {
    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should add a new blog to the database for an authorized agent': function(test) {
        test.expect(3);

        // Make sure there are no blogs in the database
        blogDb.blogModel.find({}, function(err, blogs) {
            if (err) {
              console.log(err);
            }
            test.equal(blogs.length, 0);
            actions.createBlog({ resource: 'blogs', write: true },
                               { content: { title: 'My cool new blog' } }).
                then(function(blog) {
                    test.equal(blog.title, 'My cool new blog');
                    test.ok(!!blog._id);
                    test.done();
                  }).
                catch(function(err) {
                    test.ok(false, err);
                    test.done();
                  });
          });
    },

    'Should add a new blog to the database for an admin': function(test) {
        test.expect(3);

        // Make sure there are no blogs in the database
        blogDb.blogModel.find({}, function(err, blogs) {
            if (err) {
              console.log(err);
            }
            test.equal(blogs.length, 0);
            actions.createBlog({ resource: 'blogs', admin: true },
                               { content: { title: 'My cool new blog' } }).
                then(function(blog) {
                    test.equal(blog.title, 'My cool new blog');
                    test.ok(!!blog._id);
                    test.done();
                  }).
                catch(function(err) {
                    test.ok(false, err);
                    test.done();
                  });
          });
    },

    'Should not add a new blog to the database if agent\'s not authorized': function(test) {
        test.expect(1);
        actions.createBlog({ resource: 'blogs' },
                           { content: { title: 'My cool new blog' } }).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the blog title not is not specified': function(test) {
        test.expect(1);
        actions.createBlog({ resource: 'blogs', write: true }, {}).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You didn\'t title your new blog');
                test.done();
              });
    },
};

/**
 * deleteBlog
 */
exports.deleteBlog = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            _id = savedBlog._id;
            callback();
          });
    },

    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should remove a blog from the database for an authorized agent': function(test) {
        test.expect(2);

        actions.deleteBlog({ resource: 'blogs', write: true },
                           { content: { id: _id} }).
            then(function(ack) {
                test.ok(ack);
                // Make sure the collection is empty
                blogDb.blogModel.find({}, function(err, blogs) {
                    test.equal(blogs.length, 0);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Should remove a blog from the database for an admin': function(test) {
        test.expect(2);

        actions.deleteBlog({ resource: 'blogs', admin: true },
                           { content: { id: _id} }).
            then(function(ack) {
                test.ok(ack);
                // Make sure the collection is empty
                blogDb.blogModel.find({}, function(err, blogs) {
                    test.equal(blogs.length, 0);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Should not delete a blog if the agent\'s not authorized': function(test) {
        test.expect(1);
        actions.deleteBlog({ resource: 'blogs' },
                           { content: { title: 'My cool new blog' } }).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the blog id is not specified': function(test) {
        test.expect(1);
        actions.deleteBlog({ resource: 'blogs', write: true }, {}).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You didn\'t specify which blog you want to turf');
                test.done();
              });
    },
};

/**
 * savePost
 */
exports.savePost = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            _id = savedBlog._id;
            callback();
          });
    },


    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should add a document to the blog collection for an authorized agent': function(test) {
        test.expect(13);

        actions.savePost({ resource: 'blogs', write: true },
                         { content: {
                                        blogId: _id,
                                        headline: 'My cat\'s breath smells like cat food',
                                        byline: 'Ralph Wiggum',
                                    }
                         }).
            then(function(post) {
                test.equal(post.blogId.toString(), _id.toString());
                test.equal(post.headline, 'My cat\'s breath smells like cat food');
                test.equal(post.byline, 'Ralph Wiggum');
                test.ok(!!post.date);
                test.equal(post.published, false);
                test.equal(post.commentsAllowed, false);

                // Make sure the post has been saved 
                blogDb.postModel.find({}, function(err, post) {
                    test.equal(post.length, 1);
                    test.equal(post[0].blogId.toString(), _id.toString());
                    test.equal(post[0].headline, 'My cat\'s breath smells like cat food');
                    test.equal(post[0].byline, 'Ralph Wiggum');
                    test.ok(!!post[0].date);
                    test.equal(post[0].published, false);
                    test.equal(post[0].commentsAllowed, false);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Should add a document to the blog collection for an admin': function(test) {
        test.expect(13);

        actions.savePost({ resource: 'blogs', admin: true },
                         { content: {
                                        blogId: _id,
                                        headline: 'My cat\'s breath smells like cat food',
                                        byline: 'Ralph Wiggum',
                                    }
                         }).
            then(function(post) {
                test.equal(post.blogId.toString(), _id.toString());
                test.equal(post.headline, 'My cat\'s breath smells like cat food');
                test.equal(post.byline, 'Ralph Wiggum');
                test.ok(!!post.date);
                test.equal(post.published, false);
                test.equal(post.commentsAllowed, false);

                // Make sure the post has been saved 
                blogDb.postModel.find({}, function(err, post) {
                    test.equal(post.length, 1);
                    test.equal(post[0].blogId.toString(), _id.toString());
                    test.equal(post[0].headline, 'My cat\'s breath smells like cat food');
                    test.equal(post[0].byline, 'Ralph Wiggum');
                    test.ok(!!post[0].date);
                    test.equal(post[0].published, false);
                    test.equal(post[0].commentsAllowed, false);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Should not save a document to the collection if not authorized': function(test) {
        test.expect(1);
        actions.savePost({ resource: 'blogs' },
                         { content: { headline: 'My cat\'s breath smells like cat food' } }).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post isn\'t included in the message contents': function(test) {
        test.expect(1);
        actions.savePost({ resource: 'blogs', write: true }, {}).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'Where\'s the post? You\'re missing something');
                test.done();
              });
    },
};

/**
 * deletePost 
 */
exports.deletePost = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: _id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                        }
                             }).
                then(function(post) {
                    _id = post._id;
                    callback();
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },


    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should delete the post from the database for an authorized user': function(test) {
        test.expect(2);
        actions.deletePost({ resource: 'blogs', write: true },
                           { content: { id: _id } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.find({}, function(err, posts) {
                    test.equal(posts.length, 0);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should delete the post from the database for an admin': function(test) {
        test.expect(2);
        actions.deletePost({ resource: 'blogs', admin: true },
                           { content: { id: _id } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.find({}, function(err, posts) {
                    test.equal(posts.length, 0);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should do nothing for an unauthorized agent': function(test) {
        test.expect(1);
        actions.deletePost({ resource: 'blogs' },
                           { content: { id: _id } }).
            then(function(ack) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post\'s ID is not included in the message content': function(test) {
        test.expect(1);
        actions.deletePost({ resource: 'blogs', write: true }, {}).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.ok(false, 'Shouldn\'t get here');
                    test.done();
                  });
              }).
            catch(function(err) {
                test.equal(err, 'Which post do you want to delete?');
                test.done();
              });
    },
};


/**
 * publishPost 
 */
exports.publishPost = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: _id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                        }
                             }).
                then(function(post) {
                    _id = post._id;
                    callback();
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },


    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should set the post\'s published flag to true for an authorized user': function(test) {
        test.expect(3);
        actions.publishPost({ resource: 'blogs', write: true },
                            { content: { id: _id, published: true } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.ok(post.published);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should set the post\'s published flag to true for an admin': function(test) {
        test.expect(3);
        actions.publishPost({ resource: 'blogs', write: true },
                            { content: { id: _id, published: true } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.ok(post.published);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should do nothing for an unauthorized agent': function(test) {
        test.expect(1);
        actions.publishPost({ resource: 'blogs' },
                            { content: { id: _id, published: true } }).
            then(function(ack) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post\'s ID is not included in the message content': function(test) {
        test.expect(1);
        actions.publishPost({ resource: 'blogs', write: true }, {}).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.ok(false, 'Shouldn\'t get here');
                    test.done();
                  });
              }).
            catch(function(err) {
                test.equal(err, 'Which post do you want to publish?');
                test.done();
              });
    },
};

/**
 * unpublishPost 
 *
 * This is just publishPost, but with the published flag set to false
 */
exports.unpublishPost = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: _id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                            published: true,
                                        }
                             }).
                then(function(post) {
                    _id = post._id;
                    callback();
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },


    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should set the post\'s published flag to false for an authorized user': function(test) {
        test.expect(3);
        actions.publishPost({ resource: 'blogs', write: true },
                            { content: { id: _id, published: false } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.equal(post.published, false);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should set the post\'s published flag to false for an admin': function(test) {
        test.expect(3);
        actions.publishPost({ resource: 'blogs', write: true },
                            { content: { id: _id, published: false } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.equal(post.published, false);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should do nothing for an unauthorized agent': function(test) {
        test.expect(1);
        actions.publishPost({ resource: 'blogs' },
                            { content: { id: _id, published: false } }).
            then(function(ack) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post\'s ID is not included in the message content': function(test) {
        test.expect(1);
        actions.publishPost({ resource: 'blogs', write: true }, {}).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.ok(false, 'Shouldn\'t get here');
                    test.done();
                  });
              }).
            catch(function(err) {
                test.equal(err, 'Which post do you want to publish?');
                test.done();
              });
    },
};

/**
 * saveComment
 */
exports.saveComment = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: _id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                            published: true,
                                        }
                             }).
                then(function(post) {
                    _id = post._id;
                    callback();
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },

    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should save a document to the comment collection for an authorized agent': function(test) {
        test.expect(9);

        actions.saveComment({ resource: 'blogs', write: true },
                            { content: {
                                           postId: _id,
                                           byline: 'Chief Wiggum',
                                           body: 'That\'s right, Ralphy',
                                       }
                            }).
            then(function(comment) {
                test.equal(comment.postId.toString(), _id.toString());
                test.equal(comment.byline, 'Chief Wiggum');
                test.equal(comment.body, 'That\'s right, Ralphy');
                test.ok(!!comment.date);

                // Make sure the post has been saved 
                blogDb.commentModel.find({}, function(err, comment) {
                    test.equal(comment.length, 1);
                    test.equal(comment[0].postId.toString(), _id.toString());
                    test.equal(comment[0].byline, 'Chief Wiggum');
                    test.equal(comment[0].body, 'That\'s right, Ralphy');
                    test.ok(!!comment[0].date);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Should save a document to the comment collection for an admin': function(test) {
        test.expect(9);

        actions.saveComment({ resource: 'blogs', write: true },
                            { content: {
                                           postId: _id,
                                           byline: 'Chief Wiggum',
                                           body: 'That\'s right, Ralphy',
                                       }
                            }).
            then(function(comment) {
                test.equal(comment.postId.toString(), _id.toString());
                test.equal(comment.byline, 'Chief Wiggum');
                test.equal(comment.body, 'That\'s right, Ralphy');
                test.ok(!!comment.date);

                // Make sure the post has been saved 
                blogDb.commentModel.find({}, function(err, comment) {
                    test.equal(comment.length, 1);
                    test.equal(comment[0].postId.toString(), _id.toString());
                    test.equal(comment[0].byline, 'Chief Wiggum');
                    test.equal(comment[0].body, 'That\'s right, Ralphy');
                    test.ok(!!comment[0].date);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Should not save a document to the collection if not authorized': function(test) {
        test.expect(1);
        actions.saveComment({ resource: 'blogs' },
                            { content: {
                                           postId: _id,
                                           byline: 'Chief Wiggum',
                                           body: 'That\'s right, Ralphy',
                                       }
                            }).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post isn\'t included in the message contents': function(test) {
        test.expect(1);
        actions.saveComment({ resource: 'blogs', write: true }, {}).
            then(function(blog) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'Upon what are you commenting? You\'re missing something');
                test.done();
              });
    },
};


/**
 * deleteComment 
 */
exports.deleteComment = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: savedBlog._id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                            published: true,
                                        }
                             }).
                then(function(post) {
                    actions.saveComment({ resource: 'blogs', admin: true },
                                        { content: {
                                                       postId: post._id,
                                                       byline: 'Chief Wiggum',
                                                       body: 'That\'s right, Ralphy',
                                                   }
                                        }).
                        then(function(comment) {
                            _id = comment._id;
                            callback();
                          }).
                        catch(function(err) {
                            console.log(err);
                            callback();
                          });
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },

    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },


    'Should delete the comment from the collection for an authorized user': function(test) {
        test.expect(2);
        actions.deleteComment({ resource: 'blogs', write: true },
                              { content: { id: _id } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.commentModel.find({}, function(err, comments) {
                    test.equal(comments.length, 0);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should delete the comment from the collection for an admin': function(test) {
        test.expect(2);
        actions.deleteComment({ resource: 'blogs', admin: true },
                              { content: { id: _id } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.commentModel.find({}, function(err, comments) {
                    test.equal(comments.length, 0);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should do nothing for an unauthorized agent': function(test) {
        test.expect(1);
        actions.deleteComment({ resource: 'blogs' },
                              { content: { id: _id } }).
            then(function(ack) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post\'s ID is not included in the message content': function(test) {
        test.expect(1);
        actions.deleteComment({ resource: 'blogs', write: true }, {}).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.ok(false, 'Shouldn\'t get here');
                    test.done();
                  });
              }).
            catch(function(err) {
                test.equal(err, 'Which comment do you want to delete?');
                test.done();
              });
    },
};

/**
 * allowComments
 */
exports.allowComments = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: _id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                        }
                             }).
                then(function(post) {
                    _id = post._id;
                    callback();
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },

    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should set the post\'s published flag to true for an authorized user': function(test) {
        test.expect(3);
        actions.allowComments({ resource: 'blogs', write: true },
                              { content: { id: _id, allow: true } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.ok(post.commentsAllowed);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should set the post\'s published flag to true for an admin': function(test) {
        test.expect(3);
        actions.allowComments({ resource: 'blogs', admin: true },
                              { content: { id: _id, allow: true } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.ok(post.commentsAllowed);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should do nothing for an unauthorized agent': function(test) {
        test.expect(1);
        actions.allowComments({ resource: 'blogs' },
                              { content: { id: _id, allow: true } }).
            then(function(ack) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post\'s ID is not included in the message content': function(test) {
        test.expect(1);
        actions.allowComments({ resource: 'blogs', write: true }, {}).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.ok(false, 'Shouldn\'t get here');
                    test.done();
                  });
              }).
            catch(function(err) {
                test.equal(err, 'On which post do you want to modify commenting?');
                test.done();
              });
    },
};

/**
 * disallowComments
 *
 * This is just allowComments with the allow property set to false
 */
exports.disallowComments = {

    setUp: function(callback) {
        var blog = new blogDb.blogModel({ title: 'Deep thoughts...' });
        blog.save(function(err, savedBlog) {
            if (err) {
              console.log(err);
            }
            actions.savePost({ resource: 'blogs', admin: true },
                             { content: {
                                            blogId: _id,
                                            headline: 'My cat\'s breath smells like cat food',
                                            byline: 'Ralph Wiggum',
                                            commentsAllowed: true,
                                        }
                             }).
                then(function(post) {
                    _id = post._id;
                    callback();
                  }).
                catch(function(err) {
                    console.log(err);
                    callback();
                  });
          });
    },

    tearDown: function(callback) {
        blogDb.connection.db.dropDatabase(function(err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
    },

    'Should set the post\'s commentsAllowed flag to true for an authorized user': function(test) {
        test.expect(3);
        actions.allowComments({ resource: 'blogs', write: true },
                              { content: { id: _id, allow: false } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.equal(post.commentsAllowed, false);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should set the post\'s commentsAllowed flag to true for an admin': function(test) {
        test.expect(3);
        actions.allowComments({ resource: 'blogs', admin: true },
                              { content: { id: _id, allow: false } }).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.equal(post.headline, 'My cat\'s breath smells like cat food');
                    test.equal(post.commentsAllowed, false);
                    test.done();
                  });
              }).
            catch(function(err) {
                test.ok(false, err); 
                test.done();
              });
    },

    'Should do nothing for an unauthorized agent': function(test) {
        test.expect(1);
        actions.allowComments({ resource: 'blogs' },
                              { content: { id: _id, allow: false } }).
            then(function(ack) {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    'Should not barf if the post\'s ID is not included in the message content': function(test) {
        test.expect(1);
        actions.allowComments({ resource: 'blogs', write: true }, {}).
            then(function(ack) {
                test.ok(ack);
                blogDb.postModel.findById(_id, function(err, post) {
                    test.ok(false, 'Shouldn\'t get here');
                    test.done();
                  });
              }).
            catch(function(err) {
                test.equal(err, 'On which post do you want to modify commenting?');
                test.done();
              });
    },
};


